import { Request, Response } from "express";
import { setErrResonse, setResonse } from "../hooks/response";
import {
    createUser,
    deleteUser,
    getUserByEmail,
    listUsers,
    toPublicUser,
    updateUser,
    type UserRole,
} from "../database/user.db";
import { currentUser } from "../middleware/requireAuth";
import { hashPassword, verifyPassword } from "../utils/password";

const ROLES: UserRole[] = ["admin", "operator"];
const MIN_PASSWORD = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordProblem = (pw: unknown) =>
    typeof pw !== "string" || pw.length < MIN_PASSWORD ? `Password must be at least ${MIN_PASSWORD} characters.` : null;

const countAdmins = async () => (await listUsers()).filter((u) => u.role === "admin").length;

const fail = (res: Response, error: unknown, message: string) => {
    console.log(message, error);
    return setErrResonse({ res, statusCode: 500, message });
};

/** GET /api/users */
export const getUsers = async (_req: Request, res: Response) => {
    try {
        const users = (await listUsers())
            .map(toPublicUser)
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        return setResonse({ res, statusCode: 200, message: "Users.", body: { users } });
    } catch (error) {
        return fail(res, error, "Couldn't load users.");
    }
};

interface CreateBody {
    email?: string;
    name?: string;
    role?: UserRole;
    password?: string;
}

/** POST /api/users { email, name, role, password } */
export const addUser = async (req: Request<{}, {}, CreateBody>, res: Response) => {
    const email = req.body?.email?.trim().toLowerCase();
    const name = req.body?.name?.trim();
    const role = req.body?.role ?? "operator";
    const password = req.body?.password;

    if (!email || !EMAIL_RE.test(email)) return setErrResonse({ res, statusCode: 400, message: "Enter a valid email." });
    if (!name) return setErrResonse({ res, statusCode: 400, message: "Enter a name." });
    if (!ROLES.includes(role)) return setErrResonse({ res, statusCode: 400, message: "Role must be admin or operator." });
    const pwErr = passwordProblem(password);
    if (pwErr) return setErrResonse({ res, statusCode: 400, message: pwErr });

    try {
        if (await getUserByEmail(email)) {
            return setErrResonse({ res, statusCode: 409, message: `${email} already has an account.` });
        }
        const user = {
            email,
            name,
            role,
            passwordHash: await hashPassword(password!),
            createdAt: new Date().toISOString(),
        };
        await createUser(user);
        return setResonse({ res, statusCode: 201, message: "User added.", body: { user: toPublicUser(user) } });
    } catch (error) {
        return fail(res, error, "Couldn't add the user.");
    }
};

interface UpdateBody {
    name?: string;
    role?: UserRole;
    password?: string;
}

/** PATCH /api/users/:email { name?, role?, password? } */
export const editUser = async (req: Request<{ email: string }, {}, UpdateBody>, res: Response) => {
    const email = req.params.email.trim().toLowerCase();
    const { name, role, password } = req.body ?? {};
    const changes: Parameters<typeof updateUser>[1] = {};

    if (name !== undefined) {
        if (!name.trim()) return setErrResonse({ res, statusCode: 400, message: "Name can't be empty." });
        changes.name = name.trim();
    }
    if (role !== undefined) {
        if (!ROLES.includes(role)) return setErrResonse({ res, statusCode: 400, message: "Role must be admin or operator." });
        changes.role = role;
    }
    if (password !== undefined) {
        const pwErr = passwordProblem(password);
        if (pwErr) return setErrResonse({ res, statusCode: 400, message: pwErr });
        changes.passwordHash = await hashPassword(password);
    }

    try {
        const user = await getUserByEmail(email);
        if (!user) return setErrResonse({ res, statusCode: 404, message: "User not found." });

        if (changes.role === "operator" && user.role === "admin" && (await countAdmins()) <= 1) {
            return setErrResonse({ res, statusCode: 409, message: "This is the only admin. Make someone else admin first." });
        }

        await updateUser(email, changes);
        const updated = { ...user, ...changes };
        return setResonse({ res, statusCode: 200, message: "User updated.", body: { user: toPublicUser(updated) } });
    } catch (error) {
        return fail(res, error, "Couldn't update the user.");
    }
};

/** DELETE /api/users/:email */
export const removeUser = async (req: Request<{ email: string }>, res: Response) => {
    const email = req.params.email.trim().toLowerCase();
    if (email === currentUser(res).email) {
        return setErrResonse({ res, statusCode: 409, message: "You can't delete your own account." });
    }
    try {
        const user = await getUserByEmail(email);
        if (!user) return setErrResonse({ res, statusCode: 404, message: "User not found." });
        if (user.role === "admin" && (await countAdmins()) <= 1) {
            return setErrResonse({ res, statusCode: 409, message: "You can't delete the only admin." });
        }
        await deleteUser(email);
        return setResonse({ res, statusCode: 200, message: "User deleted.", body: { email } });
    } catch (error) {
        return fail(res, error, "Couldn't delete the user.");
    }
};

/** GET /api/auth/me */
export const getMe = (_req: Request, res: Response) =>
    setResonse({ res, statusCode: 200, message: "You.", body: { user: toPublicUser(currentUser(res)) } });

interface PasswordBody {
    currentPassword?: string;
    newPassword?: string;
}

/** PUT /api/auth/me/password { currentPassword, newPassword } */
export const changeMyPassword = async (req: Request<{}, {}, PasswordBody>, res: Response) => {
    const me = currentUser(res);
    const { currentPassword, newPassword } = req.body ?? {};
    if (!currentPassword || !(await verifyPassword(currentPassword, me.passwordHash))) {
        return setErrResonse({ res, statusCode: 400, message: "Current password is incorrect." });
    }
    const pwErr = passwordProblem(newPassword);
    if (pwErr) return setErrResonse({ res, statusCode: 400, message: pwErr });
    try {
        await updateUser(me.email, { passwordHash: await hashPassword(newPassword!) });
        return setResonse({ res, statusCode: 200, message: "Password changed." });
    } catch (error) {
        return fail(res, error, "Couldn't change your password.");
    }
};
