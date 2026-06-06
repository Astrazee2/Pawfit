import bcrypt from "bcryptjs";

const adminPasswordHash = bcrypt.hashSync("admin123", 10);

export const defaultUsers = [
  {
    _id: "fallback-admin",
    id: "fallback-admin",
    name: "Admin User",
    email: "admin@pawfit.com",
    password: adminPasswordHash,
    role: "admin",
  },
];

export const cloneDefaultUsers = () =>
  defaultUsers.map((user) => ({ ...user }));
