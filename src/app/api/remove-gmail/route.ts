// import { ObjectId } from "mongodb";
// import { db } from "@/lib/db";
// import { z } from "zod";
// import { google } from "googleapis";
// import { auth } from "@/auth";

// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   `${process.env.NEXTAUTH_URL}/api/gmail-callback`
// );

// export async function POST(req: Request, res: Response) {
//   try {
//     if (req.method !== "POST") {
//       return new Response(JSON.stringify({ message: "Method Not Allowed" }), {
//         status: 405,
//       });
//     }

//     const session = await auth();
//     if (!session) {
//       return new Response(JSON.stringify({ error: "Unauthorized" }), {
//         status: 401,
//       });
//     }
//     const userId = session?.user.id;
//     const client = await db;
//     const account = await client
//       .db()
//       .collection("accounts")
//       .findOne({ userId: new ObjectId(userId) });
//     const accessToken = account?.gmailAccessToken;
//     console.log("accessToken", accessToken);

//     const scopes = ["https://www.googleapis.com/auth/gmail.readonly"];

//     const authUrl = oauth2Client.generateAuthUrl({
//       access_type: "offline",
//       scope: scopes,
//       prompt: "consent",
//     });
//     return new Response(JSON.stringify(authUrl), {
//       status: 200,
//     });
//   } catch (error) {
//     console.error("Error fetching checkout:", error);
//     return new Response("Error fetching checkout", { status: 422 });
//   }
// }
import { ObjectId } from "mongodb";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(req: Request, res: Response) {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ message: "Method Not Allowed" }), {
        status: 405,
      });
    }

    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }
    const userId = session?.user.id;
    const client = await db;
    const accountsCollection = client.db().collection("accounts");

    const account = await accountsCollection.findOne({
      userId: new ObjectId(userId),
    });
    const accessToken = account?.gmailAccessToken;

    if (accessToken) {
      // Revoke the token
      try {
        await revokeToken(accessToken);
      } catch (error) {
        console.error("Error revoking token:", error);
      }
    }

    // Remove Gmail-related data from the database
    const updateResult = await accountsCollection.updateOne(
      { userId: new ObjectId(userId) },
      {
        $unset: {
          gmailAccessToken: "",
          gmailAccount: "",
          gmailRefreshToken: "",
          gmailTokenExpiry: "",
          gmailProfileImg: "",
        },
        $set: { gmailConnected: false },
      }
    );
    const historyCollection = client.db().collection("history");
    const emailsCollection = client.db().collection("emails");
    const applicationsCollection = client.db().collection("applications");

    await Promise.all([
      historyCollection.deleteMany({ userId: new ObjectId(userId) }),
      emailsCollection.deleteMany({ userId: userId }),
      applicationsCollection.deleteMany({ userId: userId }),
    ]);

    if (updateResult.modifiedCount === 0) {
      return new Response(
        JSON.stringify({ message: "No account found or no changes made" }),
        {
          status: 404,
        }
      );
    }

    return new Response(
      JSON.stringify({ message: "Gmail connection removed successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error disconnecting Gmail:", error);
    return new Response("Error disconnecting Gmail", { status: 500 });
  }
}

async function revokeToken(token: string) {
  const revokeUrl = `https://oauth2.googleapis.com/revoke?token=${token}`;
  const response = await fetch(revokeUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to revoke token: ${response.statusText}`);
  }
}
