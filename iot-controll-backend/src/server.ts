import express from "express";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { setErrResonse, setResonse } from "./hooks/response";
import { createServer } from 'node:http';
import { intialSocketIo } from "./socket/socketServer";


dotenv.config();

const app = express();
const server = createServer(app);
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

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

intialSocketIo(server);

server.listen(port, async () => {
    try {
        console.log("Server is runing on port :", port);
    } catch (error) {
        console.log("Server error :", error);
    }
});