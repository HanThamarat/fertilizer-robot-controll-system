import { Response } from "express";

interface setResponseprops {
    res: Response;
    statusCode: number;
    message: string;
    body?: any;
}

interface setErrResponseprops {
    res: Response;
    statusCode: number;
    message: string;
    error?: any;
}

export const setResonse = ({
    res,
    statusCode,
    message,
    body
}: setResponseprops) => {
    res.status(statusCode).json({
        status: statusCode,
        message: message,
        body,
    });
}

export const setErrResonse = ({
    res,
    statusCode,
    message,
    error
}: setErrResponseprops) => {
    res.status(statusCode).json({
        status: statusCode,
        message: message,
        error,
    });
}