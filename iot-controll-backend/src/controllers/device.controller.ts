import { Request, Response } from "express";
import { setErrResonse, setResonse } from "../hooks/response";
import { getCurrentState, publishCommand } from "../mqtt/mqttBridge";
import { currentUser } from "../middleware/requireAuth";
import { saveCommandLog } from "../database/device.db";

interface CommandBody {
    channel?: number;
    value?: number | boolean | string;
}

/** POST /api/devices/:deviceId/command  { channel: 1, value: true } -> MQTT cmd topic */
export const sendCommand = (req: Request<{ deviceId: string }, {}, CommandBody>, res: Response) => {
    const channel = Number(req.body?.channel ?? 1);
    const value = req.body?.value;
    if (value === undefined) {
        return setErrResonse({ res, statusCode: 400, message: "Body needs a value, e.g. { \"channel\": 1, \"value\": true }." });
    }
    try {
        const topic = publishCommand(req.params.deviceId, channel, value);
        saveCommandLog({
            deviceId: req.params.deviceId,
            channel,
            value,
            topic,
            by: currentUser(res).email,
            at: Date.now(),
        }).catch((error) => console.log("[db] couldn't save command:", error));
        return setResonse({ res, statusCode: 200, message: "Command sent.", body: { topic, value } });
    } catch (error) {
        return setErrResonse({ res, statusCode: 400, message: (error as Error).message });
    }
};

/** GET /api/devices/state -> robot online status + last value of every channel (survives restarts via Firebase). */
export const getDeviceState = (_req: Request, res: Response) =>
    setResonse({ res, statusCode: 200, message: "Current device state.", body: getCurrentState() });
