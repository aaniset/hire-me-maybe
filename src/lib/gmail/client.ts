import { gmail_v1 } from "googleapis";
// import { encode } from "gpt-3-encoder";
import llama3Tokenizer from "llama3-tokenizer-js";
import { LLMClient } from "../ai/llmClient";
import { convert, HtmlToTextOptions } from "html-to-text";
import { simpleParser } from "mailparser";
import { EmailParser } from "@/lib/gmail/EmailParser";
import { Collection, MongoClient, ObjectId } from "mongodb";
interface Email {
  id: string;
  from: string;
  fromName: string;
  subject: string;
  body: string;
  to: string;
  date: Date;
}
interface Keyword {
  word: string;
  weight: number;
  isNegative?: boolean;
}
interface ClassifiedEmail extends Email {
  matchPercentage: number;
}
interface FilteredEmail extends Email {
  isJobRelated: boolean;
}
const MAX_EMAIL_BODY_TOKEN = 3500;
const MAX_TOKENS = 2048; // Adjust based on the model's limit
const THRESHOLD = 2; // 2% threshold
export class GmailClient {
  private gmail: gmail_v1.Gmail;
  private historyId: string | null = null;
  private emailParser: EmailParser;
  private historyCollection: Collection;
  private userId: string;

  constructor(
    gmailInstance: gmail_v1.Gmail,
    client: MongoClient,
    userId: string
  ) {
    this.gmail = gmailInstance;
    this.emailParser = new EmailParser();
    this.historyCollection = client.db().collection("history");
    this.userId = userId;
  }

  // async fetchRecentEmails(): Promise<Email[]> {
  //   try {
  //     let emails: Email[] = [];
  //     const historyRecord = await this.historyCollection.findOne({
  //       userId: new ObjectId(this.userId),
  //     });

  //     if (historyRecord && historyRecord.historyId) {
  //       // Use existing historyId
  //       emails = await this.fetchEmailsUsingHistory(historyRecord.historyId);
  //     } else {
  //       // Fetch past 60 days if no history found
  //       emails = await this.fetchEmailsFromPast60Days();
  //     }
  //     // Get the latest historyId from Google
  //     const latestHistoryId = await this.getCurrentHistoryIdFromGoogle();

  //     // Update or insert the latest historyId
  //     await this.historyCollection.updateOne(
  //       { userId: new ObjectId(this.userId) },
  //       { $set: { historyId: latestHistoryId } }
  //     );
  //     return this.cleanEmails(emails);
  //   } catch (error) {
  //     console.log("Error fetching emails:", error);
  //     throw error; // Re-throw the error for higher-level error handling
  //   }
  // }
  async fetchRecentEmails(): Promise<Email[]> {
    try {
      let emails: Email[] = [];
      const historyRecord = await this.historyCollection.findOne({
        userId: new ObjectId(this.userId),
      });
      console.log("histiry form api", historyRecord);
      // Get the latest historyId from Google
      const latestHistoryId = await this.getCurrentHistoryIdFromGoogle();
      // Update or insert the latest historyId
      await this.historyCollection.updateOne(
        { userId: new ObjectId(this.userId) },
        { $set: { historyId: latestHistoryId } },
        { upsert: true }
      );
      if (historyRecord?.historyId) {
        // Use existing historyId
        emails = await this.fetchEmailsUsingHistory(historyRecord.historyId);
      } else {
        // Fetch past 60 days if no history found
        emails = await this.fetchEmailsFromPast60Days();
      }

      return this.cleanEmails(emails);
    } catch (error) {
      console.error("Error fetching emails:", error);
      throw error; // Re-throw the error for higher-level error handling
    }
  }
  private cleanEmails(emails: Email[]): Email[] {
    return emails.filter((email) => {
      // Check if both subject and body are empty or only contain whitespace
      const hasSubject = email.subject.trim().length > 0;
      const hasBody = email.body.trim().length > 0;

      // Keep the email if it has either a subject or a body
      return hasSubject || hasBody;
    });
  }

