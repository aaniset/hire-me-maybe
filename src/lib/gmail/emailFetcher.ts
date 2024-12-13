import { gmail_v1 } from "googleapis";
import { Collection, Document, MongoClient, ObjectId, WithId } from "mongodb";
import { EmailParser } from "./EmailParser"; // Assuming this exists
import {
  ApplicationDocument,
  Email,
  EmailDocument,
  HistoryRecord,
  MergedObject,
} from "@/types/global-types";

export class EmailFetcher {
  private readonly gmail: gmail_v1.Gmail;
  private readonly userId: string;
  private historyCollection: Collection;
  private emailsCollection: Collection;
  private applicationsCollection: Collection;

  private readonly emailParser: EmailParser;

  constructor(
    gmail: gmail_v1.Gmail,
    userId: string,
    client: MongoClient,
    emailParser: EmailParser
  ) {
    this.gmail = gmail;
    this.userId = userId;
    this.historyCollection = client.db().collection("history");
    this.emailsCollection = client.db().collection("emails");
    this.applicationsCollection = client.db().collection("applications");
    this.emailParser = emailParser;
  }

  // async saveJobRelatedEmails(
  //   LLMClassifiedEmails: MergedObject[],
  //   userId: string
  // ) {
  //   const now = new Date();
  //   const jobRelatedEmails = LLMClassifiedEmails.filter(
  //     (email) => email.isJobRelated && email.jobData.status !== "unknown"
  //   );

  //   if (jobRelatedEmails.length === 0) {
  //     return; // No job-related emails to process
  //   }

  //   const emailOps = [];
  //   const applicationOps = [];
  //   // const emailUpdates: any = [];

  //   for (const email of jobRelatedEmails) {
  //     const emailDoc: EmailDocument = {
  //       from: email.from,
  //       fromName: email.fromName,
  //       subject: email.subject,
  //       body: email.body,
  //       to: email.to,
  //       date: new Date(email.date),
  //       score: email.score,
  //       matchPercentage: email.matchPercentage,
  //       messageId: email.id,
  //       isJobRelated: email.isJobRelated,
  //       userId: userId,
  //       createdAt: now,
  //       updatedAt: now,
  //     };

  //     const applicationDoc: any = {
  //       ...email.jobData,
  //       userId: userId,
  //       from: email.from,
  //       fromName: email.fromName,
  //       date: new Date(email.date),
  //       createdAt: now,
  //       updatedAt: now,
  //     };

  //     emailOps.push({ insertOne: { document: emailDoc } });
  //     applicationOps.push({ insertOne: { document: applicationDoc } });
  //   }

  //   const [emailResults, applicationResults] = await Promise.all([
  //     this.emailsCollection.bulkWrite(emailOps),
  //     this.applicationsCollection.bulkWrite(applicationOps),
  //   ]);

  //   const emailUpdates: any = [];
  //   const applicationUpdates: any = [];
  //   jobRelatedEmails.forEach((email, index) => {
  //     const emailId = emailResults?.insertedIds[index];
  //     const applicationId = applicationResults?.insertedIds[index];

  //     emailUpdates.push({
  //       updateOne: {
  //         filter: { _id: emailId },
  //         update: {
  //           $set: {
  //             applicationId: new ObjectId(applicationId as string),
  //           },
  //         },
  //       },
  //     });

  //     applicationUpdates.push({
  //       updateOne: {
  //         filter: { _id: applicationId },
  //         update: {
  //           $set: {
  //             emailContentId: new ObjectId(emailId as string),
  //           },
  //         },
  //       },
  //     });
  //   });

  //   if (applicationUpdates.length > 0) {
  //     await this.applicationsCollection.bulkWrite(applicationUpdates);
  //   }

