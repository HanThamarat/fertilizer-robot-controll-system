import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { setErrResonse } from "../hooks/response";
import { getUserByEmail, type UserRecord } from "../database/user.db";

/** The signed-in user, set by requireAuth. */
export const currentUser = (res: Response) => res.locals.user as UserRecord;

/**
 * Rejects requests without a valid `Authorization: Bearer <token>` from /api/auth/signin.
 * The user is re-read from the database on every request, so a deleted user or a
 * changed role takes effect immediately instead of when the token expires.
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const secret = process.env.JWT_SECRET;
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!secret || !token) {
        return setErrResonse({ res, statusCode: 401, message: "Sign in required." });
    }
    let email: string | undefined;
    try {
        email = (jwt.verify(token, secret) as jwt.JwtPayload).sub;
    } catch {
        return setErrResonse({ res, statusCode: 401, message: "Session expired. Sign in again." });
    }
    try {
        const user = email ? await getUserByEmail(email) : null;
        if (!user) {
            return setErrResonse({ res, statusCode: 401, message: "This account no longer exists." });
        }
        res.locals.user = user;
        next();
    } catch (error) {
        console.log("Auth lookup error :", error);
        return setErrResonse({ res, statusCode: 500, message: "Couldn't check your sign-in. Try again." });
    }
};

/** Use after requireAuth. */
export const requireAdmin = (_req: Request, res: Response, next: NextFunction) => {
    if (currentUser(res).role !== "admin") {
        return setErrResonse({ res, statusCode: 403, message: "Only admins can do this." });
    }
    next();
};
