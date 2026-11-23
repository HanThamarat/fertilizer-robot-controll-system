import { get, ref, set } from "firebase/database";
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
