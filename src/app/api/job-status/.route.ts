// import { NextResponse } from "next/server";
// import { TriggerClient } from "@trigger.dev/sdk";

// const client = new TriggerClient({
//   id: process.env.TRIGGER_API_ID!,
//   apiKey: process.env.TRIGGER_API_KEY!,
// });

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const jobId = searchParams.get("jobId");

//   if (!jobId) {
//     return NextResponse.json({ message: "Missing jobId" }, { status: 400 });
//   }

//   try {
//     const job = await client.getJobRun(jobId);
//     return NextResponse.json({ status: job.status });
//   } catch (error) {
//     console.error("Error fetching job status:", error);
//     return NextResponse.json(
//       { message: "Error fetching job status", error: (error as Error).message },
//       { status: 500 }
//     );
//   }
// }
