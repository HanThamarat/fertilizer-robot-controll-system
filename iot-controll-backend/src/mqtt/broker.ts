import { createServer } from "node:net";
import { Aedes } from "aedes";

/**
 * Starts an MQTT broker inside the backend so the ESP32 can connect straight to this
 * machine (mqtt://<this-pc-ip>:<port>) without installing Mosquitto.
 * If MQTT_USERNAME/MQTT_PASSWORD are set, clients must log in with them.
 */
export const startEmbeddedBroker = async (port: number) => {
    const username = process.env.MQTT_USERNAME;
    const password = process.env.MQTT_PASSWORD;

    const broker = await Aedes.createBroker({
        authenticate: (_client, user, pass, done) => {
            if (!username) return done(null, true);
            const ok = user === username && pass?.toString() === password;
            done(null, ok);
        },
    });

    broker.on("client", (c) => console.log("[mqtt] client connected:", c.id));
    broker.on("clientDisconnect", (c) => console.log("[mqtt] client disconnected:", c.id));

    const server = createServer(broker.handle);
    await new Promise<void>((resolve, reject) => {
        server.once("error", reject);
        server.listen(port, resolve);
    });
    console.log(`[mqtt] embedded broker listening on port ${port}`);
    return broker;
};
