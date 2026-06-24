import type { AppUser } from "../../../types/app";

export const CREDENTIALS: Record<string, { password: string; user: AppUser }> = {
  "admin@gmail.com": {
    password: "Adm123",
    user: { email: "admin@gmail.com", name: "Administrador", role: "admin" },
  },
  "usuario@gmail.com": {
    password: "Usuario123",
    user: { email: "usuario@gmail.com", name: "João Almeida", role: "user" },
  },
};
