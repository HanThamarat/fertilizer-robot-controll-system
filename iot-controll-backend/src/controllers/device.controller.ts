import { Request, Response } from "express";
import { setErrResonse, setResonse } from "../hooks/response";
import { publishCommand } from "../mqtt/mqttBridge";

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
        return setResonse({ res, statusCode: 200, message: "Command sent.", body: { topic, value } });
    } catch (error) {
        return setErrResonse({ res, statusCode: 400, message: (error as Error).message });
    }
};
