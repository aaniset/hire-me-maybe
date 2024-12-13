// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/lib/auth";
// import { ObjectId } from "mongodb";
// import { db } from "@/lib/db";
// import { z } from "zod";
// import { google } from "googleapis";
// import { getSession } from "next-auth/react";

// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   `${process.env.NEXTAUTH_URL}/api/gmail-callback`
// );

// export async function POST(req: Request, res: Response) {
//     const session = await getServerSession(authOptions);
//     //   const session = await getSession({ req });

//     if (!session) {
//       // return res.status(401).json({ error: 'Unauthorized' });
//       return new Response(JSON.stringify({ error: "Unauthorized" }), {
//         status: 401,
//       });
//     }
//     const { code } = req.query;

//     try {
//       const { tokens } = await oauth2Client.getToken(code as string);
//       oauth2Client.setCredentials(tokens);

//       const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

//       // Store the tokens in the database
//       const client = await db;
//       await client.db().collection('users').updateOne(
//         { email: session.user.email },
//         { $set: { gmailTokens: tokens } }
//       );

//       // Redirect to a success page
//       res.redirect('/gmail-linked-success');
//     } catch (error) {
//       console.error('Error linking Gmail:', error);
//       res.redirect('/gmail-linked-error');
//     }
// }
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/lib/auth";
// import { ObjectId } from "mongodb";
// import { db } from "@/lib/db";
// import { z } from "zod";
// // import { google } from "googleapis";
// import { getSession } from "next-auth/react";

// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   `${process.env.NEXTAUTH_URL}/api/gmail-callback`
// );

// export async function POST(req: Request, res: Response) {
//   try {
//     const session = await getServerSession(authOptions);
//     //   const session = await getSession({ req });

//     if (!session) {
//       // return res.status(401).json({ error: 'Unauthorized' });
//       return new Response(JSON.stringify({ error: "Unauthorized" }), {
//         status: 401,
//       });
//     }

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
import { auth } from "@/auth";
import { db } from "@/lib/db";

// 1. Get all emails by user
export async function GET(req: Request) {
  const session = await auth();
  const userId = session?.user.id;

  if (!userId) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  const client = await db;
  const applicationsCollection = client.db().collection("emails");

  try {
    const emails = await applicationsCollection
      .find(
        {
          userId: userId,
          $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
        },
        {
          projection: {
            _id: 1,
            body: 1,
            subject: 1,
            from: 1,
            fromName: 1,
          },
        }
      )
      .toArray();

    return new Response(JSON.stringify({ success: true, data: emails }), {
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Error fetching emails",
        error: (error as Error).message,
      }),
      { status: 500 }
    );
  }
}

// 2. Delete emails in emails collection by userId and _id
// export async function DELETE(req: Request) {
//   const session = await auth();
//   const userId = session?.user.id;

//   if (!userId) {
//     return new Response(JSON.stringify({ message: "Unauthorized" }), {
//       status: 401,
//     });
//   }

//   const client = await db;
//   const applicationsCollection = client.db().collection("emails");

//   const { ids } = await req.json();
//   //ids =[_id..]  ids is the array of emails _ids that should be deleted .

//   try {
//     let result;
//     if (_id) {
//       // Delete email content for a specific application
//       result = await applicationsCollection.updateOne(
//         {
//           _id: new ObjectId(_id as string),
//           userId: userId,
//         },
//         { $unset: { body: "", subject: "" } }
//       );

//       if (result.matchedCount === 0) {
//         return new Response(
//           JSON.stringify({ message: "Application not found" }),
//           { status: 404 }
//         );
//       }
//     } else {
//       // Delete email content for all applications of the user
//       result = await applicationsCollection.updateMany(
//         { userId: new ObjectId(userId) },
//         { $unset: { body: "", subject: "" } }
//       );
//     }

//     return new Response(
//       JSON.stringify({ success: true, modifiedCount: result.modifiedCount }),
//       { status: 200 }
//     );
//   } catch (error) {
//     return new Response(
//       JSON.stringify({
//         message: "Error deleting emails",
//         error: (error as Error).message,
//       }),
//       { status: 500 }
//     );
//   }
// }
export async function DELETE(req: Request) {
  const session = await auth();
  const userId = session?.user.id;

  if (!userId) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  const client = await db;
  const emailsCollection = client.db().collection("emails");

  const { ids } = await req.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return new Response(
      JSON.stringify({ message: "Invalid or empty ids array" }),
      {
        status: 400,
      }
    );
  }

  try {
    const result = await emailsCollection.updateMany(
      {
        _id: { $in: ids.map((id) => new ObjectId(id as string)) },
        userId: userId,
      },
      {
        $unset: {
          from: "",
          fromName: "",
          subject: "",
          body: "",
        },
        $set: {
          isDeleted: true,
        },
      }
    );

    return new Response(
      JSON.stringify({ success: true, modifiedCount: result.modifiedCount }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Error deleting email fields",
        error: (error as Error).message,
      }),
      { status: 500 }
    );
  }
}
