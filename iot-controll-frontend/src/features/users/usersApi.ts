import axiosClient from "../../api/axiosClient";

export type Role = "admin" | "operator";

export interface User {
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface NewUser {
  email: string;
  name: string;
  role: Role;
  password: string;
}

export type UserChanges = Partial<Pick<User, "name" | "role">> & { password?: string };

const path = (email: string) => `/users/${encodeURIComponent(email)}`;

export const fetchUsers = async () => (await axiosClient.get("/users")).data.body.users as User[];

export const createUser = async (u: NewUser) => (await axiosClient.post("/users", u)).data.body.user as User;

export const updateUser = async (email: string, changes: UserChanges) =>
  (await axiosClient.patch(path(email), changes)).data.body.user as User;

export const deleteUser = (email: string) => axiosClient.delete(path(email));

export const changeMyPassword = (currentPassword: string, newPassword: string) =>
  axiosClient.put("/auth/me/password", { currentPassword, newPassword });

export const ROLE_INFO: Record<Role, { label: string; hint: string }> = {
  admin: { label: "Admin", hint: "Can control the robot and manage users." },
  operator: { label: "Operator", hint: "Can monitor and control the robot." },
};

export const MIN_PASSWORD = 8;