  private async fetchEmailsUsingHistory(historyId: string): Promise<Email[]> {
    // Fetch email history using the stored historyId
    console.log("fetchEmailsUsingHistory");
    const response = await this.gmail.users.history.list({
      userId: "me",
      startHistoryId: historyId,
    });
    console.log("history", response.data);
    const history = response.data.history || [];
    const emails: Email[] = [];
    for (const record of history) {
      console.log("record", record);
      if (record.messagesAdded) {
        for (const messageAdded of record.messagesAdded) {
          if (!messageAdded.message?.id) {
            console.warn("Message ID is missing");
            continue;
          }
          // Fetch full message details
          const fullMessage = await this.gmail.users.messages.get({
            userId: "me",
            id: messageAdded.message.id,
          });
          const email = await this.emailParser.parseMessage(fullMessage.data);
          emails.push(email);
          // Update historyId with each message to ensure we don't miss any
          if (fullMessage.data.historyId) {
            this.updateHistoryId(fullMessage.data.historyId);
          }
        }
      }
    }

    return emails;
  }

  private async getCurrentHistoryIdFromGoogle(): Promise<string> {
    const response = await this.gmail.users.getProfile({
      userId: "me",
    });
    return response.data.historyId!;
  }

  private async fetchEmailsFromPast60Days(): Promise<Email[]> {
    console.log("fetchEmailsFromPast60Days");

    const response = await this.gmail.users.messages.list({
      userId: "me",
      q: "newer_than:60d",
      maxResults: 1000,
    });

    console.log("fetched all the emails from google");
    const messages = response.data.messages || [];

    // Batch requests
    const batchSize = 50; // Adjust based on API limits and performance
    const batches = [];

    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      batches.push(batch);
    }
    console.log("fetchEmailsFromPast60Days batches created");

    const emails: Email[] = [];
    let latestHistoryId = "";

    await Promise.all(
      batches.map(async (batch) => {
        const batchPromises = batch.map((message) =>
          this.gmail.users.messages.get({
            userId: "me",
            id: message.id!,
            // format: "metadata",
            // metadataHeaders: ["From", "To", "Subject", "Date"],
          })
        );

        const batchResults = await Promise.all(batchPromises);
        console.log("fetchEmailsFromPast60Days batch complete");
        batchResults.forEach(async (fullMessage) => {
          if (fullMessage.data) {
            const email = await this.emailParser.parseMessage(fullMessage.data);
            emails.push(email);

            if (
              fullMessage.data.historyId &&
              fullMessage.data.historyId > latestHistoryId
            ) {
              latestHistoryId = fullMessage.data.historyId;
            }
          }
        });
      })
    );
    console.log("fetchEmailsFromPast60Days promise complete");

    if (latestHistoryId) {
      this.updateHistoryId(latestHistoryId);
    }

