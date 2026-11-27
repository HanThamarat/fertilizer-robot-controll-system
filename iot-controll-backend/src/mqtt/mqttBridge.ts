import mqtt, { type MqttClient } from "mqtt";
import type { Server } from "socket.io";
import { startEmbeddedBroker } from "./broker";
import {
    DEVICE_CHANNELS,
    ROBOT_ID,
    SENSOR_SUBSCRIPTION,
    STATUS_SUBSCRIPTION,
    commandTopic,
    isValidChannel,
    parsePayload,
    parseTopic,
    type SensorValue,
} from "./topics";
import {
    loadDeviceState,
    loadRobotStatus,
    saveRobotStatus,
    saveSensorReading,
    type RobotStatus,
    type SensorReading,
} from "../database/device.db";

let client: MqttClient | null = null;
/** Latest reading per channel, replayed to browsers when they connect. */
const latest = new Map<string, SensorReading>();
/** Last online/offline the robot reported (null = never heard from it). */
let robotStatus: RobotStatus | null = null;

/** Everything the dashboard needs to draw the current state, served by GET /api/devices/state. */
export const getCurrentState = () => ({
    mqttConnected: Boolean(client?.connected),
    robot: robotStatus ?? { robotId: ROBOT_ID, online: false, at: null },
    readings: [...latest.values()],
});

/**
 * Connects to MQTT and forwards every sensor reading to the dashboard as the
 * Socket.IO event `sensor:reading`.
 *
 * MQTT_URL set   -> use that broker (e.g. mqtt://broker.hivemq.com:1883)
 * MQTT_URL unset -> start an embedded broker on MQTT_PORT (default 1883) and use it
 */
export const startMqttBridge = async (io: Server) => {
    try {
        for (const r of await loadDeviceState()) latest.set(`${r.deviceId}:${r.channel}`, r);
    } catch (error) {
        console.log("[db] couldn't load device state:", error);
    }
    try {
        robotStatus = await loadRobotStatus(ROBOT_ID);
    } catch (error) {
        console.log("[db] couldn't load robot status:", error);
    }

    let url = process.env.MQTT_URL?.trim();
    if (url && !/^[a-z]+:\/\//i.test(url)) {
        // Bare host like "xyz.cloudamqp.com": add scheme + port (8883 = TLS).
        const port = Number(process.env.MQTT_PORT) || 1883;
        url = `${port === 8883 ? "mqtts" : "mqtt"}://${url}:${port}`;
    }
    if (!url) {
        const port = Number(process.env.MQTT_PORT) || 1883;
        await startEmbeddedBroker(port);
        url = `mqtt://localhost:${port}`;
    }

    client = mqtt.connect(url, {
        clientId: `fertbot-server-${Math.random().toString(16).slice(2, 8)}`,
        username: process.env.MQTT_USERNAME || undefined,
        password: process.env.MQTT_PASSWORD || undefined,
        reconnectPeriod: 3000,
    });

    client.on("connect", () => {
        console.log("[mqtt] bridge connected to", url);
        client!.subscribe([SENSOR_SUBSCRIPTION, STATUS_SUBSCRIPTION], { qos: 1 });
    });
    client.on("error", (err) => console.log("[mqtt] error:", describeError(err)));

    client.on("message", (topic, payload) => {
        const parsed = parseTopic(topic);
        if (!parsed) return;

        if (parsed.kind === "status") {
            const online = payload.toString().trim().toLowerCase() === "online";
            console.log(`[mqtt] ${parsed.robotId} is ${online ? "online" : "offline"}`);
            if (parsed.robotId !== ROBOT_ID) return;
            // A retained status is re-delivered on every reconnect: only store real changes.
            if (robotStatus?.online === online) return;
            robotStatus = { robotId: parsed.robotId, online, at: Date.now() };
            io.emit("robot:status", robotStatus);
            saveRobotStatus(robotStatus).catch((error) => console.log("[db] couldn't save robot status:", error));
            return;
        }

        if (!isValidChannel(parsed.deviceId, parsed.channel)) {
            console.log(`[mqtt] ignored unknown sensor topic: ${topic}`);
            return;
        }

        const { value, at } = parsePayload(payload.toString());
        const reading: SensorReading = {
            deviceId: parsed.deviceId,
            channel: parsed.channel,
            value,
            at: at ?? Date.now(),
        };
        const key = `${reading.deviceId}:${reading.channel}`;
        const changed = latest.get(key)?.value !== reading.value;
        latest.set(key, reading);
        io.emit("sensor:reading", reading);

        // Only changes are stored, so a sensor repeating the same value doesn't flood the database.
        if (changed) {
            saveSensorReading(reading).catch((error) => console.log("[db] couldn't save reading:", error));
        }
    });

    io.on("connection", (socket) => {
        if (robotStatus) socket.emit("robot:status", robotStatus);
        for (const reading of latest.values()) socket.emit("sensor:reading", reading);
    });
};

/** Network errors (e.g. AggregateError from IPv4+IPv6 attempts) often have an empty message. */
const describeError = (err: Error & { code?: string | number; errors?: Error[] }): string => {
    if (err.errors?.length) return err.errors.map((e) => describeError(e)).join("; ");
    return [err.code, err.message].filter(Boolean).join(" ") || String(err);
};

/** Disconnects from the broker (used on shutdown). */
export const stopMqttBridge = () =>
    new Promise<void>((resolve) => (client ? client.end(false, {}, () => resolve()) : resolve()));

/** Publishes a command to the ESP32 on <prefix>/<robotId>/cmd/<deviceId>/<channel>. */
export const publishCommand = (deviceId: string, channel: number, value: SensorValue) => {
    if (!client?.connected) throw new Error("MQTT is not connected.");
    if (!(deviceId in DEVICE_CHANNELS) || !isValidChannel(deviceId, channel)) {
        throw new Error(`Unknown device/channel: ${deviceId}/${channel}`);
    }
    const topic = commandTopic(deviceId, channel);
    client.publish(topic, String(value), { qos: 1 });
    return topic;
};
