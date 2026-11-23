import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { setErrResonse, setResonse } from "../hooks/response";
import { getUserByEmail } from "../database/user.db";
import { verifyPassword } from "../utils/password";

interface SignInBody {
    email?: string;
    password?: string;
}

const TOKEN_TTL = "7d";

export const signIn = async (req: Request<{}, {}, SignInBody>, res: Response) => {
    try {
        const email = req.body?.email?.trim().toLowerCase();
        const password = req.body?.password;

        if (!email || !password) {
            return setErrResonse({ res, statusCode: 400, message: "Enter your email and password." });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return setErrResonse({ res, statusCode: 500, message: "Sign-in isn't configured on the server (JWT_SECRET missing)." });
        }

        const user = await getUserByEmail(email);
        const valid = user ? await verifyPassword(password, user.passwordHash) : false;
        if (!user || !valid) {
            return setErrResonse({ res, statusCode: 401, message: "Incorrect email or password." });
        }

        const token = jwt.sign({ email: user.email, role: user.role }, secret, {
            subject: user.email,
            expiresIn: TOKEN_TTL,
        });

        return setResonse({
            res,
            statusCode: 200,
            message: "Signed in.",
            body: {
                user: { email: user.email, name: user.name, role: user.role },
                token,
            },
        });
    } catch (error) {
        console.log("Sign-in error :", error);
        return setErrResonse({ res, statusCode: 500, message: "Sign-in failed. Try again." });
    }
};
