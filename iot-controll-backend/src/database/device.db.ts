import { get, push, ref, set } from "firebase/database";
import { firebaseDB } from "../conf/firebase";
import type { SensorValue } from "../mqtt/topics";

/**
 * Firebase layout:
 *   deviceState/<deviceId>/<channel>   { value, at }                               latest value per channel
 *   sensorLogs/<deviceId>/<pushId>     { channel, value, at }                      every change the robot reports
 *   commandLogs/<pushId>               { deviceId, channel, value, topic, by, at } every command sent from the dashboard
 *   robotStatus/<robotId>              { online, at }                              last online/offline the robot reported
 */

export interface SensorReading {
    deviceId: string;
    channel: number;
    value: SensorValue;
    at: number;
}

export interface CommandLog {
    deviceId: string;
    channel: number;
    value: SensorValue;
    topic: string;
    /** Email of the user who sent it. */
    by: string;
    at: number;
}

/** Stores the reading as the channel's current state and appends it to the device's history. */
export const saveSensorReading = async ({ deviceId, channel, value, at }: SensorReading): Promise<void> => {
    await Promise.all([
        set(ref(firebaseDB, `deviceState/${deviceId}/${channel}`), { value, at }),
        push(ref(firebaseDB, `sensorLogs/${deviceId}`), { channel, value, at }),
    ]);
};

export const saveCommandLog = async (log: CommandLog): Promise<void> => {
    await push(ref(firebaseDB, "commandLogs"), log);
};

/** Last known value of every channel, so state survives a server restart. */
export const loadDeviceState = async (): Promise<SensorReading[]> => {
    const snapshot = await get(ref(firebaseDB, "deviceState"));
    if (!snapshot.exists()) return [];
    const readings: SensorReading[] = [];
    const devices = snapshot.val() as Record<string, Record<string, { value: SensorValue; at: number }> | Array<{ value: SensorValue; at: number } | null>>;
    for (const [deviceId, channels] of Object.entries(devices)) {
        // Firebase returns numeric keys as an array (index 0 empty since channels are 1-based).
        for (const [channel, entry] of Object.entries(channels ?? {})) {
            if (entry) readings.push({ deviceId, channel: Number(channel), value: entry.value, at: entry.at });
        }
    }
    return readings;
};

export interface RobotStatus {
    robotId: string;
    online: boolean;
    at: number;
}

export const saveRobotStatus = async ({ robotId, online, at }: RobotStatus): Promise<void> => {
    await set(ref(firebaseDB, `robotStatus/${robotId}`), { online, at });
};

export const loadRobotStatus = async (robotId: string): Promise<RobotStatus | null> => {
    const snapshot = await get(ref(firebaseDB, `robotStatus/${robotId}`));
    if (!snapshot.exists()) return null;
    const { online, at } = snapshot.val() as { online: boolean; at: number };
    return { robotId, online: Boolean(online), at };
};
