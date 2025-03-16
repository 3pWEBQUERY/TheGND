import NextAuth, { DefaultSession } from "next-auth";
import { AccountType } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      accountType: AccountType;
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
    accountType: AccountType;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    accountType: AccountType;
  }
}
