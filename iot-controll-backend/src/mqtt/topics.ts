/**
 * MQTT topic layout shared with the ESP32 firmware.
 *
 *   <prefix>/<robotId>/sensor/<deviceId>/<channel>   ESP32 -> server   sensor reading
 *   <prefix>/<robotId>/cmd/<deviceId>/<channel>      server -> ESP32   command
 *   <prefix>/<robotId>/status                        ESP32 -> server   "online" / "offline" (retained, LWT)
 *
 * Robot power: cmd/power/1 "true"/"false" turns the robot on/off; the ESP32 reports
 * the actual state back on sensor/power/1 (retained recommended).
 *
 * Channels are 1-based. Defaults: prefix "fertbot", robotId "robot1".
 */
export const TOPIC_PREFIX = process.env.MQTT_TOPIC_PREFIX || "fertbot";
export const ROBOT_ID = process.env.MQTT_ROBOT_ID || "robot1";

/** Sensors on the robot and their channel counts. Keep in sync with the frontend deviceCatalog. */
export const DEVICE_CHANNELS: Record<string, number> = {
    "power": 1,
    "movement": 4,
    "camera-live": 1,
    "camera-movement": 4,
    "battery": 1,
    "total-fluffy": 1,
    "truck-door": 1,
};

export const SENSOR_SUBSCRIPTION = `${TOPIC_PREFIX}/+/sensor/+/+`;
export const STATUS_SUBSCRIPTION = `${TOPIC_PREFIX}/+/status`;

export const commandTopic = (deviceId: string, channel: number, robotId = ROBOT_ID) =>
    `${TOPIC_PREFIX}/${robotId}/cmd/${deviceId}/${channel}`;

export const isValidChannel = (deviceId: string, channel: number) =>
    Number.isInteger(channel) && channel >= 1 && channel <= (DEVICE_CHANNELS[deviceId] ?? 0);

export type ParsedTopic =
    | { kind: "sensor"; robotId: string; deviceId: string; channel: number }
    | { kind: "status"; robotId: string };

export const parseTopic = (topic: string): ParsedTopic | null => {
    const parts = topic.split("/");
    if (parts[0] !== TOPIC_PREFIX) return null;
    if (parts.length === 5 && parts[2] === "sensor") {
        return { kind: "sensor", robotId: parts[1], deviceId: parts[3], channel: Number(parts[4]) };
    }
    if (parts.length === 3 && parts[2] === "status") {
        return { kind: "status", robotId: parts[1] };
    }
    return null;
};

export type SensorValue = number | boolean | string;

/**
 * Accepts plain payloads ("82", "true", "open") or JSON ({"value": 82, "at": 1732500000000}).
 */
export const parsePayload = (raw: string): { value: SensorValue; at?: number } => {
    const text = raw.trim();
    if (text.startsWith("{")) {
        try {
            const obj = JSON.parse(text);
            if (obj && "value" in obj) {
                return { value: obj.value, at: typeof obj.at === "number" ? obj.at : undefined };
            }
        } catch {
            /* fall through to plain parsing */
        }
    }
    const lower = text.toLowerCase();
    if (["true", "on", "open", "moving"].includes(lower)) return { value: true };
    if (["false", "off", "close", "closed", "idle"].includes(lower)) return { value: false };
    if (text !== "" && !Number.isNaN(Number(text))) return { value: Number(text) };
    return { value: text };
};
