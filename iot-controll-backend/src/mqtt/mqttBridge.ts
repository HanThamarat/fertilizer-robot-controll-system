import mqtt, { type MqttClient } from "mqtt";
import type { Server } from "socket.io";
import { startEmbeddedBroker } from "./broker";
import {
    DEVICE_CHANNELS,
    SENSOR_SUBSCRIPTION,
    STATUS_SUBSCRIPTION,
    commandTopic,
    isValidChannel,
    parsePayload,
    parseTopic,
    type SensorValue,
} from "./topics";

interface SensorReading {
    deviceId: string;
    channel: number;
    value: SensorValue;
    at: number;
}

let client: MqttClient | null = null;
/** Latest reading per channel, replayed to browsers when they connect. */
const latest = new Map<string, SensorReading>();

/**
 * Connects to MQTT and forwards every sensor reading to the dashboard as the
 * Socket.IO event `sensor:reading`.
 *
 * MQTT_URL set   -> use that broker (e.g. mqtt://broker.hivemq.com:1883)
 * MQTT_URL unset -> start an embedded broker on MQTT_PORT (default 1883) and use it
 */
export const startMqttBridge = async (io: Server) => {
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
    client.on("error", (err) => console.log("[mqtt] error:", err.message));

    client.on("message", (topic, payload) => {
        const parsed = parseTopic(topic);
        if (!parsed) return;

        if (parsed.kind === "status") {
            console.log(`[mqtt] ${parsed.robotId} is ${payload.toString()}`);
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
        latest.set(`${reading.deviceId}:${reading.channel}`, reading);
        io.emit("sensor:reading", reading);
    });

    io.on("connection", (socket) => {
        for (const reading of latest.values()) socket.emit("sensor:reading", reading);
    });
};

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
