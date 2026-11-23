import { createUser, getUserByEmail } from "../database/user.db";
import { hashPassword } from "../utils/password";

/**
 * Creates the first admin from INITIAL_USER_* in .env, once.
 * If that email already exists in Firebase, nothing is changed.
 */
export const seedInitialUser = async (): Promise<void> => {
    const email = process.env.INITIAL_USER_EMAIL?.trim().toLowerCase();
    const password = process.env.INITIAL_USER_PASSWORD;
    const name = process.env.INITIAL_USER_NAME?.trim() || "Admin";

    if (!email || !password) {
        console.log("Initial user: INITIAL_USER_EMAIL / INITIAL_USER_PASSWORD not set, skipped.");
        return;
    }

    const existing = await getUserByEmail(email);
    if (existing) {
        console.log(`Initial user: ${email} already exists, skipped.`);
        return;
    }

    await createUser({
        email,
        name,
        role: "admin",
        passwordHash: await hashPassword(password),
        createdAt: new Date().toISOString(),
    });
    console.log(`Initial user: created ${email} (admin).`);
};
