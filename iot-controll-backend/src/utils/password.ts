import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (pw: string, salt: string, len: number) => Promise<Buffer>;
const KEY_LEN = 64;

/** Hash a password as "salt:hash" (scrypt, hex). Never store plain passwords. */
export const hashPassword = async (password: string): Promise<string> => {
    const salt = randomBytes(16).toString("hex");
    const hash = await scrypt(password, salt, KEY_LEN);
    return `${salt}:${hash.toString("hex")}`;
};

export const verifyPassword = async (password: string, stored: string): Promise<boolean> => {
    const [salt, hashHex] = stored.split(":");
    if (!salt || !hashHex) return false;
    const expected = Buffer.from(hashHex, "hex");
    const actual = await scrypt(password, salt, expected.length);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
};
