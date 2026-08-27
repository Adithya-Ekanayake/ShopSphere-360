export type Role = "Admin" | "Manager" | "Analyst";

export interface User {
  UserKey: number;
  Username: string;
  Email: string;
  Role: Role;
  FullName: string;
}

export interface LoginInput {
  identifier: string; // Username or Email
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
