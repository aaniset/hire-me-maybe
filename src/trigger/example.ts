import { logger, task, wait } from "@trigger.dev/sdk/v3";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { db } from "@/lib/db";
import { EmailFetcher } from "@/lib/gmail/emailFetcher";
import { EmailParser } from "@/lib/gmail/EmailParser";
import { Classifier } from "@/lib/ai/classifier";

export const fetchEmailsJob = task({
  id: "fetch-emails-job",
  run: async (payload: { userId: string; accessToken: string }, { ctx }) => {
    const { userId, accessToken } = payload;

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

    logger.log("Fetch Emails Job completed", { payload, ctx });

    return {
      success: true,
      update: updateResult,
      emailsProcessed: emails.length,
      jobRelatedEmails: classifiedEmails.filter((e) => e.isJobRelated).length,
    };
  },
});
