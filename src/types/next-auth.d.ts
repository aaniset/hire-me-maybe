import { User } from "next-auth";
import { JWT } from "next-auth/jwt";

type UserId = string;

declare module "next-auth" {
  interface Session {
    user: User & {
      id: UserId;
      accessToken?: string;
      refreshToken?: string;
      expiresIn: string;
      gmailConnected?: boolean;
      gmailAccessToken?: string;
      gmailAccount?: string;
      gmailProfileImg?: string;
    };
    error?: "GmailRefreshTokenError";
  }
}

// declare module "next-auth/jwt" {
//   interface JWT {
//     id: UserId;
//     accessToken?: string;
//     refreshToken?: string;
//     expiresIn: string;
//   }
// }

// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//       accessToken?: string;
//       refreshToken?: string;
//       expiresIn: string;
//       gmailConnected?: boolean;
//       gmailAccessToken?: string;
//     } & DefaultSession["user"];
//   }
// }