    return emails;
  }

  // inital body parsing from gogole to json text to feed local keyword classifier.
  //   private parseMessage(message: gmail_v1.Schema$Message): Email {
  //     const headers = message.payload?.headers || [];
  //     const from = headers.find((h) => h.name?.toLowerCase() === "from");
  //     const to = headers.find((h) => h.name?.toLowerCase() === "to");
  //     const subject = headers.find((h) => h.name?.toLowerCase() === "subject");
  //     const date = headers.find((h) => h.name?.toLowerCase() === "date");

  //     // Parse the 'from' field to extract name and email
  //     const fromParts = from?.value?.match(/^(?:(.+) )?<?(.+@[^>]+)>?$/);
  //     const fromName = fromParts ? fromParts[1] || "" : "";
  //     const fromEmail = fromParts ? fromParts[2] : from?.value || "";

  //     // Extract the plain text body
  //     let body = "";
  //     if (message.payload) {
  //       if (message.payload.body?.data) {
  //         // Single part message
  //         body = Buffer.from(message.payload.body.data, "base64").toString(
  //           "utf-8"
  //         );
  //       } else if (message.payload.parts) {
  //         // Multipart message
  //         const plainTextPart = message.payload.parts.find(
  //           (part) => part.mimeType === "text/plain"
  //         );
  //         const htmlPart = message.payload.parts.find(
  //           (part) => part.mimeType === "text/html"
  //         );

  //         if (plainTextPart && plainTextPart.body?.data) {
  //           body = Buffer.from(plainTextPart.body.data, "base64").toString(
  //             "utf-8"
  //           );
  //         } else if (htmlPart && htmlPart.body?.data) {
  //           // If no plain text, use HTML content
  //           // You might want to strip HTML tags here
  //           body = Buffer.from(htmlPart.body.data, "base64").toString("utf-8");
  //           body = this.extractCleanContent(body)
  //         }
  //       }
  //     }
  //     return {
  //       id: message.id || "",
  //       from: fromEmail,
  //       fromName: fromName,
  //       subject: subject?.value || "",
  //       body: body,
  //       to: to?.value || "",
  //       date: new Date(date?.value || ""),
  //     };
  //   }
  //   private async extractCleanContent(content: string): Promise<string> {
  //     try {
  //       // Try parsing as email first
  //       const parsed = await simpleParser(content);
  //       if (parsed.text) {
  //         return parsed.text;
  //       } else if (parsed.html) {
  //         // return this.convertHtmlToText(parsed.html);
  //         return this.removeLinks(this.convertHtmlToText(parsed.html));
  //       }
  //     } catch (error) {
  //       console.warn("Failed to parse as email, treating as plain text or HTML");
  //     }

  //     // If parsing fails, check if it's HTML
  //     if (content.includes("<html") || content.includes("<body")) {
  //       return this.removeLinks(this.convertHtmlToText(content));
  //     }

  //     // If it's plain text, remove links and return
  //     return this.removeLinks(content);
  //   }

  //   private convertHtmlToText(html: string): string {
  //     return convert(html, {
  //       wordwrap: 130,
  //       preserveNewlines: true,
  //       singleNewLineParagraphs: true,
  //       baseElements: {
  //         selectors: ["p", "h1", "h2", "h3", "h4", "h5", "h6", "li"],
  //       },
  //       ignoreHref: true,
  //       ignoreImage: true,
  //     });
  //   }
  private convertHtmlToText(html: string): string {
    const options: HtmlToTextOptions = {
      wordwrap: 130,
      selectors: [
        { selector: "a", options: { ignoreHref: true } },
        { selector: "img", format: "skip" },
      ],
      baseElements: {
        selectors: ["p", "h1", "h2", "h3", "h4", "h5", "h6", "li"],
      },
    };

    return convert(html, options);
  }

  //   private async parseMessage(message: gmail_v1.Schema$Message): Promise<Email> {
  //     const headers = message.payload?.headers || [];
  //     const from = headers.find((h) => h.name?.toLowerCase() === "from");
  //     const to = headers.find((h) => h.name?.toLowerCase() === "to");
  //     const subject = headers.find((h) => h.name?.toLowerCase() === "subject");
  //     const date = headers.find((h) => h.name?.toLowerCase() === "date");

  //     const fromParts = from?.value?.match(/^(?:(.+) )?<?(.+@[^>]+)>?$/);
  //     const fromName = fromParts ? fromParts[1] || "" : "";
  //     const fromEmail = fromParts ? fromParts[2] : from?.value || "";

  //     let body = "";
  //     if (message.payload) {
  //       if (message.payload.body?.data) {
  //         body = Buffer.from(message.payload.body.data, "base64").toString(
  //           "utf-8"
  //         );
  //       } else if (message.payload.parts) {
  //         const textPart = message.payload.parts.find(
  //           (part) =>
  //             part.mimeType === "text/plain" || part.mimeType === "text/html"
  //         );
  //         if (textPart && textPart.body?.data) {
  //           body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
  //         }
  //       }
  //     }

  //     body = await this.extractCleanContent(body);

  //     return {
  //       id: message.id || "",
  //       from: fromEmail,
  //       fromName: fromName,
  //       subject: subject?.value || "",
  //       body: body,
  //       to: to?.value || "",
  //       date: new Date(date?.value || ""),
  //     };
  //   }

  private updateHistoryId(newHistoryId: string | null | undefined) {
    if (newHistoryId) {
      this.historyId = newHistoryId;
    }
  }

  //   private classifyJobApplicationEmails(
  //     emails: Email[],
  //     threshold: number = 5
  //   ): ClassifiedEmail[] {
  //     const jobKeywords: Keyword[] = [
  //       // Positive keywords (extending the existing list)
  //       { word: "job application", weight: 2 },
  //       { word: "apply", weight: 1.5 },
  //       { word: "applied", weight: 1.5 },
  //       { word: "applying", weight: 1.5 },
  //       { word: "position", weight: 1 },
  //       { word: "role", weight: 1 },
  //       { word: "resume", weight: 2 },
  //       { word: "CV", weight: 2 },
  //       { word: "cover letter", weight: 2 },
  //       { word: "job opportunity", weight: 2 },
  //       { word: "career", weight: 1 },
  //       { word: "hiring", weight: 1.5 },
  //       { word: "recruitment", weight: 1.5 },
  //       { word: "recruiting", weight: 1.5 },
  //       { word: "interview", weight: 1.5 },
  //       { word: "employment", weight: 1 },
  //       { word: "job opening", weight: 2 },
  //       { word: "vacancy", weight: 1.5 },
  //       { word: "applicant", weight: 1.5 },
  //       { word: "candidate", weight: 1.5 },
  //       { word: "candidacy", weight: 2 },
  //       { word: "job description", weight: 2 },
  //       { word: "qualifications", weight: 1.5 },
  //       { word: "experience", weight: 1 },
  //       { word: "skills", weight: 1 },
  //       { word: "salary", weight: 1 },
  //       { word: "recruiter", weight: 2 },
  //       { word: "talent acquisition", weight: 2 },
  //       { word: "human resources", weight: 1.5 },
  //       { word: "HR", weight: 1.5 },
  //       { word: "job fair", weight: 1.5 },
  //       { word: "career opportunity", weight: 2 },
  //       { word: "job search", weight: 1.5 },
  //       { word: "application process", weight: 2 },
  //       { word: "job market", weight: 1 },
  //       { word: "thank you for applying", weight: 3 },
  //       { word: "application received", weight: 2.5 },
  //       { word: "under consideration", weight: 2 },
  //       { word: "move forward", weight: 2 },
  //       { word: "selection process", weight: 2 },
  //       { word: "next steps", weight: 1.5 },
  //       { word: "further consideration", weight: 2 },
  //       { word: "shortlisted", weight: 2.5 },
  //       { word: "successful application", weight: 2.5 },
  //       { word: "job offer", weight: 3 },
  //       { word: "offer letter", weight: 3 },
  //       { word: "onboarding", weight: 2 },
  //       { word: "start date", weight: 2 },
  //       { word: "background check", weight: 2 },
  //       { word: "references", weight: 1.5 },
  //       { word: "competitive salary", weight: 1.5 },
  //       { word: "benefits package", weight: 1.5 },
  //       { word: "company culture", weight: 1 },
  //       { word: "team fit", weight: 1.5 },
  //       { word: "skill set", weight: 1.5 },
  //       { word: "job requirements", weight: 2 },
  //       { word: "application status", weight: 2 },
  //       { word: "follow up", weight: 1.5 },
  //       { word: "talent pool", weight: 1.5 },
  //       { word: "career growth", weight: 1 },
  //       { word: "professional development", weight: 1 },
  //       { word: "job seeker", weight: 2 },
  //       { word: "career transition", weight: 1.5 },
  //       { word: "job board", weight: 1.5 },
  //       { word: "LinkedIn", weight: 1 },
  //       { word: "Indeed", weight: 1 },
  //       { word: "Glassdoor", weight: 1 },
  //       { word: "work experience", weight: 1.5 },
  //       { word: "job title", weight: 1.5 },
  //       { word: "job duties", weight: 1.5 },
  //       { word: "job responsibilities", weight: 1.5 },
  //       { word: "career path", weight: 1 },
  //       { word: "career advancement", weight: 1 },
  //       { word: "job satisfaction", weight: 1 },
  //       { word: "work-life balance", weight: 1 },
  //       { word: "remote work", weight: 1 },
  //       { word: "telecommute", weight: 1 },
  //       { word: "flexible hours", weight: 1 },
  //       { word: "full-time", weight: 1 },
  //       { word: "part-time", weight: 1 },
  //       { word: "contract", weight: 1 },
  //       { word: "permanent", weight: 1 },
  //       { word: "temporary", weight: 1 },
  //       { word: "internship", weight: 1.5 },
  //       { word: "entry-level", weight: 1.5 },
  //       { word: "mid-level", weight: 1.5 },
  //       { word: "senior-level", weight: 1.5 },
  //       { word: "executive", weight: 1.5 },
  //       { word: "leadership", weight: 1 },
  //       { word: "management", weight: 1 },
  //       { word: "team player", weight: 1 },
  //       { word: "self-starter", weight: 1 },
  //       { word: "motivated", weight: 1 },
  //       { word: "passionate", weight: 1 },
  //       { word: "driven", weight: 1 },
  //       { word: "detail-oriented", weight: 1 },
  //       { word: "problem-solving", weight: 1 },
  //       { word: "communication skills", weight: 1 },
  //       { word: "interpersonal skills", weight: 1 },
  //       { word: "technical skills", weight: 1 },
  //       { word: "soft skills", weight: 1 },
  //       { word: "hard skills", weight: 1 },
  //       { word: "transferable skills", weight: 1 },
  //       { word: "networking", weight: 1 },
  //       { word: "professional network", weight: 1 },
  //       { word: "industry experience", weight: 1.5 },
  //       { word: "sector", weight: 1 },
  //       { word: "field", weight: 1 },
  //       { word: "domain expertise", weight: 1.5 },
  //       { word: "subject matter expert", weight: 1.5 },
  //       { word: "SME", weight: 1.5 },
  //       { word: "certification", weight: 1.5 },
  //       { word: "degree", weight: 1.5 },
  //       { word: "diploma", weight: 1.5 },
  //       { word: "education", weight: 1.5 },
  //       { word: "training", weight: 1.5 },
  //       { word: "workshop", weight: 1 },
  //       { word: "seminar", weight: 1 },
  //       { word: "conference", weight: 1 },
  //       { word: "industry event", weight: 1 },
  //       { word: "career fair", weight: 1.5 },
  //       { word: "job expo", weight: 1.5 },
  //       { word: "networking event", weight: 1 },
  //       { word: "career coach", weight: 1.5 },
  //       { word: "career counselor", weight: 1.5 },
  //       { word: "mentor", weight: 1 },
  //       { word: "mentorship", weight: 1 },
  //       { word: "career advice", weight: 1.5 },
  //       { word: "job search strategy", weight: 2 },
  //       { word: "personal brand", weight: 1 },
  //       { word: "professional brand", weight: 1 },
  //       { word: "online presence", weight: 1 },
  //       { word: "digital footprint", weight: 1 },
  //       { word: "portfolio", weight: 1.5 },
  //       { word: "work samples", weight: 1.5 },
  //       { word: "achievements", weight: 1 },
  //       { word: "accomplishments", weight: 1 },
  //       { word: "success stories", weight: 1 },
  //       { word: "career highlights", weight: 1.5 },
  //       { word: "professional summary", weight: 1.5 },
  //       { word: "executive summary", weight: 1.5 },
  //       { word: "career objective", weight: 1.5 },
  //       { word: "professional objective", weight: 1.5 },
  //       { word: "thanks for applying", weight: 3 },
  //       { word: "thank you for applying", weight: 3 },
  //       { word: "application received", weight: 3 },
  //       { word: "received your application", weight: 3 },
  //       { word: "review your application", weight: 2.5 },
  //       { word: "carefully review", weight: 2 },
  //       { word: "reviewing applications", weight: 2.5 },
  //       { word: "application process", weight: 2 },

  //       // Potential next steps
  //       { word: "potential fit", weight: 2.5 },
  //       { word: "good fit", weight: 2.5 },
  //       { word: "schedule an interview", weight: 3 },
  //       { word: "reach out", weight: 1.5 },
  //       { word: "contact you", weight: 1.5 },
  //       { word: "next steps", weight: 2 },

  //       // Waiting period and follow-up
  //       { word: "under consideration", weight: 2.5 },
  //       { word: "in review", weight: 2 },
  //       { word: "reviewing candidates", weight: 2.5 },
  //       { word: "wait to hear", weight: 2 },
  //       { word: "waiting period", weight: 2 },
  //       { word: "follow up", weight: 1.5 },

  //       // Rejection phrases
  //       { word: "not move forward", weight: 3 },
  //       { word: "decided not to", weight: 3 },
  //       { word: "other candidates", weight: 2 },
  //       { word: "align more closely", weight: 2.5 },
  //       { word: "no longer under consideration", weight: 3 },

  //       // Job posting information
  //       { word: "job title", weight: 2 },
  //       { word: "job code", weight: 2 },
  //       { word: "close date", weight: 2 },
  //       { word: "job posting", weight: 2 },
  //       { word: "apply here", weight: 2.5 },

  //       // Company and team references
  //       { word: "our company", weight: 1.5 },
  //       { word: "our team", weight: 1.5 },
  //       { word: "potential employer", weight: 2 },

  //       // Job search related
  //       { word: "job search", weight: 2 },
  //       { word: "future positions", weight: 1.5 },
  //       { word: "future openings", weight: 1.5 },
  //       { word: "keep your information on file", weight: 2 },

  //       // Specific role mentions
  //       { word: "software engineer", weight: 2.5 },
  //       { word: "full stack", weight: 2 },
  //       { word: "frontend", weight: 2 },
  //       { word: "backend", weight: 2 },
  //       { word: "developer", weight: 2 },
  //       { word: "software developer", weight: 2.5 },

  //       // Student and internship related
  //       { word: "student worker", weight: 2.5 },
  //       { word: "internship", weight: 2.5 },
  //       { word: "on campus jobs", weight: 2 },

  //       // Company-specific terms (consider adding more based on common companies in your field)
  //       { word: "coinbase", weight: 2 },
  //       { word: "forward", weight: 1.5 },
  //       { word: "decision theater", weight: 2 },

  //       // Additional general terms
  //       { word: "opportunity", weight: 1.5 },
  //       { word: "position", weight: 1.5 },
  //       { word: "role", weight: 1.5 },
  //       { word: "candidacy", weight: 2 },
  //       { word: "qualifications", weight: 1.5 },
  //       { word: "experience", weight: 1 },

  //       // Negative keywords (to help filter out non-job related emails)
  //       { word: "unsubscribe", weight: 2, isNegative: true },
  //       { word: "promotional", weight: 1.5, isNegative: true },
  //       { word: "newsletter", weight: 1.5, isNegative: true },
  //       { word: "sale", weight: 1, isNegative: true },
  //       { word: "discount", weight: 1, isNegative: true },
  //       // Negative keywords
  //       { word: "unsubscribe", weight: 2, isNegative: true },
  //       { word: "spam", weight: 2, isNegative: true },
  //       { word: "newsletter", weight: 1.5, isNegative: true },
  //       { word: "marketing", weight: 1.5, isNegative: true },
  //       { word: "advertisement", weight: 1.5, isNegative: true },
  //       { word: "promotional", weight: 1.5, isNegative: true },
  //       { word: "discount", weight: 1, isNegative: true },
  //       { word: "sale", weight: 1, isNegative: true },
  //       { word: "limited time offer", weight: 1.5, isNegative: true },
  //       { word: "click here", weight: 1, isNegative: true },
  //       { word: "buy now", weight: 1.5, isNegative: true },
  //       { word: "special offer", weight: 1.5, isNegative: true },
  //       { word: "exclusive deal", weight: 1.5, isNegative: true },
  //       { word: "free trial", weight: 1, isNegative: true },
  //       { word: "subscription", weight: 1, isNegative: true },
  //       { word: "account statement", weight: 1.5, isNegative: true },
  //       { word: "bill", weight: 1, isNegative: true },
  //       { word: "invoice", weight: 1, isNegative: true },
  //       { word: "payment due", weight: 1.5, isNegative: true },
  //       { word: "credit card", weight: 1, isNegative: true },
  //       { word: "bank statement", weight: 1.5, isNegative: true },
  //       { word: "transaction", weight: 1, isNegative: true },
  //       { word: "receipt", weight: 1, isNegative: true },
  //       { word: "order confirmation", weight: 1.5, isNegative: true },
  //       { word: "shipping confirmation", weight: 1.5, isNegative: true },
  //       { word: "tracking number", weight: 1.5, isNegative: true },
  //       { word: "delivery status", weight: 1.5, isNegative: true },
  //       { word: "password reset", weight: 2, isNegative: true },
  //       { word: "account security", weight: 1.5, isNegative: true },
  //       { word: "login attempt", weight: 1.5, isNegative: true },
  //       { word: "verify your account", weight: 1.5, isNegative: true },
  //       { word: "account activity", weight: 1, isNegative: true },
  //       { word: "social media", weight: 1, isNegative: true },
  //       { word: "friend request", weight: 1.5, isNegative: true },
  //       { word: "like", weight: 1, isNegative: true },
  //       { word: "comment", weight: 1, isNegative: true },
  //       { word: "share", weight: 1, isNegative: true },
  //       { word: "tweet", weight: 1, isNegative: true },
  //       { word: "post", weight: 1, isNegative: true },
  //       { word: "blog", weight: 1, isNegative: true },
  //       { word: "article", weight: 1, isNegative: true },
  //       { word: "news", weight: 1, isNegative: true },
  //       { word: "update", weight: 1, isNegative: true },
  //       { word: "announcement", weight: 1, isNegative: true },
  //       { word: "event invitation", weight: 1.5, isNegative: true },
  //       { word: "RSVP", weight: 1.5, isNegative: true },
  //       { word: "calendar invite", weight: 1.5, isNegative: true },
  //       { word: "meeting request", weight: 1.5, isNegative: true },
  //       { word: "webinar", weight: 1, isNegative: true },
  //       { word: "survey", weight: 1, isNegative: true },
  //       { word: "feedback", weight: 1, isNegative: true },
  //       { word: "review", weight: 1, isNegative: true },
  //       { word: "rate us", weight: 1.5, isNegative: true },
  //       { word: "how did we do", weight: 1.5, isNegative: true },
  //     ];

  //     // Function to calculate match score
  //     const calculateMatchScore = (text: string): number => {
  //       const lowerText = text.toLowerCase();
  //       let score = 0;

  //       jobKeywords.forEach(({ word, weight, isNegative }) => {
  //         const regex = new RegExp(`\\b${word}\\b`, "gi");
  //         const matches = (lowerText.match(regex) || []).length;

  //         if (matches > 0) {
  //           if (isNegative) {
  //             score -= weight * matches;
  //           } else {
  //             score += weight * matches;
  //           }
  //         }
  //       });

  //       return score;
  //     };

  //     // Function to calculate relevance score
  //     const calculateRelevanceScore = (text: string): number => {
  //       const words = text.toLowerCase().split(/\s+/);
  //       const uniqueWords = new Set(words);
  //       const totalUniqueWords = uniqueWords.size;

  //       let relevantWords = 0;
  //       jobKeywords.forEach(({ word }) => {
  //         if (uniqueWords.has(word.toLowerCase())) {
  //           relevantWords++;
  //         }
  //       });

  //       return (relevantWords / totalUniqueWords) * 100;
  //     };

  //     const scoredEmails = emails.map((email) => {
  //       const subjectScore = calculateMatchScore(email.subject);
  //       const bodyScore = calculateMatchScore(email.body);
  //       const totalScore = subjectScore + bodyScore;

  //       const subjectRelevance = calculateRelevanceScore(email.subject);
  //       const bodyRelevance = calculateRelevanceScore(email.body);
  //       const averageRelevance = (subjectRelevance + bodyRelevance) / 2;

  //       // Combine score and relevance
  //       const combinedScore = totalScore * (averageRelevance / 100);

  //       return { ...email, score: combinedScore };
  //     });

  //     // Normalize scores
  //     const maxScore = Math.max(...scoredEmails.map((email) => email.score));
  //     const normalizedEmails: ClassifiedEmail[] = scoredEmails.map((email) => ({
  //       ...email,
  //       matchPercentage: (email.score / maxScore) * 100,
  //     }));

  //     // Filter and sort emails
  //     return normalizedEmails
  //       .filter((email) => email.matchPercentage >= threshold)
  //       .sort((a, b) => b.matchPercentage - a.matchPercentage);
  //   }

  //   private createBatches(emails: Email[]): Email[][] {
  //     const batches: Email[][] = [];
  //     let currentBatch: Email[] = [];
  //     let currentTokens = 0;
  //     let totalTokens = 0;
  //     let currentTokensArr = [];
  //     for (const email of emails) {
  //       const emailTokens = llama3Tokenizer.encode(
  //         JSON.stringify({
  //           id: email.id,
  //           fromEmail: email.from,
  //           fromName: email.fromName,
  //           subject: email.subject,
  //           body: email.body,
  //         })
  //       ).length;
  //       totalTokens = totalTokens + emailTokens;
  //       if (currentTokens + emailTokens > MAX_TOKENS) {
  //         batches.push(currentBatch);
  //         currentTokensArr.push(currentTokens);
  //         currentBatch = [];
  //         currentTokens = 0;
  //       }

  //       currentBatch.push(email);
  //       currentTokens += emailTokens;
  //     }

  //     if (currentBatch.length > 0) {
  //       batches.push(currentBatch);
  //       currentTokensArr.push(currentTokens);
  //     }
  //     console.log("total tokens", totalTokens);
  //     console.log("total currentTokensArr", currentTokensArr);

  //     return batches;
  //   }

  //   private extractCleanContent(htmlContent: string): string {
  //     // Function to extract domain from URL
  //     const extractDomain = (url: string): string => {
  //       try {
  //         const domain = new URL(url).hostname;
  //         return domain.startsWith("www.") ? domain.slice(4) : domain;
  //       } catch {
  //         return url; // Return original if not a valid URL
  //       }
  //     };

  //     // Remove HTML tags and entities
  //     const cleanContent = htmlContent
  //       .replace(/<[^>]*>/g, "")
  //       .replace(/&[^;]+;/g, "")
  //       .replace(/\r\n/g, "\n");

  //     // Split content into lines
  //     const lines = cleanContent.split("\n");

  //     // Filter and clean up lines
  //     const cleanedLines = lines
  //       .map((line) => line.trim())
  //       .filter((line) => {
  //         // Remove empty lines and lines with only special characters
  //         return line.length > 0 && /[a-zA-Z0-9]/.test(line);
  //       })
  //       .map((line) => {
  //         // Remove leading/trailing non-alphanumeric characters
  //         line = line.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "");

  //         // Truncate URLs to domain names
  //         return line.replace(/https?:\/\/[^\s]+/g, (url) => extractDomain(url));
  //       });

  //     // Combine lines into a single string
  //     let result = cleanedLines.join(" ");

  //     // Truncate content to fit within 3500 tokens
  //     const tokens = llama3Tokenizer.encode(result);
  //     if (tokens.length > 3500) {
  //       result = llama3Tokenizer.decode(tokens.slice(0, 3500));
  //     }

  //     return result;
  //   }

  private turncatContent(content: string) {
    const tokens = llama3Tokenizer.encode(content);
    if (tokens.length > 3500) {
      content = llama3Tokenizer.decode(tokens.slice(0, MAX_EMAIL_BODY_TOKEN));
    }

    return content;
  }

  //   private async classifyBatchWithLLM(batch: Email[]) {
  //     const llmClient = new LLMClient();
  //     const prompt = `
  //       You are an AI assistant specialized in analyzing job application emails. Your task is to read the given email and determine if it's job-related. Extract relevant information and format it as a JSON object.

  // Rules:
  // 1. If any information is not found or unclear, use an empty string ("") for that field.
  // 2. Always return a valid JSON object.
  // 3. Use the exact keys provided in the format below.
  // 4. Do not add any additional fields to the JSON object.
  // 5. Ensure all string values are properly escaped for JSON.

  // For job-related emails, extract:
  // - jobId: Create a unique identifier by combining the company name and position, removing spaces and special characters. If unable to create, use "".
  // - position: The job title. If not found, use "".
  // - company: The company name. If not found, use "".
  // - status: The current application status (e.g., applied, interview scheduled, offer received, rejected). If unclear, use "unknown".
  // - nextStep: The next action item, if any. If none, use "".
  // - applicationDate: The date of application or latest interaction in YYYY-MM-DD format. If no date found, use "".
  // - keyDetails: An array of up to 5 important points from the email. If none found, use an empty array.

  // Always return your response in this exact JSON format:

  // {
  //   "isJobRelated": boolean,
  //   "jobData": {
  //     "jobId": "string",
  //     "position": "string",
  //     "company": "string",
  //     "status": "string",
  //     "nextStep": "string",
  //     "applicationDate": "string",
  //     "keyDetails": ["string"]
  //   }
  // }

  // If the email is not job-related, set "isJobRelated" to false and use empty strings for all fields in "jobData".

  // Email to analyze: ${JSON.stringify(
  //       batch.map((email) => ({
  //         id: email.id,
  //         fromEmail: email.from,
  //         fromName: email.fromName,
  //         subject: email.subject,
  //         body: this.turncatContent(email.body),
  //       }))
  //     )}
  //     Analyze the above email and provide the JSON response:`;

  //     try {
  //       const response = await llmClient.classify(prompt);
  //       const classifications = JSON.parse(response);
  //       console.log("classifications", classifications);
  //       return batch.map((email) => {
  //         const classification = classifications.find(
  //           (c: any) => c.id === email.id
  //         );
  //         return {
  //           ...email,
  //           isJobRelated: classification?.isJobRelated || false,
  //         };
  //       });
  //       //   return prompt;
  //     } catch (error) {
  //       // logger.error("Error classifying emails:", error);
  //       return batch.map((email) => ({ ...email, isJobRelated: false }));
  //     }
  //   }
}
