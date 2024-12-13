import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { db } from "@/lib/db";
import { ObjectId } from "mongodb";

async function refreshGmailToken(account: any): Promise<{
  access_token: string;
  expires_at: number;
  refresh_token: string;
} | null> {
  try {
    console.log("refreshing the gmail token");
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.AUTH_GOOGLE_ID!,
        client_secret: process.env.AUTH_GOOGLE_SECRET!,
        grant_type: "refresh_token",
        refresh_token: account.gmailRefreshToken!,
      }),
    });

    const tokens: {
      access_token: string;
      expires_in: number;
      refresh_token?: string;
    } = await response.json();

    if (!response.ok) throw tokens;

    return {
      access_token: tokens.access_token,
      expires_at: Math.floor(Date.now() / 1000 + tokens.expires_in),
      refresh_token: tokens.refresh_token ?? account.gmailRefreshToken!,
    };
  } catch (error) {
    //todo logout the gmail account and redirect to resync gmail account
    console.error("Error refreshing access token", error);
    return null;
  }
}
async function updateAccountWithGmailInfo(
  client: any,
  userId: string | undefined,
  updateFields: any
) {
  await client
    .db()
    .collection("accounts")
    .updateOne(
      { userId: new ObjectId(userId), provider: "google" },
      { $set: updateFields }
    );
}
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(db),
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      authorization: { params: { access_type: "offline", prompt: "consent" } },
    }),
  ],
  callbacks: {
    // async signIn({ user, account }) {
    //   if (account && account.provider === "google") {
    // const session = await auth();
    //     const client = await db;
    //     const isGmailScope = account?.scope?.includes(
    //       "https://www.googleapis.com/auth/gmail.readonly"
    //     );
    //     if (isGmailScope) {
    //       if (user.email === session?.user.email) {
    //         let existingAccount = await client
    //           .db()
    //           .collection("accounts")
    //           .findOne({
    //             userId: new ObjectId(session?.user.id as string),
    //             provider: "google",
    //           });
    //         const updateFields: any = {
    //           access_token: account.access_token,
    //           expires_at: account.expires_at,
    //           refresh_token:
    //             account.refresh_token ?? existingAccount?.refresh_token,
    //           scope: account.scope,
    //           gmailConnected: true,
    //           gmailAccessToken: account.access_token,
    //           gmailRefreshToken: account.refresh_token,
    //           gmailTokenExpiry: account.expires_at,
    //           gmailAccount: user.email,
    //         };
    //         await client
    //           .db()
    //           .collection("accounts")
    //           .updateOne({ _id: existingAccount?._id }, { $set: updateFields });
    //       } else {
    //         const updateFields: any = {
    //           gmailConnected: true,
    //           gmailAccessToken: account.access_token,
    //           gmailRefreshToken: account.refresh_token,
    //           gmailTokenExpiry: account.expires_at,
    //           gmailAccount: user.email,
    //         };
    //         await client
    //           .db()
    //           .collection("accounts")
    //           .updateOne(
    //             {
    //               userId: new ObjectId(session?.user.id as string),
    //               provider: "google",
    //             },
    //             { $set: updateFields }
    //           );
    //       }
    //     }
    //   }
    //   return true;
    // },
    async signIn({ user, account }) {
      console.log("sign in account:", user);
      console.log("sign in account:", account);
      if (account?.provider === "google") {
        const session = await auth();
        const client = await db;
        const isGmailScope = account.scope?.includes(
          "https://www.googleapis.com/auth/gmail.readonly"
        );

        if (isGmailScope) {
          const updateFields: any = {
            gmailConnected: true,
            gmailAccessToken: account.access_token,
            gmailRefreshToken: account.refresh_token,
            gmailTokenExpiry: new Date((account.expires_at ?? 0) * 1000),
            gmailAccount: user.email,
            gmailProfileImg: user.image,
          };

          if (user.email === session?.user.email) {
            updateFields.access_token = account.access_token;
            updateFields.expires_at = account.expires_at;
            updateFields.refresh_token = account.refresh_token;
            updateFields.scope = account.scope;
          }

          await updateAccountWithGmailInfo(
            client,
            session?.user.id,
            updateFields
          );
          return "/gmail-connected";
        }
      }
      return true;
    },
    async session({ session, user }) {
      console.log("debug sesssion token :", session);
      console.log("debug sesssion user :", user);
      const client = await db;
      const account = await client
        .db()
        .collection("accounts")
        .findOne({
          userId: new ObjectId(user.id as string),
          provider: "google",
        });

      if (account) {
        session.user.gmailConnected = account.gmailConnected || false;

        if (account.gmailConnected) {
          if (account.gmailTokenExpiry < new Date()) {
            const newTokens = await refreshGmailToken(account);
            if (newTokens) {
              await client
                .db()
                .collection("accounts")
                .updateOne(
                  {
                    userId: new ObjectId(user.id as string),
                    provider: "google",
                  },

                  {
                    $set: {
                      gmailAccessToken: newTokens.access_token,
                      gmailRefreshToken:
                        newTokens.refresh_token || account.gmailRefreshToken,
                      gmailTokenExpiry: new Date(newTokens.expires_at * 1000),
                    },
                  }
                );
              session.user.gmailAccessToken = newTokens.access_token;
              session.user.gmailAccount = account.gmailAccount;
              session.user.gmailProfileImg = account.gmailProfileImg;
            } else {
              session.error = "GmailRefreshTokenError";
            }
          } else {
            // session.user.gmailAccessToken = account.gmailAccessToken;
            session.user.gmailAccount = account.gmailAccount;
            session.user.gmailProfileImg = account.gmailProfileImg;
          }
        }
      }

      return session;
    },
  },
});
