import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ObjectId } from "mongodb";

interface Applications {
  id: string;
  isJobRelated: boolean;
  jobData: {
    jobId: string;
    position: string;
    company: string;
    status: string;
    nextStep: string;
    applicationDate: string;
    keyDetails: string[];
  };
  from: string;
  fromName: string;
  subject: string;
  body: string;
  to: string;
  date: Date;
}

export async function GET(req: Request, res: Response) {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ message: "Method Not Allowed" }), {
      status: 405,
    });
  }
  const session = await auth();
  const client = await db;
  const applicationsCollection = client.db().collection("applications");
  const userId = session?.user.id;

  if (!userId) {
    return new Response(
      JSON.stringify({
        message: "Missing required parameters",
        session: session,
      }),
      {
        status: 400,
      }
    );
  }

  try {
    const pipeline = [
      {
        $match: {
          userId: userId,
          status: { $ne: "unknown" },
        },
      },

      {
        $project: {
          _id: 1,
          jobId: 1,
          position: 1,
          company: 1,
          status: 1,
          nextStep: 1,
          applicationDate: 1,
          keyDetails: 1,
          userId: 1,
          date: 1,
          createdAt: 1,
          updatedAt: 1,
          from: 1,
          fromName: 1,
          subject: 1,
          emailDate: 1,
        },
      },
    ];

    const result = await applicationsCollection.aggregate(pipeline).toArray();
    // return result;
    console.log("applications", result);
    const transformedApplications = result.map((app, index) => ({
      ...app,
      id: `app${index + 1}`,
      _id: app._id.toString(), // Convert ObjectId to string
    }));
    return new Response(
      JSON.stringify({ success: true, data: transformedApplications }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing emails:", error);
    return new Response(
      JSON.stringify({
        message: "Internal server error",
        error: (error as Error).message,
      }),
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: Request, res: Response) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ message: "Method Not Allowed" }), {
      status: 405,
    });
  }
  const session = await auth();
  const client = await db;
  const applicationsCollection = client.db().collection("applications");

  const userId = session?.user.id;

  if (!userId) {
    return new Response(
      JSON.stringify({
        message: "Missing required parameters",
        session: session,
      }),
      {
        status: 400,
      }
    );
  }
  const jobData = await req.json();
  const newApplication = {
    userId: userId,
    isJobRelated: true,
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    jobId: "", // Implement this function
    position: jobData.position || "",
    company: jobData.company || "",
    status: jobData.status || "",
    nextStep: jobData.nextStep || "",
    applicationDate: new Date().toISOString(),
    keyDetails: jobData.keyDetails || [],
  };

  try {
    const result = await applicationsCollection.insertOne(newApplication);
    return new Response(
      JSON.stringify({ success: true, id: result.insertedId }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing emails:", error);
    return new Response(
      JSON.stringify({
        message: "Internal server error",
        error: (error as Error).message,
      }),
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  const userId = session?.user.id;
  if (!userId) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  const client = await db;
  const applicationsCollection = client.db().collection("applications");

  const { _id, jobData } = await req.json();

  try {
    const result = await applicationsCollection.updateOne(
      { _id: new ObjectId(_id as string), userId: new ObjectId(userId) },
      { $set: { jobData } }
    );

    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({ message: "Application not found" }),
        { status: 404 }
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

// 3. Delete application
export async function DELETE(req: Request) {
  const session = await auth();
  const userId = session?.user.id;
  if (!userId) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  const client = await db;
  const applicationsCollection = client.db().collection("applications");

  const { _id } = await req.json();
  console.log("_id in backend", _id);
  try {
    const result = await applicationsCollection.deleteOne({
      _id: new ObjectId(_id as string),
      userId: userId,
    });

    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ message: "Already deleted" }), {
        status: 200,
      });
    }

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
