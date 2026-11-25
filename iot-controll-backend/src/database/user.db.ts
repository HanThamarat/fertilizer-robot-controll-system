import { get, ref, remove, set, update } from "firebase/database";
import { firebaseDB } from "../conf/firebase";

export type UserRole = "admin" | "operator";

export interface UserRecord {
    email: string;
    name: string;
    role: UserRole;
    passwordHash: string;
    createdAt: string;
}

/** Firebase keys can't contain "." so emails are stored as "name@site,com". */
export const emailToKey = (email: string) => email.trim().toLowerCase().replace(/\./g, ",");

export const getUserByEmail = async (email: string): Promise<UserRecord | null> => {
    const snapshot = await get(ref(firebaseDB, `users/${emailToKey(email)}`));
    return snapshot.exists() ? (snapshot.val() as UserRecord) : null;
};

export const createUser = async (user: UserRecord): Promise<void> => {
    await set(ref(firebaseDB, `users/${emailToKey(user.email)}`), user);
};

export const listUsers = async (): Promise<UserRecord[]> => {
    const snapshot = await get(ref(firebaseDB, "users"));
    if (!snapshot.exists()) return [];
    return Object.values(snapshot.val() as Record<string, UserRecord>);
};

export const updateUser = async (
    email: string,
    changes: Partial<Pick<UserRecord, "name" | "role" | "passwordHash">>,
): Promise<void> => {
    await update(ref(firebaseDB, `users/${emailToKey(email)}`), changes);
};

export const deleteUser = async (email: string): Promise<void> => {
    await remove(ref(firebaseDB, `users/${emailToKey(email)}`));
};

/** Safe shape for API responses (no password hash). */
export const toPublicUser = (u: UserRecord) => ({
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt,
});
