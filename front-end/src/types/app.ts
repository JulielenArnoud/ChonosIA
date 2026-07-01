export type Screen = "landing" | "auth" | "dashboard";
export type AuthMode = "login" | "register";
export type Role = "admin" | "user";

export interface AppUser {
  email: string;
  name: string;
  role: Role;
}

export interface DocFile {
  id: string;
  name: string;
  type: "pdf" | "image";
  size: string;
  date: string;
  ownerEmail: string;
  ownerName: string;
  previewUrl?: string;
}
