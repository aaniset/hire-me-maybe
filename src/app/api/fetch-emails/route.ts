import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ObjectId } from "mongodb";
import { EmailFetcher } from "@/lib/gmail/emailFetcher";
import { EmailParser } from "@/lib/gmail/EmailParser";
import { Classifier } from "@/lib/ai/classifier";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user.id;
  const dbClient = await db;
  const account = await dbClient
    .db()
    .collection("accounts")
    .findOne({ userId: new ObjectId(userId) });
  console.log("account in fetch emails route", account);
  const accessToken = account?.gmailAccessToken;
  if (!accessToken || !userId) {
    return NextResponse.json(
      { message: "Missing required parameters", session: session },
      { status: 400 }
    );
  }

  try {
    const auth = new OAuth2Client();
    auth.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: "v1", auth });

    const classifier = new Classifier();
    const emailParser = new EmailParser();
    const emailFetcher = new EmailFetcher(gmail, userId, await db, emailParser);
    const emails = await emailFetcher.fetchRecentEmails();
    console.log("emails", emails.length);
    const classifiedEmails = await classifier.processSubjectsAndEmails(emails);
    const updateResult = await emailFetcher.saveJobRelatedEmails(
      classifiedEmails,
      userId
    );
    const latestHistoryId = await emailFetcher.getCurrentHistoryIdFromGoogle();
    await emailFetcher.updateHistoryId(latestHistoryId);
    return NextResponse.json(
      {
        success: true,
        update: updateResult,
        emailsProcessed: emails.length,
        jobRelatedEmails: classifiedEmails.filter((e) => e.isJobRelated).length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error triggering job:", error);
    return NextResponse.json(
      { message: "Error triggering job", error: (error as Error).message },
      { status: 500 }
    );
  }
}
