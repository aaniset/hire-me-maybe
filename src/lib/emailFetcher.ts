// File: gmailFetcher.ts

import { gmail_v1, google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

// Interface for database operations
interface DatabaseInterface {
  getHistoryId: () => Promise<string | null>;
  storeEmails: (emails: gmail_v1.Schema$Message[]) => Promise<void>;
  storeHistoryId: (historyId: string) => Promise<void>;
  updateEmails: (emails: gmail_v1.Schema$Message[]) => Promise<void>;
}

/**
 * Fetches emails using Gmail API, utilizing history for efficiency
 * @param gmailClient - Gmail API client
 * @param userId - User's email address or 'me' for authenticated user
 * @param db - Database interface for storing and retrieving data
 */
async function fetchEmailsWithHistory(
  gmailClient: gmail_v1.Gmail,
  userId: string,
  db: DatabaseInterface
): Promise<void> {
  try {
    // Check if we have a stored historyId
    const storedHistoryId = await db.getHistoryId();

    if (!storedHistoryId) {
      // If no historyId, perform initial fetch
      await handleInitialFetch(gmailClient, userId, db);
    } else {
      // If historyId exists, perform incremental fetch
      await handleIncrementalFetch(gmailClient, userId, db, storedHistoryId);
    }
  } catch (error) {
    console.error("Error in fetchEmailsWithHistory:", error);
    throw error;
  }
}

/**
 * Handles the initial fetch of emails from the past 7 days
 */
async function handleInitialFetch(
  gmailClient: gmail_v1.Gmail,
  userId: string,
  db: DatabaseInterface
): Promise<void> {
  // Calculate date 7 days ago
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();
  // Fetch emails from the last 7 days
  const emails = await fetchEmailsForTimeRange(
    gmailClient,
    userId,
    sevenDaysAgo
  );
  // Store fetched emails in the database
  await db.storeEmails(emails);

  // Get the latest historyId
  const profile = await gmailClient.users.getProfile({ userId });
  const latestHistoryId = profile.data.historyId;
  if (latestHistoryId) {
    // Store the latest historyId in the database
    await db.storeHistoryId(latestHistoryId);
  }
}

/**
 * Handles incremental fetch of emails using historyId
 */
async function handleIncrementalFetch(
  gmailClient: gmail_v1.Gmail,
  userId: string,
  db: DatabaseInterface,
  startHistoryId: string
): Promise<void> {
  // Fetch history since the last stored historyId
  const history = await fetchHistory(gmailClient, userId, startHistoryId);
  // Process history to extract new emails
  const newEmails = processHistoryEntries(history);
  // Update database with new emails
  await db.updateEmails(newEmails);

  if (history.length > 0) {
    // Update stored historyId with the latest one
    const latestHistoryId = history[history.length - 1].id;
    if (latestHistoryId) {
      await db.storeHistoryId(latestHistoryId);
    }
  }
}

/**
 * Fetches emails for a given time range
 */
async function fetchEmailsForTimeRange(
  gmailClient: gmail_v1.Gmail,
  userId: string,
  startTime: string
): Promise<gmail_v1.Schema$Message[]> {
  const emails: gmail_v1.Schema$Message[] = [];
  let pageToken: any;

  do {
    // Fetch a page of messages
    const response = await gmailClient.users.messages.list({
      userId,
      q: `after:${startTime}`,
      pageToken,
    });

    const messages = response.data.messages || [];
    for (const message of messages) {
      if (message.id) {
        // Fetch full message details
        const fullMessage = await gmailClient.users.messages.get({
          userId,
          id: message.id,
        });
        emails.push(fullMessage.data);
      }
    }

    pageToken = response.data.nextPageToken;
  } while (pageToken); // Continue fetching if there are more pages

  return emails;
}

/**
 * Fetches history entries since a given historyId
 */
async function fetchHistory(
  gmailClient: gmail_v1.Gmail,
  userId: string,
  startHistoryId: string
): Promise<gmail_v1.Schema$History[]> {
  const history: gmail_v1.Schema$History[] = [];
  let pageToken: any;

  do {
    // Fetch a page of history entries
    const response = await gmailClient.users.history.list({
      userId,
      startHistoryId,
      historyTypes: ["messageAdded"],
      pageToken,
    });

    const historyEntries = response.data.history || [];
    history.push(...historyEntries);

    pageToken = response.data.nextPageToken;
  } while (pageToken); // Continue fetching if there are more pages

  return history;
}

/**
 * Processes history entries to extract new messages
 */
function processHistoryEntries(
  history: gmail_v1.Schema$History[]
): gmail_v1.Schema$Message[] {
  const newMessages: gmail_v1.Schema$Message[] = [];

  for (const entry of history) {
    if (entry.messagesAdded) {
      for (const messageAdded of entry.messagesAdded) {
        if (messageAdded.message) {
          newMessages.push(messageAdded.message);
        }
      }
    }
  }

  return newMessages;
}

// Main function to initiate email fetching
async function fetchGmailEmails(
  accessToken: string,
  db: DatabaseInterface
): Promise<void> {
  // Create OAuth2 client and set credentials
  const auth = new OAuth2Client();
  auth.setCredentials({ access_token: accessToken });

  // Create Gmail client
  const gmail = google.gmail({ version: "v1", auth });

  // Call fetchEmailsWithHistory
  await fetchEmailsWithHistory(gmail, "me", db);
}

export { fetchGmailEmails };
