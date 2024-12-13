import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function PATCH(req: Request) {
  if (req.method !== "PATCH") {
    return new Response(JSON.stringify({ message: "Method Not Allowed" }), {
      status: 405,
    });
  }
  const session = await auth();
  const userId = session?.user.id;
  if (!userId) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  const client = await db;
  const usersCollection = client.db().collection("users");

  try {
    const { name } = await req.json();

    if (!name) {
      return new Response(JSON.stringify({ message: "Name is required" }), {
        status: 400,
      });
    }

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { name: name } }
    );

    if (result.modifiedCount === 0) {
      return new Response(
        JSON.stringify({ message: "User not found or no changes made" }),
        {
          status: 404,
        }
      );
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Error updating application",
        error: (error as Error).message,
      }),
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  if (req.method !== "DELETE") {
    return new Response(JSON.stringify({ message: "Method Not Allowed" }), {
      status: 405,
    });
  }
  const session = await auth();
  const userId = session?.user.id;
  if (!userId) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  const client = await db;

  // you need to delte docs in users,sessions,history,emails,applications,accounts by userId

  try {
    //delete all the docs by userid
    // Convert userId to ObjectId
    const userObjectId = new ObjectId(userId);

    // Delete user from users collection
    await client.db().collection("users").deleteOne({ _id: userObjectId });

    // Delete from sessions, history, and accounts collections
    const objectIdCollections = ["sessions", "history", "accounts"];
    await Promise.all(
      objectIdCollections.map((collectionName) =>
        client
          .db()
          .collection(collectionName)
          .deleteMany({ userId: userObjectId })
      )
    );

    // Delete from applications and emails collections
    const stringIdCollections = ["applications", "emails"];
    await Promise.all(
      stringIdCollections.map((collectionName) =>
        client.db().collection(collectionName).deleteMany({ userId: userId })
      )
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "User profile and associated data deleted successfully",
      }),
      { status: 200 }
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Error deleting application",
        error: (error as Error).message,
      }),
      { status: 500 }
    );
  }
}
