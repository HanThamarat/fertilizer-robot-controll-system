import express from "express";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { setErrResonse, setResonse } from "./hooks/response";
import { createServer } from 'node:http';
import { intialSocketIo } from "./socket/socketServer";
import { seedInitialUser } from "./seed/initialUser";
import cors from "cors";
import routes from "./routes";
import { startMqttBridge, stopMqttBridge } from "./mqtt/mqttBridge";


dotenv.config();

const app = express();
const server = createServer(app);
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use("/api", routes);

app.get("/", (req: Request, res: Response) => {
    try {
        return setResonse({
            res,
            statusCode: 200,
            message: `Server is running on port ${port}`
        });
    } catch (error) {
        return setErrResonse({
            res,
            statusCode: 500,
            message: "Server is not running.",
            error
        })
    }
});

const io = intialSocketIo(server);
startMqttBridge(io).catch((error) => console.log("MQTT error :", error));

server.listen(port, async () => {
    try {
        console.log("Server is runing on port :", port);
        await seedInitialUser();
    } catch (error) {
        console.log("Server error :", error);
    }
});

// Hosting platforms send SIGTERM on redeploy: close cleanly instead of being killed.
const shutdown = async (signal: string) => {
    console.log(`${signal} received, shutting down.`);
    io.close();
    await stopMqttBridge();
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5000).unref();
};
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
