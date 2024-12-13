// import { encode } from 'gpt-3-encoder';
// import { Email, JobApplication } from '@/types';
// import { logger } from '@/lib/utils/logger';
// import { LLMClient } from './llmClient';

// const MAX_TOKENS = 4096; // Adjust based on the model's limit

// export async function analyzeJobEmails(emails: Email[]): Promise<JobApplication[]> {
//   const llmClient = new LLMClient();
//   const jobApplications: JobApplication[] = [];

//   for (const email of emails) {
//     const truncatedContent = truncateEmail(email.body);
//     const prompt = `
//       Analyze the following email for job application details. Return a JSON object with the following structure:
//       {
//         "jobId": "unique identifier",
//         "position": "job title",
//         "company": "company name",
//         "status": "application status (e.g., applied, interview scheduled, offer received)",
//         "nextStep": "next action item if any",
//         "applicationDate": "date of application or latest interaction",
//         "keyDetails": "array of important points from the email"
//       }

//       Email:
//       ${truncatedContent}
//     `;

//     try {
//       const response = await llmClient.analyze(prompt);
//       const jobApplication = JSON.parse(response);
//       jobApplications.push(validateJobApplication(jobApplication, email));
//     } catch (error) {
//       logger.error(`Error analyzing email ${email.id}:`, error);
//     }
//   }

//   return jobApplications;
// }

// function truncateEmail(content: string): string {
//   const tokens = encode(content);
//   if (tokens.length <= MAX_TOKENS) {
//     return content;
//   }

//   const truncatedTokens = tokens.slice(0, MAX_TOKENS / 2)
//     .concat(tokens.slice(-MAX_TOKENS / 2));
//   return decode(truncatedTokens);
// }

// function validateJobApplication(jobApplication: any, email: Email): JobApplication {
//   // Implement validation logic here
//   // ...

//   return {
//     ...jobApplication,
//     emailId: email.id,
//     // Add any other necessary fields
//   };
// }