  //   // Perform bulk update for emails
  //   await this.emailsCollection.bulkWrite(emailUpdates);
  //   return jobRelatedEmails.length > 0 ? true : false;
  // }
  async saveJobRelatedEmails(
    LLMClassifiedEmails: MergedObject[],
    userId: string
  ) {
    const now = new Date();
    const jobRelatedEmails = LLMClassifiedEmails.filter(
      (email) => email.isJobRelated && email.jobData?.status !== "unknown"
    );

    if (jobRelatedEmails.length === 0) {
      return; // No job-related emails to process
    }

    const emailOps = [];
    const applicationOps = [];

    for (const email of jobRelatedEmails) {
      const emailDoc: EmailDocument = {
        from: email.from,
        fromName: email.fromName,
        subject: email.subject,
        body: email.body,
        to: email.to,
        date: new Date(email.date),
        score: email.score,
        matchPercentage: email.matchPercentage,
        messageId: email.id,
        isJobRelated: email.isJobRelated,
        userId: userId,
        createdAt: now,
        updatedAt: now,
      };

      const applicationDoc: any = {
        ...email.jobData,
        userId: userId,
        from: email.from,
        fromName: email.fromName,
        date: new Date(email.date),
        createdAt: now,
        updatedAt: now,
      };

      emailOps.push({ insertOne: { document: emailDoc } });
      applicationOps.push({ insertOne: { document: applicationDoc } });
    }

    const [emailResults, applicationResults] = await Promise.all([
      this.emailsCollection.bulkWrite(emailOps),
      this.applicationsCollection.bulkWrite(applicationOps),
    ]);

    const emailUpdates: any = [];
    const applicationUpdates: any = [];
    jobRelatedEmails.forEach((email, index) => {
      const emailId = emailResults?.insertedIds[index];
      const applicationId = applicationResults?.insertedIds[index];

      // emailUpdates.push({
      //   updateOne: {
      //     filter: { _id: emailId },
      //     update: {
      //       $set: {
      //         applicationId: new ObjectId(applicationId as string),
      //       },
      //     },
      //   },
      // });

      applicationUpdates.push({
        updateOne: {
          filter: { _id: applicationId },
          update: {
            $set: {
              emailMessageId: email.id, // Changed from emailContentId to emailMessageId
            },
          },
        },
      });
    });

    if (applicationUpdates.length > 0) {
      await this.applicationsCollection.bulkWrite(applicationUpdates);
    }

    // Perform bulk update for emails
    // await this.emailsCollection.bulkWrite(emailUpdates);
    return jobRelatedEmails.length > 0;
  }
  async fetchRecentEmails(): Promise<Email[]> {
    try {
      const historyRecord = await this.getHistoryRecord();
      console.log("historyRecord", historyRecord);
      // const latestHistoryId = await this.getCurrentHistoryIdFromGoogle();
      // await this.updateHistoryId(latestHistoryId);

      let emails: Email[];
      if (historyRecord?.historyId) {
        emails = await this.fetchEmailsUsingHistory(historyRecord.historyId);
      } else {
        emails = await this.fetchEmailsFromPast60Days();
      }

      return this.cleanEmails(emails);
    } catch (error) {
      console.error("Error fetching emails:", error);
      throw error;
    }
  }

  private async getHistoryRecord(): Promise<HistoryRecord | null> {
    const record = (await this.historyCollection.findOne({
      userId: new ObjectId(this.userId),
    })) as WithId<Document> | null;

    if (record) {
      return {
        userId: record.userId as ObjectId,
        historyId: record.historyId as string,
      };
    }

    return null;
  }

  async updateHistoryId(historyId: string): Promise<void> {
    await this.historyCollection.updateOne(
      { userId: new ObjectId(this.userId) },
      { $set: { historyId } },
      { upsert: true }
    );
  }

  private cleanEmails(emails: Email[]): Email[] {
    return emails.filter(
      (email) => email.subject.trim().length > 0 || email.body.trim().length > 0
    );
  }

  private async fetchEmailsUsingHistory(historyId: string): Promise<Email[]> {
    console.log("fetchEmailsUsingHistory");
    const response = await this.gmail.users.history.list({
      userId: "me",
      startHistoryId: historyId,
    });

    const history = response.data.history || [];
    const emails: Email[] = [];

    await Promise.all(
      history.map((record) => this.processHistoryRecord(record, emails))
    );
    console.log("emails found using", emails.length);

    return emails;
  }

  private async processHistoryRecord(
    record: gmail_v1.Schema$History,
    emails: Email[]
  ): Promise<void> {
    if (record.messagesAdded) {
      await Promise.all(
        record.messagesAdded.map(async (messageAdded) => {
          if (!messageAdded.message?.id) {
            console.warn("Message ID is missing");
            return;
          }
          console.log("messageAdded.message.id", messageAdded.message.id);
          const email = await this.fetchAndParseEmail(messageAdded.message.id);
          if (email) {
            emails.push(email);
          }
        })
      );
    }
  }

  private async fetchAndParseEmail(messageId: string): Promise<Email | null> {
    try {
      const fullMessage = await this.gmail.users.messages.get({
        userId: "me",
        id: messageId,
      });

      const email = await this.emailParser.parseMessage(fullMessage.data);
      return email;
    } catch (error) {
      console.error(`Error fetching message ${messageId}:`, error);
      return null;
    }
  }

  async getCurrentHistoryIdFromGoogle(): Promise<string> {
    const response = await this.gmail.users.getProfile({ userId: "me" });
    return response.data.historyId!;
  }

  private async fetchEmailsFromPast60Days(): Promise<Email[]> {
    const response = await this.gmail.users.messages.list({
      userId: "me",
      q: "newer_than:60d",
      maxResults: 1000, // Adjust as needed, but be aware of API limits
    });

    const messages = response.data.messages || [];
    const emails: Email[] = [];

    await this.processBatch(messages, emails);

    return emails;
  }

  private async processBatch(
    messages: gmail_v1.Schema$Message[],
    emails: Email[]
  ): Promise<void> {
    const batchSize = 50;
    const batches = [];

    for (let i = 0; i < messages.length; i += batchSize) {
      batches.push(messages.slice(i, i + batchSize));
    }

    await Promise.all(
      batches.map((batch) => this.processBatchConcurrently(batch, emails))
    );
  }

  private async processBatchConcurrently(
    batch: gmail_v1.Schema$Message[],
    emails: Email[]
  ): Promise<void> {
    const batchPromises = batch.map((message) =>
      this.fetchAndParseEmail(message.id!)
    );
    const batchResults = await Promise.all(batchPromises);
    emails.push(
      ...batchResults.filter((email): email is Email => email !== null)
    );
  }
}
