import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      role?: string | null;
    };
  }

  interface User extends DefaultUser {
    role?: string | null;
  }
}

export {};
