import llama3Tokenizer from "llama3-tokenizer-js";
import { LLMClient } from "../ai/llmClient";
import fs from "fs/promises";
import { MergedObject } from "@/types/global-types";

const MAX_EMAIL_BODY_TOKEN = 3500;
const MAX_TOKENS = 2048; // Adjust based on the model's limit
const THRESHOLD = 2; // 2% threshold

// interface TruncatedEmail {
//   id: string;
//   // Add other known properties of truncatedEmail
// }

// interface ResultObject {
//   // Add known properties of the result object
// }

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
// interface Email {
//     id: string;
//     subject: string;
//     body: string;
//     from: string;
//   }

interface JobData {
  id: string;
  isJobRelated: boolean;
  jobData?: {
    jobId: string;
    position: string;
    company: string;
    status: string;
    nextStep: string;
    applicationDate: string;
    keyDetails: string[];
  };
}

function promptForEmail(email: string, subject: string, id: string) {
  // let prompt = `Objective: Analyze the provided email and return relevant information as a JSON object following the guidelines below.

  //   Role: You are an AI specializing in job application emails. Your task is to determine if the email is job-related and extract relevant details into a structured JSON format.

  //   Instructions:
  //   - Focus only on the provided email.
  //   - Ignore any prior context.
  //   - Determine if the email is job-related.
  //   - If job-related, extract the following fields:
  //     - id: Use the provided id.
  //     - isJobRelated: true if job-related, else false.
  //     - jobId, company: Extract from the body if available, otherwise empty.
  //     - status: One of "applied", "interviewing", "offer received", "rejected", or "unknown".
  //     - position: positiion or role of the job. read email body to extact it
  //     - nextStep, applicationDate: Extract or leave empty.
  //     - keyDetails: Up to 5 key points or an empty array.

  //   JSON Structure:
  //   {
  //     "id": "string",
  //     "isJobRelated": boolean,
  //     "jobData": {
  //       "jobId": "string",
  //       "position": "string",
  //       "company": "string",
  //       "status": "string",
  //       "nextStep": "string",
  //       "applicationDate": "string",
  //       "keyDetails": ["string"]
  //     }
  //   }

  //   For non-job-related emails, set isJobRelated to false and leave all fields in jobData empty.

  //   Examples:
  //   1.
  //   {
  //     "id": "382cbc1384cdd50",
  //     "isJobRelated": true,
  //     "jobData": {
  //       "jobId": "",
  //       "position": "Software Engineer",
  //       "company": "TechCorp",
  //       "status": "interviewing",
  //       "nextStep": "Confirm availability for interview",
  //       "applicationDate": "2024-08-18",
  //       "keyDetails": ["Interview invitation for Software Engineer", "interviewing for August 18, 2024", "Request to confirm availability"]
  //     }
  //   }

  //   2.
  //   {
  //     "id": "190cbc13874cdd50",
  //     "isJobRelated": false,
  //     "jobData": {
  //       "jobId": "",
  //       "position": "",
  //       "company": "",
  //       "status": "",
  //       "nextStep": "",
  //       "applicationDate": "",
  //       "keyDetails": []
  //     }
  //   }

  //   3.
  //   {
  //     "id": "190cbc15974cff50",
  //     "isJobRelated": true,
  //     "jobData": {
  //       "jobId": "",
  //       "position": "Product Manager",
  //       "company": "InnovateX",
  //       "status": "applied",
  //       "nextStep": "Await notification of next steps",
  //       "applicationDate": "",
  //       "keyDetails": ["Application received for Product Manager at InnovateX", "Next steps to be communicated within two weeks"]
  //     }
  //   }

  //   Task: Analyze the email and return a JSON array with a single object in the format above.
  //   Id: ${id} \n Email: ${subject} \n ${email}
  //   `;

  let prompt = `Objective: Analyze the provided email and return relevant information as a JSON object, focusing specifically on job applications.

Role: You are an AI specializing in identifying and extracting information from job application-related emails. Your task is to determine if the email is directly related to a job application process and extract relevant details into a structured JSON format.

Instructions:
- Focus only on the provided email content.
- Ignore any prior context.
- Determine if the email is specifically related to a job application process (e.g., application confirmation, interview invitation, job offer, rejection).
- Do NOT mark as job-related: general job postings, newsletters about job openings, or networking emails not tied to a specific application.
- If job application-related, extract the following fields:
  - id: Use the provided id.
  - isJobRelated: true if directly related to a job application, else false.
  - jobId, company: Extract from the body if available, otherwise empty.
  - status: One of "applied", "interviewing", "accepted", "rejected", or "unknown".
  - position: Position or role applied for. Extract from email body.
  - nextStep, applicationDate: Extract or leave empty.
  - keyDetails: Up to 5 key points specific to the application process or an empty array.

JSON Structure:
{
  "id": "string",
  "isJobRelated": boolean,
  "jobData": {
    "jobId": "string",
    "position": "string",
    "company": "string",
    "status": "string",
    "nextStep": "string",
    "applicationDate": "string",
    "keyDetails": ["string"]
  }
}

For emails not directly related to a job application, set isJobRelated to false and leave all fields in jobData empty.

Examples:
1. Job Application Confirmation
{
  "id": "382cbc1384cdd50",
  "isJobRelated": true,
  "jobData": {
    "jobId": "SE-2024-001",
    "position": "Software Engineer",
    "company": "TechCorp",
    "status": "applied",
    "nextStep": "Await further communication",
    "applicationDate": "2024-08-18",
    "keyDetails": ["Application received for Software Engineer", "Application number: SE-2024-001", "Will be in touch within 2 weeks"]
  }
}

2. Non-Job Application Email
{
  "id": "190cbc13874cdd50",
  "isJobRelated": false,
  "jobData": {
    "jobId": "",
    "position": "",
    "company": "",
    "status": "",
    "nextStep": "",
    "applicationDate": "",
    "keyDetails": []
  }
}

3. Interview Invitation
{
  "id": "190cbc15974cff50",
  "isJobRelated": true,
  "jobData": {
    "jobId": "PM-2024-052",
    "position": "Product Manager",
    "company": "InnovateX",
    "status": "interviewing",
    "nextStep": "Confirm interview availability",
    "applicationDate": "",
    "keyDetails": ["Interview invitation for Product Manager role", "Scheduled for September 5, 2024", "Virtual interview via Zoom", "Prepare 15-minute presentation"]
  }
}

4. Job Opening Announcement (Not Job Application)
{
  "id": "290dbc15974cff60",
  "isJobRelated": false,
  "jobData": {
    "jobId": "",
    "position": "",
    "company": "",
    "status": "",
    "nextStep": "",
    "applicationDate": "",
    "keyDetails": []
  }
}

Task: Analyze the email and return a JSON array with a single object in the format above. Only mark as job-related if the email is directly part of a job application process.
Id: ${id}
Email Subject: ${subject}
Email Body: ${email}
`;
  return prompt;
}
function promptForSubject(emails: Email[]): string[] {
  const MAX_TOKENS = 4000; // Adjust this based on your LLM's token limit
  const PROMPT_TEMPLATE = `You are an AI assistant specialized in analyzing email subjects to determine if they are potentially related to job applications. Your task is to process an array of email objects, each containing an id and subject. You must output an array of objects, each with only the id and a needBody boolean flag, wrapped in triple backticks.

Instructions:
1. Analyze each email subject carefully.
2. Set needBody to false if you are certain the email is not related to job applications.
3. Set needBody to true if:
   - You are certain the email is related to job applications
   - You are unsure and need more information from the email body
4. Use keywords, phrases, and context clues in the subject to make your determination.
5. Be conservative in marking emails as not needing the body (false). When in doubt, set needBody to true.
6. Include ALL input objects in your output, but only with id and needBody fields.
7. Wrap the entire output array in triple backticks.

Input format:
[
  {"id": "string", "subject": "string"},
  {"id": "string", "subject": "string"},
  ...
]

Output format:
[
{"id": "string", "needBody": boolean},
{"id": "string", "needBody": boolean},
]

Example input:
[
  {"id": "1", "subject": "Your application for Software Engineer position"},
  {"id": "2", "subject": "Weekend sale: 50% off all items"},
  {"id": "3", "subject": "Interview schedule for Marketing Manager role"},
  {"id": "4", "subject": "Thank you for your interest in our company"},
  {"id": "5", "subject": "Newsletter: Tech industry updates"}
]

Example output:
[
{"id": "1", "needBody": true},
{"id": "2", "needBody": false},
{"id": "3", "needBody": true},
{"id": "4", "needBody": true},
{"id": "5", "needBody": false}
]

Now, process the following array of email objects and provide your analysis:
`;
  const promptTokens = llama3Tokenizer.encode(PROMPT_TEMPLATE);
  const promptTokenCount = promptTokens.length;

  let results: string[] = [];
  let currentPrompt = PROMPT_TEMPLATE;
  let currentArray: { id: string; subject: string }[] = [];
  let currentTokenCount = promptTokenCount;

  for (const email of emails) {
    const emailJson = JSON.stringify({ id: email.id, subject: email.subject });
    const emailTokens = llama3Tokenizer.encode(emailJson);
    const emailTokenCount = emailTokens.length;

    if (currentTokenCount + emailTokenCount + 2 > MAX_TOKENS) {
      // +2 for brackets
      // Finalize current prompt and start a new one
      results.push(`${currentPrompt} ${JSON.stringify(currentArray)}`);
      currentPrompt = PROMPT_TEMPLATE;
      currentArray = [];
      currentTokenCount = promptTokenCount;
    }

    currentArray.push({ id: email.id, subject: email.subject });
    currentTokenCount += emailTokenCount + 2; // +2 for comma and space
  }

  // Add the last prompt if there's anything left
  if (currentArray.length > 0) {
    results.push(`${currentPrompt} ${JSON.stringify(currentArray)}`);
  }

  return results;
}

interface ClassifiedEmail extends Email {
  matchPercentage: number;
}

export class Classifier {
  // private replicate: string;

  // async processEmails(emails: Email[]) {
  //   try {
  //     const llmClient = new LLMClient();

  //     console.log("Initial emails count:", emails.length);

  //     const keywordClassifiedEmails: ClassifiedEmail[] =
  //       this.classifyJobApplicationEmails(emails, THRESHOLD);
  //     console.log(
  //       "Keyword classified emails count:",
  //       keywordClassifiedEmails.length
  //     );

  //     const truncatedEmails = this.truncateEmailBodies(keywordClassifiedEmails);

  //     // //Test for testing
  //     let testingEmailList = [];
  //     testingEmailList.push(...truncatedEmails.slice(0, 20));
  //     console.log("testingEmailList", testingEmailList.length);

  //     // const classificationPromises = testingEmailList.map((truncatedEmail) =>
  //     //   llmClient
  //     //     .classify(
  //     //       promptgen(
  //     //         truncatedEmail.body,
  //     //         truncatedEmail.subject,
  //     //         truncatedEmail.id
  //     //       )
  //     //     )
  //     //     .then((result: any) => {
  //     //       // this is how result looks like
  //     //       // result = [
  //     //       //   {
  //     //       //     "id": "190cbc15974cff50",
  //     //       //     "isJobRelated": false,
  //     //       //     "jobData": {
  //     //       //       "jobId": "",
  //     //       //       "position": "",
  //     //       //       "company": "",
  //     //       //       "status": "",
  //     //       //       "nextStep": "",
  //     //       //       "applicationDate": "",
  //     //       //       "keyDetails": []
  //     //       //     }
  //     //       //   },
  //     //       //   {
  //     //       //     "id": "19038854c9231cf6",
  //     //       //     "isJobRelated": false,
  //     //       //     "jobData": {
  //     //       //       "jobId": "",
  //     //       //       "position": "",
  //     //       //       "company": "",
  //     //       //       "status": "",
  //     //       //       "nextStep": "",
  //     //       //       "applicationDate": "",
  //     //       //       "keyDetails": []
  //     //       //     }
  //     //       //   }
  //     //       // ]

  //     //       // Check if the returned id matches the email's id
  //     //       if (result[0].id !== truncatedEmail.id) {
  //     //         // If not, update the id to match the email's id
  //     //         console.log("Id mismatch");
  //     //         result[0].id = truncatedEmail.id;
  //     //       }
  //     //       return result; // Return the updated object
  //     //     })
  //     // );

  //     const classificationPromises = testingEmailList.map((truncatedEmail) =>
  //       llmClient
  //         .classify(
  //           promptgen(
  //             truncatedEmail.body,
  //             truncatedEmail.subject,
  //             truncatedEmail.id
  //           )
  //         )
  //         .then((result: any) => {
  //           if (result && result.length > 0) {
  //             // Check if the email is not job-related
  //             if (!result[0].isJobRelated) {
  //               // Return null to discard this element
  //               return null;
  //             }

  //             if (result[0].id !== truncatedEmail.id) {
  //               console.log("Id mismatch");
  //               result[0].id = truncatedEmail.id;
  //             }
  //             return this.mergeObjects(truncatedEmail, result);
  //           }
  //           // If result is empty or undefined, return null to discard
  //           return null;
  //         })
  //     );

  //     // After all promises are resolved, filter out null values
  //     // const filteredResults = await Promise.all(classificationPromises).then(
  //     //   (results) => results.filter((result) => result !== null)
  //     // );

  //     const results = await Promise.all(classificationPromises);
  //     console.log("Classification results count:", results.length);
  //     await this.saveResultsToFile(results);
  //     return results;
  //     // return truncatedEmails;
  //     // the return value here should be of this kind make sure to match the details and fields right
  //     // [
  //     //   {
  //     //     "id": "190cbc15974cff50",
  //     //     "isJobRelated": false,
  //     //     "jobData": {
  //     //       "jobId": "",
  //     //       "position": "",
  //     //       "company": "",
  //     //       "status": "",
  //     //       "nextStep": "",
  //     //       "applicationDate": "",
  //     //       "keyDetails": []}
  //     //     from: 'hypoalien@gmail.com',
  //     //     fromName: 'Anisetty Anudeep',
  //     //     subject: 'Re: Important information about your application to Coinbase',
  //     //     body: "DASDASDASD On Thu, 15 Aug 2024 at 14:21, Anisetty Anudeep <> wrote: dadadADAAS On Thu, 15 Aug 2024 at 14:19, Anisetty Anudeep <> wrote: dwqdqwdqwd On Thu, 15 Aug 2024 at 14:18, Anisetty Anudeep <> wrote: wdwadsfs On Thu, 15 Aug 2024 at 14:11, Anisetty Anudeep <> wrote: adasdadasd On Thu, 15 Aug 2024 at 14:04, Anisetty Anudeep <> wrote: dsdadasd On Thu, 15 Aug 2024 at 13:59, Anisetty Anudeep <> wrote: dwdqwqd On Thu, 15 Aug 2024 at 13:57, Anisetty Anudeep <> wrote: hey bro please reply On Thu, 15 Aug 2024 at 13:55, Anisetty Anudeep <> wrote: hello how are you? On Tue, 13 Aug 2024 at 22:52, Anudeep Anisetty <> wrote: ---------- Forwarded message --------- From: <> Date: Mon, Aug 12, 2024 at 7:27 AM Subject: Important information about your application to Coinbase To: <> Hi Anudeep, Thank you for applying to the Software Engineer, Frontend - Consumer Products role at Coinbase. We’re truly inspired by the talented people interested in building an open financial system for the world. While this is never easy news to share, we've decided not to move forward with your candidacy. We appreciate you sharing your qualifications; however, we currently have other candidates with experience that align more closely with our needs at this time. Please keep an eye out for future positions that might be of interest to you, and we will continue to keep your information on file for new openings. We wish you the very best in your job search and future adventures! Coinbase Recruiting Join our Stand with Crypto campaign and become an advocate today.",
  //     //     to: 'Anudeep Anisetty <aaniset1@asu.edu>',
  //     //     date: 2024-08-15T21:22:59.000Z
  //     //   }
  //     // ]
  //   } catch (error) {
  //     console.error("Error during email classification:", error);
  //     throw error;
  //   }
  // }

  async processSubjectsAndEmails(emails: Email[]): Promise<MergedObject[]> {
    // async processSubjectsAndEmails(emails: Email[]) {
    try {
      const llmClient = new LLMClient();

      console.log("Initial emails count:", emails.length);

      const generatedPrompts = promptForSubject(emails);

      console.log("generatedPrompts count", generatedPrompts.length);

      const emailClassificationPromises = generatedPrompts.map(
        (generatedPrompt) => llmClient.classifyWithSeubject(generatedPrompt)
      );

      const results = await Promise.all(emailClassificationPromises);
      console.log("Classification results count:", results.length);
      const neededIds = new Set(
        results
          .flat()
          .filter((item) => item.needBody)
          .map((item) => item.id)
      );

      // Filter the emails array
      const needBodyEmails = emails.filter((email) => neededIds.has(email.id));
      // await this.saveResultsToFile(needBodyEmails);
      const truncatedEmails = this.truncateEmailBodies(needBodyEmails);
      // return truncatedEmails;
      // //Test for testing

      // uncomment teh above line

      let testingEmailList = [
        {
          id: "1904daba7f73e8ac",
          from: "notifications@instructure.com",
          fromName: "2024-2025-Professional-EPICS-PTP",
          subject:
            "Important Update about Resubmissions: 2024-2025-Professional-EPICS-PTP",
          body: "Hello everyone Please read this announcement in its entirety As you might be aware already we permit resubmissions of your report if you have any mistakesshortcomings on your first submission However we have noticed that a lot of students fail to make the required resubmission in a reasonable time frame As such we have decided to more strictly enforce our resubmission rule Start today you will have exactly two weeks to make any resubmissions This is regardless of when your report is graded For example for the week of June 10 to June 16 you will have until June 30 to make any resubmissions After June 30th we will close off the assignment and no more resubmissions will be allowed for any reason At that point if you have a score less than 10 it will count as an invalid report and will count as unemployment This will give you enough time read through grading comments and make any changes required The earlier you have the resubmission the more time you will have to correct your report if there are still any comments After the first grading cycle it will be your responsibility to come to office hours and get it regraded As a side note if you are unable to make submissions on the epicsprocom website due to a technical issue please email your issue with screenshots to In the meantime you are still responsible for your report so please manually write your report and make sure you are still submitting it before the deadline to avoid late submission penalties Please come to office hours on Thursday if you have any questions Best Omkaar Shenoy ProEPICS Staff View announcement Update your notification settings",
          to: "aaniset1@asu.edu",
          date: "2024-06-25T04:33:30.000Z",
        },
        {
          id: "1904d0adae7e8888",
          from: "aaniset1@asu.edu",
          fromName: "Anudeep Anisetty",
          subject: "Account Approval Request to Prevent Unemployment Days",
          body: "Dear Jared I hope this message finds you well I am writing to inform you that I received my Employment Authorization Document EAD today and today is officially my start date I have completed all necessary forms and created an EPICS Pro account Could you please approve my account at your earliest convenience I want to ensure that I do not have any unemployment days Thank you for your prompt attention to this matter Best regards Anudeep Anisetty",
          to: "jschoep@asu.edu",
          date: "2024-06-25T01:37:54.000Z",
        },
        {
          id: "1904d07b617d2369",
          from: "no-reply@mail.w4m.ai",
          fromName: "",
          subject: "Verify your account- epics@asu",
          body: "96 boxsizing borderbox body margin 0 padding 0 axappledatadetectors color inherit important textdecoration inherit important MessageViewBody a color inherit textdecoration none p lineheight inherit desktophide desktophide table msohide all display none maxheight 0px overflow hidden imageblock imgdiv display none media maxwidth660px desktophide tableiconsinner socialblockdesktophide socialtable display inlineblock important iconsinner textalign center iconsinner td margin 0 auto mobilehide display none rowcontent width 100 important stack column width 100 display block mobilehide minheight 0 maxheight 0 maxwidth 0 overflow hidden fontsize 0px desktophide desktophide table display table important maxheight none important 8202 epicsasu 8202 8202 8202 Verify your EPICS account 8202 8202 8202 Hello nbsp You signed up for an account at ASU EPICS Please use the below link to verify the account If you did not sign up for an account please ignore this email nbsp Thank you EPICS ASU Verify Email 8202",
          to: "aaniset1@asu.edu",
          date: "2024-06-25T01:34:24.000Z",
        },
        {
          id: "1904d05bb984f6b4",
          from: "noreply@airtable.com",
          fromName: "Airtable",
          subject: "Your response to Onboarding Survey",
          body: "Review the response to Onboarding Survey below Did you read the above onboarding process step by step guideYes I have read the entirety of the instructions Questions on this form will appear onebyone First nameanudeep Last nameanisetty ASU ASU ID Number1226659462 Recent degree awardedMasters What is your programmajorarea of studyInformation Technology Do you need OPTYes Do you have your physical EAD card with youYes I have my physical EAD card in hand Please upload a picture of your physical EAD card Scanned Documentpdf When would you like to startJune 24 2024 What is your estimate level of time commitment20 Hours per Week Do you have a job offer or expect to have a job offer in the next 13 weeksNo I do not expect a job offer within the next 3 weeks Can you commit at least 4 weeks to being in the program Yes I can commit at least 4 weeks to this program In the next sections click on the box to indicate that you have read and you agree to the given statements I approve of being added to the program in Canvas and understand this program is a professional program with professional expectations ☑ I will attend the Zoom onboarding to join the program you must attend Zoom to stop unemployment days from accruing and attend office hours every day until I am officially on a project☑ I will complete the certification in Engineering Project Management and InterPersonal Skills in Project Management☑ I will turn in my weekly hour verification document detailing my work in the program by the Sunday midnight deadline☑ I understand the projects in the program are unpaid and no project will result in a job or any form of payment now or in the future☑ I understand the onboarding process outlined above in the survey description ☑ If anything what was confusing in the survey description given at the beginning ©2024 Airtable",
          to: "aaniset1@asu.edu",
          date: "2024-06-25T01:32:16.000Z",
        },
        {
          id: "1904c0ab59e7c127",
          from: "jjschoep@asu.edu",
          fromName: "Jared Schoepf",
          subject:
            "FW: Onboarding - Professional EPICS: Professional Training Program",
          body: "",
          to: "",
          date: "2024-06-24T20:57:45.000Z",
        },
        {
          id: "1904b4508a27cad5",
          from: "handshake@mail.joinhandshake.com",
          fromName: '"ASU\'s Fulton Schools Career Center"',
          subject:
            "Resumes, Interviews, Salary Workshops | Adobe, Amazon, FBI, FEMA, NiSource",
          body: "Update your Handshake profile with what you are seeking locations GPA expected graduation date and resume Make your profile and documents public to employers so they can find you Check your Handshake Inbox frequently employers may be sending you messages there In addition to our weekly career webinars we have a special series planned for July Scroll down to the Career Advice from Industry section to reserve your spot to hear from Amazon and Intel Get help by attending our weekly live career workshops dropping your resume for review into SkillsFirst and making an appointment the Fulton Schools of Engineering peer career coaches and staff who are available over summer Preparing for the upcoming career fairs in September update your resume and Handshake profile with recent experiences Formulate your search strategy and practice interviewing Update Your Resume Watch FSEs 10 minute resume video Use our industryendorsed resume examples Then submit your resume for review Submit Your Resume for Review Schedule a 11 Online Appointment The Engineering Career Center is open over summer Staff and peer career coaches are available for 11 appointments Go to HandshakeCareer CenterAppointmentsSchedule A New Appointment blue buttonFulton Schools of Engineering then select a topic and time A confirmation will be sent once they are reviewed You will receive a link from Handshake for your video appointment a few minutes before it starts Check your profile for what time zone you have listed Career Workshops Event Engineering Workshop Create Your Technical Resume June 24 2024 • 100 pm 200 pm MST Event Engineering Workshop Conduct an Effective InternshipJob Search June 24 2024 • 200 pm 300 pm MST Event Engineering Workshop Understand Salary Negotiations June 24 2024 • 300 pm 400 pm MST Event FSE Pro Epics Create Your Technical Resume June 24 2024 • 330 pm 430 pm MST Event Engineering Workshop Interviewing Basics June 25 2024 • 1000 am 1100 am MST Event Engineering Workshop Understand Salary Negotiations June 25 2024 • 1100 am 1200 pm MST Event FSE Pro Epics Interviewing Basics June 25 2024 • 330 pm 430 pm MST Event FSE Pro Epics Conduct an Effective Internship Job Search June 26 2024 • 330 pm 430 pm MST Event Engineering Workshop Create Your Technical Resume June 27 2024 • 100 pm 200 pm MST Event Engineering Workshop Conduct an Effective InternshipJob Search June 27 2024 • 200 pm 300 pm MST Event FSE Pro Epics Understanding Compensation Package June 28 2024 • 330 pm 430 pm MST Employer Events Event Amazon Culture —How Glamazon fosters community promotes Diversity and Inclusion June 25 2024 • 1100 am 200 pm PDT Amazon attending Event FBI Special Agent InfoQA Session Hosted by FBI San Francisco June 25 2024 • 1230 pm 130 pm PDT Federal Bureau of Investigation attending Event Joining AmeriCorps Pathways to Employment June 25 2024 • 400 pm 500 pm EDT AmeriCorps attending Event Veterans Get into Energy with NiSource June 25 2024 • 530 pm 630 pm CDT NiSource Inc attending Event Virtual office hour with USPTO patent examiners June 26 2024 • 1200 pm 100 pm EDT US Patent and Trademark Office attending Event Research Career Webinar Clinical Research Coordinators and Research Technologists June 26 2024 • 100 pm 200 pm EDT Mayo Clinic attending Event Discover How NiSource is Transforming Leveraging Innovation in the Energy Industry June 26 2024 • 530 pm 630 pm CDT NiSource Inc attending Event DHS Career Expo Jun 27th 28th 2024 • 1000 am 600 pm EDT Federal Emergency Management Agency FEMA attending Event Construction Project Management Online Networking Event June 27 2024 • 1200 pm 100 pm PDT JLL attending Event JumpStart Your Career in Adobe Experience Cloud June 28 2024 • 1000 am 1100 am EDT Adobe Systems attending Career Advice from Industry Professionals Event Engineering Workshop Career Advice from Industry Professionals Amazon July 17 2024 • 330 pm 430 pm MST Event Engineering Workshop Career Advice from Industry Professionals July 24 2024 • 330 pm 430 pm MST Event Engineering Workshop Career Advice from Industry Professionals Intel July 31 2024 • 330 pm 430 pm MST InternshipJob Search ToDos Dedicate time each day in investing in your career The recruiting season student checklist get you started Update your resume using the employerpreferred format Complete your Handshake profile upload your documents follow career fairs events and employers apply to internships and jobs Attend the career workshop series Check out all of the presentations and resources on the Career Center website Make it an excellent week Fulton Schools Career Center This email is being sent to Anudeep Anisetty at Arizona State University Unsubscribe • Update preferences PO Box 40770 San Francisco CA 94140",
          to: "aaniset1@asu.edu",
          date: "2024-06-24T17:14:30.000Z",
        },
        {
          id: "1904af2a149b55b5",
          from: "do-not-reply.SEVP@ice.dhs.gov",
          fromName: "",
          subject:
            "Optional Practical Training Approval - the next step.  Create an SEVP Portal account.",
          body: "Student Name Anudeep Anisetty Type of OPT postcompletion RE Optional Practical Training Approval the next step Create a SEVP Portal account Congratulations on the approval of your Optional Practical Training OPT You are now ready to create your SEVP Portal account the next step in the OPT process By law you must report changes to Your address or telephone number Employer information The SEVP Portal is the tool you will use to report these changes Use the following link to go to the Create SEVP Portal Account page IMPORTANT This link is valid for 14 days beginning on the date of this email If the link expires contact your designated school official DSO for help Your DSO can request a new link for you To create your account you will be asked to enter your SEVIS ID number and create a password You can find your SEVIS ID in the top left corner of your Form I20 below the words Department of Homeland Security Refer to the sample Form I20 Carefully review the password guidelines for the portal For more information about student reporting requirements and instructions on how to navigate the SEVP Portal visit the SEVIS and SEVP Portal section on Study in the States Do not reply to this email It was sent from a mailbox that is not monitored You will get no response For help with this process contact the SEVP Response Center Email at or Telephone at 703 6033400 Monday through Friday 800 AM to 600 PM ET except US holidays Sincerely The Student and Exchange Visitor Program",
          to: "aaniset1@asu.edu",
          date: "2024-06-24T15:52:03.000Z",
        },
        {
          id: "1904a8f0c5b57d98",
          from: "careerservices@reply.asu.edu",
          fromName: "ASU Career Services",
          subject: "What's next Anudeep?",
          body: "ReadMsgBody width 100 ExternalClass width 100 ExternalClass ExternalClass p ExternalClass span ExternalClass font ExternalClass td ExternalClass div lineheight 100 body webkittextsizeadjust100 mstextsizeadjust100margin0 important p margin 1em 0 table td bordercollapse collapse img outline0 a img bordernone msviewport width devicewidth thresponsivetd fontweight normal textalign left media only screen and maxwidth 480px container width 100 important footer widthauto important marginleft0 mobilehidden displaynone important logo displayblock important padding0 important img maxwidth100 important heightauto important maxheightauto important header imgmaxwidth100 importantheightauto important maxheightauto important photo img width100 important maxwidth100 important heightauto important drop displayblock important width 100 important floatleft clearboth footerlogo displayblock important width 100 important paddingtop15px floatleft clearboth nav4 nav5 nav6 display none important tableBlock width100 important REPLACE THIS DEFAULT MARKETING CLOUD STYLE WITH UPDATED STYLES FOR OUTLOOK responsivetd width100 important displayblock important padding0 important fluid fluidcentered width 100 important maxwidth 100 important height auto important marginleft auto important marginright auto important fluidcentered marginleft auto important marginright auto important MOBILE GLOBAL STYLES DO NOT CHANGE YOU SHOULD REALLY CHOOSE YOUR OWN FONT STYLE CHANGES FOR MOBILE body padding 0px important fontsize 16px important lineheight 150 important h1 fontsize 22px important lineheight normal important h2 fontsize 20px important lineheight normal important h3 fontsize 18px important lineheight normal important buttonstyles fontfamilyarialhelveticasansserif important fontsize 16px important color FFFFFF important padding 10px important END OF MOBILE GLOBAL STYLES DO NOT CHANGE THESE ARE THE NEW STYLES FOR THE MS OUTLOOK MOBILE APP HIDES THE DISPLAY CHANGE FROM OUTLOOK classresponsivetd width 100 important display block important MAKE SURE THE GMAIL APP FOR IOS GETS THE DISPLAY CHANGE YOU MUST ADD THE CLASS body TO THE BODY TAG FOR THIS TO WORK u body responsivetd width 100 important display block important ONLY THE OUTLOOK APP WILL APPLY THE FIXED WIDTH TO THE CONTAINER bodydataoutlookcycle container width 480px important media only screen and maxwidth 640px container width100 important mobilehidden displaynone important logo displayblock important padding0 important photo img width100 important heightauto important nav5 nav6 display none important fluid fluidcentered width 100 important maxwidth 100 important height auto important marginleft auto important marginright auto important fluidcentered marginleft auto important marginright auto important Begin Outlook Font Fix body table td fontfamily Arial Helvetica sansserif fontsize16px color000000 lineheight1 End Outlook Font Fix divpreheader display none important Take the FDS survey today Whats your next destination Grad So Anudeep where are you headed next Whether yoursquore pursuing a new job graduate school service program or anything else we want to hear about it And if you are still looking for that first great career we can help The First Destination Survey is designed to capture the postgraduation activities of recent college graduates like you Your story matters and sharing it helps us paint a clearer picture of postgraduation journey nbsp Take the Survey Take the survey by July 1 2024 to be entered to win an Amazon Echo Show 8 or an Alumni swag bag Winners will be announced on sundevilcareers nbspnbsp Career Resources Available to AlumniApply for Opportunities with Handshake Access exclusive job and internship listings tailored to ASU students and alumni Register for career and internship fairs and connect with ASU Career Advisors for personalized guidance Enhance Your Resume with VMock Get instant resume feedback 247 using VMocks datadriven analysis based on employer criteria and global best practices Perfect Your Interview Skills with Big Interview Practice and refine your interview skills with tailored mock interviews expert coaching and a vast library of practice questions Schedule a Career Advising Appointment From resume proofing to LinkedIn profile optimization our expert advisors are here to support you Schedule an appointment with us today Your career journey is important to us and were here to empower you every step of the way nbsp Career Services",
          to: "<aaniset1@asu.edu>",
          date: "2024-06-24T14:01:45.000Z",
        },
        {
          id: "19038854c9231cf6",
          from: "engineeringupdate@reply.asu.edu",
          fromName: "Engineering Alumni Chapter",
          subject: "Engineering Alumni Chapter June update",
          body: "The official ASU Engineering alumni newsletter View this email as a webpage Hello Sun Devil Nation Hello Engineering Alumni and welcome to summer Campus is kind of quiet right now with everyone gone We had a successful graduation with two ceremonies for our students and had ­­­4589 engineering graduates this past May We are delighted to welcome our new graduates to the Arizona State University Engineering Alumni Chapter Our chapter is dedicated to fostering a vibrant and engaged community of engineering alumni who are passionate about staying connected with their alma mater supporting current students and advancing the field of engineering As members of this chapter you will have the opportunity to network with fellow alumni participate in professional development events and give back to the ASU community through mentorship and volunteering Together we can continue to build on the legacy of innovation and excellence that defines the Ira A Fulton Schools of Engineering We look forward to your involvement and to creating lasting connections within our alumni network It is that time of year when we are all traveling with our family and friends to cooler places or abroad to another country We would love to hear from you about your travels Please send us your photos and where they were taken and we will share them in a future newsletter It is also that time to start thinking about E2 and the firstyear students coming to campus in the fall Please let us know if you are interested in signing up for a camp or two or three — see the dates — and come to Rock the Pines with us Well be hosting our annual alumni gettogether on Saturday August 10 2024 in Prescott so consider getting away to cooler weather by joining us Sign up We will be starting to plan some events for this coming calendar year so if you have ideas let us know I hear pickleball is abuzz right now Maybe a football tailgate on campus or an away game now that we are in the Big 12 conference There is also a rumor we could be coming to Cincinnati for the game in October so if you are in the area let us know As always we value your input and suggestions If you are interested in writing an alumni spotlight or know a great student we could feature let us know You can reach out to Jennifer Williams subject or Aaron Dolgin subject with your suggestions Go Devils Jennifer Williams Director of Alumni Engagement 16 BS in human systems engineering 18 MS in human systems engineeringAaron Dolgin Director of NewsletterSocial Media 18 BS in engineering electrical systems We need your input on alumni activities Please let us know what activities you would like to do together as alumni Your insights are essential for us to create events and experiences that truly allow alumni to reconnect while having fun If you have any questions feel free to reach out to Rachel Hayden at subjectInput20on20alumni20activities or Jennifer Williams at subjectInput20on20alumni20activities Take survey Join us E2 Engineering Alumni GetTogether in Prescott Get away to the cool pines of Prescott Arizona and volunteer at E2 Its a great opportunity for a minivacation Meet with the Fulton Schools faculty and leadership including Dean Kyle Squires and network with other ASU alumni Food and drinks will be provided E2 Engineering Alumni GetTogether Saturday August 10 2024 6–8 pm MST LazyG Brewhouse 220 West Leroux Street Prescott AZ 86303 map Learn more Engineering alumni spotlight Zachary Goode 23 BS in engineering robotics 24 MS in manufacturing engineering I grew up in El Dorado Hills California and moved to Arizona in 2019 for the start of my freshman year at the ASU Polytechnic campus I originally joined ASU as an engineering major with a focus in robotics and as a part of Barrett The Honors College but added on the manufacturing degree as a second major in my sophomore year I began the Accelerated Masters program my senior year in the manufacturing program and finished with my masters this last semester spring 2024 My sophomore year I got involved with the 3DX additive manufacturing research group under Dr Dhruv Bhate through an honors contract I did with him for his EGR218 Materials and Manufacturing Processes course In Dr Bhates group I was able to work on a variety of projects such as multimaterial mechanical structures and metal additive wicking structures I have also been given the chance to become proficient in SEM imaging techniques 3D scanning and various additive manufacturing processes Later on I was given the opportunity to also work alongside Dr Niris group for my masters applied project and gain experience in acoustic NDT techniques Currently I am working at Northrop Grumman in Gilbert Arizona where I also interned while attending ASU I currently work in the specialty engineering group as a systems engineer doing electrical radiation analysis and simulation I was lucky enough to land this internship which has transitioned into a fulltime position through my connections in the SCALE program a program based out of Purdue University to expand defenserelated microelectronics work I was introduced to this program via a class I took with Dr Bhate which was an introductory course to microelectronics manufacturing and design Further reading ASU graduate impacts manufacturing engineering research From pizza pies to power plays The rise of an engineering leader Equipped with the strong foundation in mechanical engineering gained from ASU Jacob Tetlow has had a successful career despite his humble beginnings He graduated in 1995 from what was then the College of Engineering and Applied Sciences — now the School for Engineering of Matter Transport and Energy Engineering is a tradition in Tetlow’s entire family many of whom also graduated from the Fulton Schools Tetlows father and four brothers are mechanical engineers and one of his children decided to pursue a career in electrical engineering Read more Engineering a safe space for LGBTQ STEM students In celebration of Pride Month we are celebrating a Fulton Schools student organization dedicated to giving LGBTQ students a space to build friendships and network with professionals and other students — Out in Science Technology Engineering and Mathematics or oSTEM oSTEM members meet regularly Activities alternate between fun events such as trivia competitions social mixers and board games tournaments They also offer career development opportunities like resume reviews learning about industry STEM opportunities from professionals and conducting informational panels about graduate school and research paths Read more Engineer your advancement How can busy professional engineers get the training needed to boost their careers and prepare to lead large teams while remaining focused on their current work Ross Maciejewski director of the School of Computing and Augmented Intelligence or SCAI recently announced the launch of a fully online Doctor of Engineering or DEng with a focus in engineering management The program is designed to provide access to a quality educational experience that is flexible enough to be completed in tandem with an engineers current work It will launch this fall The new DEng in engineering management seeks to create a pathway for professional engineers to advance into roles that require highly sophisticated skills Maciejewski says The asynchronous learning program is designed to be of great value to both engineers and their employers The degree culminates in an applied research project that will ideally be completed in conjunction with the engineers work for their current employer or be aligned with current research interests Learn more Latest news Striving to save lives on nations roadways a second career after many years as an ASU engineering professor Norma Hubele has made her mark as a leading authority on automobile safety Deducing degradation causes in perovskites their perseverance dedication and outreach each of these graduates is leaving a lasting impact on the ASU community Arizona and around the world Paving precision Navigating the path to pavement quality control Professor Hasan Ozer is collaborating with the city of Mesa Arizona to conduct quality control experiments on the asphalt laydown process From ASU to Artemis Engineering student helps astronauts suit up for moon mission engineering major Abril Ramos has been instrumental to startup Swift Coats success in the NASA Small Business Innovation Research program Register now to boost your career with stackable microcredentials The Fulton Schools offers stackable microcredentials a flexible innovative learning pathway tailored for today’s workforce Learn from ASU faculty and industry experts in emerging technologies like smart manufacturing automation and more These specialized courses offer focused industryrelevant skills allowing you to quickly earn microbadges and stack your new skills into badges from the Fulton Schools Enhance your resume and expertise leveling up your career with our cuttingedge approach to education New courses begin as soon as next week Register today Get Lean Six Sigma certified Global Outreach and Extended Education offers Lean Six Sigma certification through an asynchronous online course Lean Six Sigma certification equips learners with advanced problemsolving skills and a structured methodology to streamline processes and eliminate waste within organizations The program teaches skills to analyze data optimize operations and lead improvement initiatives ASU alumni are eligible for a 10 discount on the Green and Black Belt programs using the code ASUAlumni Yellow Belt The Yellow Belt Certification is an introduction to Lean and Six Sigma methodology This certification will introduce you to the tools and methods needed to achieve your goals in process improvement The course is offered twice a month Green Belt The Green Belt Certification builds off the Yellow Belt certification and allows participants to actively engage with the methodology through an applied project Participants may complete the Green Belt without completing the Yellow Belt first The applied project allows participants to apply the skills they are learning directly in their workplace Please be aware that participants must come up with their own projects based on their workplace or volunteer positions Green Belt courses are offered on a monthly basis with new courses starting soon including the ServiceTransactional Certification and the Health Care Certification Black Belt The Black Belt Certification is an advanced certification that requires prior completion of the Green Belt This certification covers more advanced statistical analysis and modeling The Black Belt Certification also includes an applied project The course is offered quarterly For more information email Ignite a passion for engineering in a classroom Have you ever wanted to ignite a passion for learning math science technology or engineering within the hearts of eager young students Do you remember that first spark of curiosity and the teachers or mentors who played a pivotal role in your own educational journey Now imagine having the opportunity to share your fervor for engineering and become that guiding influence for both a teacher and a classroom of enthusiastic students In a world driven by innovation the need for skilled professionals in the fields of science technology engineering and mathematics or STEM has never been more critical The foundation of a successful STEM education often begins with role models who can connect classroom learning with realworld applications This is where you as an engineering professional can make an enduring impact Introducing Educator Pro Connect The Maricopa County School Superintendent’s Office led by Steve Watson has introduced an innovative platform called Educator Pro Connect or EPC EPC is designed to bring together engineering and other industry professionals with educators creating a pathway for the development of future engineers and careers within our K12 schools Why Educator Pro Connect Our mission is simple to connect engineering and other industry professional experts like you with K12 classrooms providing invaluable insights into career pathways and facilitating the practical and application of knowledge and skills By registering in the Educator Pro Connect platform and creating your profile youll have the opportunity to be matched with educators who are eager to introduce their students to the realworld relevance of engineering Make a lasting impact and join us By registering and participating in the Educator Pro Connect platform youll be bridging the gap between the classroom and the real world enriching the educational experience for K12 learners Your expertise can make a significant difference in shaping the next generation of engineers and problem solvers Dont wait any longer to share your passion for engineering and inspire the engineers of tomorrow Join us in creating a brighter future through the power of education and engineering Together we can make a lasting impact on young minds Register now at Educatorproconnectorg and lets ignite the spark of engineering innovation in our K12 classrooms Learn more Are you looking to boost your career prospects in the field of microelectronics Because microchips drive virtually every area of our lives the Microelectronics Specializations Portfolio from ASU’s CareerCatalyst provides learners with the engineering skills essential to understanding and working with each key step in this vital industry materials tools design applications manufacturing processes and packaging Stackable credentials for flexible learning and career objectives Designed by expert ASU faculty in partnership with industry leaders these nine specializations cover the critical capabilities indemand skills and academic credentials engineers need to pursue a variety of personal and professional pathways All specializations are available on Coursera 100 online and are selfpaced Lead in a range of industries Manufacturing Telecommunications engineering Signal processing Control engineering Prepare for a variety of roles Electrical engineer Electronics engineer Electronic design engineer Systems engineer Available Offerings Additive Manufacturing Processes Learn the basics of additive manufacturing processes materials and design including handson demonstrations of six industrystandard 3D printing processes Battery Technologies Explore the use of batteries in electric vehicles including battery design cell chemistries and power management systems Introduction to Semiconductor Packaging Learn materials science essential to effective packaging as well as packaging concepts and how functional parts are designed manufactured and protected Materials Science for Technological Applications Gain a fundamental understanding of materials in contemporary engineering and their properties for use in electronics and microelectronics Materials Science for Advanced Technological Applications Learn how to predict microstructures select and strengthen materials for applied use in semiconductors conductors and insulators with an emphasis on diffusion and phase diagrams Rapid Prototyping and Tooling Learn effective prototyping as a key component of the engineering design process best practices for material selection and the importance of early feedback and iterative design Rapid Prototyping Using 3D Printing Explore the role of 3D printing in rapid prototyping with a focus on the principles applications and limitations of 3D printing Semiconductor Characterization Learn the fundamentals of semiconductor materials and measurement techniques for semiconductor materials and devices Available soon Introduction to Industrial Automation Examine concepts and practices of industrial automation in advanced manufacturing including programmable logic controllers inputoutput components and control methods Learn more and start your specialization today Keep us posted To continue receiving Fulton Schools alumni communications we encourage you to update your contact information if it has recently changed We look forward to connecting with you and appreciate your support Update your contact information Lets stay in touch The ASU Alumni engineering chapter provides opportunities for you to participate in activities supplies leadership during dynamic studentfocused events advocates for ASUEngineering talent and creates relationships with industry Your participation helps to build a strong alumni community Stay in touch by joining the ASU Alumni Engineering Slack channel Contact Jennifer to explore more ways you can get involvedJennifer Williams Associate Director of Development 4807271688 subject engineeringasueduinvest Give today This email was sent to To ensure future delivery please add to your safe sender list or address book Forward to a friend Update Profile Unsubscribe View this email online This email was sent by ASU Ira A Fulton Schools of Engineering 699 S Mill Ave Tempe AZ 85281 USA",
          to: "<aaniset1@asu.edu>",
          date: "2024-06-21T01:54:25.000Z",
        },
        {
          id: "190c67dd0c34668d",
          from: "handshake@g.joinhandshake.com",
          fromName: "Handshake",
          subject:
            "Your weekly jobs round-up: Heal Me Fit, InterSources Inc, McKinsey & Company",
          body: "Your weekly jobs roundup New jobs just for you sent every week Heal Me Fit Information Technology Software Developer Intern 200–600mo Remote Internship InterSources Inc Internet Software iOS Developer Hybrid Job Mesa AZ McKinsey Company Management Consulting FullTime Business Analyst 112–125Kyr Hybrid Job Million Dollar Teacher Project K12 Education Classroom Support Team Intern Onsite Internship Phoenix AZ 1 Pearl Lemon Advertising PR Marketing Chrome Extension Developer 900mo Remote Job Washington State Department of Ecology Environmental Services Web Application Developer – Journey 817–1098Kyr Hybrid Job Bellingham WA 5 Alachua County Board of County Commissioners Government Local State Federal Web Design Specialist 589Kyr Hybrid Job Gainesville FL Chicago Transit Authority Transportation Logistics 20242025 Yearlong SharePoint Development Intern Office of Chief Administrative Officer 17–22hr Hybrid Internship Chicago IL St Josephs Indian School K12 Education Data Entry Supervisor 15–20hr Onsite Job Sioux Falls SD Infozeal Solutions Information Technology ServiceNow Developer 50–60Kyr Onsite Job Mission TX 10 View these jobs Not seeing jobs you like Update your career interests You received this email because Handshake partners with your school to help you grow your career Manage email preferences or unsubscribe PO Box 40770 San Francisco CA 94140",
          to: "aaniset1@asu.edu",
          date: "2024-07-18T09:08:53.000Z",
        },
      ];
      console.log("truncatedEmailsEmailList for LLM", truncatedEmails.length);
      const classificationPromises = truncatedEmails.map((truncatedEmail) =>
        llmClient
          .classifyWithEmail(
            promptForEmail(
              truncatedEmail.body,
              truncatedEmail.subject,
              truncatedEmail.id
            )
          )
          .then((result: any) => {
            console.log("results ", result);
            if (result && result.length > 0) {
              if (result[0].id !== truncatedEmail.id) {
                console.log("Id mismatch");
                result[0].id = truncatedEmail.id;
              }
              return this.mergeObjects(truncatedEmail, result);
            }
            return [];
          })
      );

      const clsifiedResults = await Promise.all(classificationPromises);
      // console.log("Classification results count:", clsifiedResults.length);
      // await this.saveResultsToFile(clsifiedResults.flat());
      return clsifiedResults.flat();
    } catch (error) {
      console.error("Error during email classification:", error);
      throw error;
    }
  }
  private mergeObjects(truncatedEmail: any, result: any): MergedObject {
    console.log("merge objects", result);
    return {
      ...result[0],
      ...truncatedEmail,
      id: truncatedEmail.id, // Ensure the id from truncatedEmail is used
    };
  }

  // private mergeObjects(truncatedEmail: any, result: any | any[]): MergedObject {
  //   console.log("merge objects", result);

  //   let baseObject: any;

  //   if (Array.isArray(result)) {
  //     if (result.length === 0) {
  //       console.warn("Result array is empty, using an empty object as base");
  //       baseObject = {};
  //     } else {
  //       baseObject = result[0];
  //     }
  //   } else if (typeof result === "object" && result !== null) {
  //     baseObject = result;
  //   } else {
  //     console.error("Invalid result type", result);
  //     throw new Error("Invalid result type");
  //   }

  //   // Merge objects, giving priority to non-undefined values from truncatedEmail
  //   const mergedObject: MergedObject = {
  //     ...baseObject,
  //     ...Object.fromEntries(
  //       Object.entries(truncatedEmail).filter(
  //         ([_, value]) => value !== undefined
  //       )
  //     ),
  //     id: truncatedEmail.id, // Ensure the id from truncatedEmail is always used
  //   };

  //   return mergedObject;
  // }
  private async saveResultsToFile(results: any[]): Promise<void> {
    try {
      // Convert the results array to a formatted JSON string
      const jsonString = JSON.stringify(results, null, 2);

      // Write the JSON string to log.txt
      await fs.writeFile("log.txt", jsonString, "utf8");

      console.log("Results successfully saved to log.txt");
    } catch (error) {
      console.error("Error saving results to file:", error);
    }
  }
  private turncatContent(content: string) {
    // Remove special characters
    const cleanedContent = content.replace(
      /[*\[\]{}()`~!@#$%^&*_\-+=|\\:;"'<>,.?/]/g,
      ""
    );

    // Remove extra whitespace
    let trimmedContent = cleanedContent.replace(/\s+/g, " ").trim();
    const tokens = llama3Tokenizer.encode(trimmedContent);
    if (tokens.length > 3500) {
      trimmedContent = llama3Tokenizer.decode(
        tokens.slice(0, MAX_EMAIL_BODY_TOKEN)
      );
    }

    return trimmedContent;
  }
  private truncateEmailBodies(emails: Email[]): Email[] {
    return emails.map((email) => ({
      ...email,
      body: this.turncatContent(email.body),
    }));
  }
  private classifyJobApplicationEmails(
    emails: Email[],
    threshold: number = 5
  ): ClassifiedEmail[] {
    const jobKeywords: Keyword[] = [
      // Positive keywords (extending the existing list)
      { word: "job application", weight: 2 },
      { word: "apply", weight: 1.5 },
      { word: "applied", weight: 1.5 },
      { word: "applying", weight: 1.5 },
      { word: "position", weight: 1 },
      { word: "role", weight: 1 },
      { word: "resume", weight: 2 },
      { word: "CV", weight: 2 },
      { word: "cover letter", weight: 2 },
      { word: "job opportunity", weight: 2 },
      { word: "career", weight: 1 },
      { word: "hiring", weight: 1.5 },
      { word: "recruitment", weight: 1.5 },
      { word: "recruiting", weight: 1.5 },
      { word: "interview", weight: 1.5 },
      { word: "employment", weight: 1 },
      { word: "job opening", weight: 2 },
      { word: "vacancy", weight: 1.5 },
      { word: "applicant", weight: 1.5 },
      { word: "candidate", weight: 1.5 },
      { word: "candidacy", weight: 2 },
      { word: "job description", weight: 2 },
      { word: "qualifications", weight: 1.5 },
      { word: "experience", weight: 1 },
      { word: "skills", weight: 1 },
      { word: "salary", weight: 1 },
      { word: "recruiter", weight: 2 },
      { word: "talent acquisition", weight: 2 },
      { word: "human resources", weight: 1.5 },
      { word: "HR", weight: 1.5 },
      { word: "job fair", weight: 1.5 },
      { word: "career opportunity", weight: 2 },
      { word: "job search", weight: 1.5 },
      { word: "application process", weight: 2 },
      { word: "job market", weight: 1 },
      { word: "thank you for applying", weight: 3 },
      { word: "application received", weight: 2.5 },
      { word: "under consideration", weight: 2 },
      { word: "move forward", weight: 2 },
      { word: "selection process", weight: 2 },
      { word: "next steps", weight: 1.5 },
      { word: "further consideration", weight: 2 },
      { word: "shortlisted", weight: 2.5 },
      { word: "successful application", weight: 2.5 },
      { word: "job offer", weight: 3 },
      { word: "offer letter", weight: 3 },
      { word: "onboarding", weight: 2 },
      { word: "start date", weight: 2 },
      { word: "background check", weight: 2 },
      { word: "references", weight: 1.5 },
      { word: "competitive salary", weight: 1.5 },
      { word: "benefits package", weight: 1.5 },
      { word: "company culture", weight: 1 },
      { word: "team fit", weight: 1.5 },
      { word: "skill set", weight: 1.5 },
      { word: "job requirements", weight: 2 },
      { word: "application status", weight: 2 },
      { word: "follow up", weight: 1.5 },
      { word: "talent pool", weight: 1.5 },
      { word: "career growth", weight: 1 },
      { word: "professional development", weight: 1 },
      { word: "job seeker", weight: 2 },
      { word: "career transition", weight: 1.5 },
      { word: "job board", weight: 1.5 },
      { word: "LinkedIn", weight: 1 },
      { word: "Indeed", weight: 1 },
      { word: "Glassdoor", weight: 1 },
      { word: "work experience", weight: 1.5 },
      { word: "job title", weight: 1.5 },
      { word: "job duties", weight: 1.5 },
      { word: "job responsibilities", weight: 1.5 },
      { word: "career path", weight: 1 },
      { word: "career advancement", weight: 1 },
      { word: "job satisfaction", weight: 1 },
      { word: "work-life balance", weight: 1 },
      { word: "remote work", weight: 1 },
      { word: "telecommute", weight: 1 },
      { word: "flexible hours", weight: 1 },
      { word: "full-time", weight: 1 },
      { word: "part-time", weight: 1 },
      { word: "contract", weight: 1 },
      { word: "permanent", weight: 1 },
      { word: "temporary", weight: 1 },
      { word: "internship", weight: 1.5 },
      { word: "entry-level", weight: 1.5 },
      { word: "mid-level", weight: 1.5 },
      { word: "senior-level", weight: 1.5 },
      { word: "executive", weight: 1.5 },
      { word: "leadership", weight: 1 },
      { word: "management", weight: 1 },
      { word: "team player", weight: 1 },
      { word: "self-starter", weight: 1 },
      { word: "motivated", weight: 1 },
      { word: "passionate", weight: 1 },
      { word: "driven", weight: 1 },
      { word: "detail-oriented", weight: 1 },
      { word: "problem-solving", weight: 1 },
      { word: "communication skills", weight: 1 },
      { word: "interpersonal skills", weight: 1 },
      { word: "technical skills", weight: 1 },
      { word: "soft skills", weight: 1 },
      { word: "hard skills", weight: 1 },
      { word: "transferable skills", weight: 1 },
      { word: "networking", weight: 1 },
      { word: "professional network", weight: 1 },
      { word: "industry experience", weight: 1.5 },
      { word: "sector", weight: 1 },
      { word: "field", weight: 1 },
      { word: "domain expertise", weight: 1.5 },
      { word: "subject matter expert", weight: 1.5 },
      { word: "SME", weight: 1.5 },
      { word: "certification", weight: 1.5 },
      { word: "degree", weight: 1.5 },
      { word: "diploma", weight: 1.5 },
      { word: "education", weight: 1.5 },
      { word: "training", weight: 1.5 },
      { word: "workshop", weight: 1 },
      { word: "seminar", weight: 1 },
      { word: "conference", weight: 1 },
      { word: "industry event", weight: 1 },
      { word: "career fair", weight: 1.5 },
      { word: "job expo", weight: 1.5 },
      { word: "networking event", weight: 1 },
      { word: "career coach", weight: 1.5 },
      { word: "career counselor", weight: 1.5 },
      { word: "mentor", weight: 1 },
      { word: "mentorship", weight: 1 },
      { word: "career advice", weight: 1.5 },
      { word: "job search strategy", weight: 2 },
      { word: "personal brand", weight: 1 },
      { word: "professional brand", weight: 1 },
      { word: "online presence", weight: 1 },
      { word: "digital footprint", weight: 1 },
      { word: "portfolio", weight: 1.5 },
      { word: "work samples", weight: 1.5 },
      { word: "achievements", weight: 1 },
      { word: "accomplishments", weight: 1 },
      { word: "success stories", weight: 1 },
      { word: "career highlights", weight: 1.5 },
      { word: "professional summary", weight: 1.5 },
      { word: "executive summary", weight: 1.5 },
      { word: "career objective", weight: 1.5 },
      { word: "professional objective", weight: 1.5 },
      { word: "thanks for applying", weight: 3 },
      { word: "thank you for applying", weight: 3 },
      { word: "application received", weight: 3 },
      { word: "received your application", weight: 3 },
      { word: "review your application", weight: 2.5 },
      { word: "carefully review", weight: 2 },
      { word: "reviewing applications", weight: 2.5 },
      { word: "application process", weight: 2 },

      // Potential next steps
      { word: "potential fit", weight: 2.5 },
      { word: "good fit", weight: 2.5 },
      { word: "schedule an interview", weight: 3 },
      { word: "reach out", weight: 1.5 },
      { word: "contact you", weight: 1.5 },
      { word: "next steps", weight: 2 },

      // Waiting period and follow-up
      { word: "under consideration", weight: 2.5 },
      { word: "in review", weight: 2 },
      { word: "reviewing candidates", weight: 2.5 },
      { word: "wait to hear", weight: 2 },
      { word: "waiting period", weight: 2 },
      { word: "follow up", weight: 1.5 },

      // Rejection phrases
      { word: "not move forward", weight: 3 },
      { word: "decided not to", weight: 3 },
      { word: "other candidates", weight: 2 },
      { word: "align more closely", weight: 2.5 },
      { word: "no longer under consideration", weight: 3 },

      // Job posting information
      { word: "job title", weight: 2 },
      { word: "job code", weight: 2 },
      { word: "close date", weight: 2 },
      { word: "job posting", weight: 2 },
      { word: "apply here", weight: 2.5 },

      // Company and team references
      { word: "our company", weight: 1.5 },
      { word: "our team", weight: 1.5 },
      { word: "potential employer", weight: 2 },

      // Job search related
      { word: "job search", weight: 2 },
      { word: "future positions", weight: 1.5 },
      { word: "future openings", weight: 1.5 },
      { word: "keep your information on file", weight: 2 },

      // Specific role mentions
      { word: "software engineer", weight: 2.5 },
      { word: "full stack", weight: 2 },
      { word: "frontend", weight: 2 },
      { word: "backend", weight: 2 },
      { word: "developer", weight: 2 },
      { word: "software developer", weight: 2.5 },

      // Student and internship related
      { word: "student worker", weight: 2.5 },
      { word: "internship", weight: 2.5 },
      { word: "on campus jobs", weight: 2 },

      // Company-specific terms (consider adding more based on common companies in your field)
      { word: "coinbase", weight: 2 },
      { word: "forward", weight: 1.5 },
      { word: "decision theater", weight: 2 },

      // Additional general terms
      { word: "opportunity", weight: 1.5 },
      { word: "position", weight: 1.5 },
      { word: "role", weight: 1.5 },
      { word: "candidacy", weight: 2 },
      { word: "qualifications", weight: 1.5 },
      { word: "experience", weight: 1 },

      // Negative keywords (to help filter out non-job related emails)
      { word: "unsubscribe", weight: 2, isNegative: true },
      { word: "promotional", weight: 1.5, isNegative: true },
      { word: "newsletter", weight: 1.5, isNegative: true },
      { word: "sale", weight: 1, isNegative: true },
      { word: "discount", weight: 1, isNegative: true },
      // Negative keywords
      { word: "unsubscribe", weight: 2, isNegative: true },
      { word: "spam", weight: 2, isNegative: true },
      { word: "newsletter", weight: 1.5, isNegative: true },
      { word: "marketing", weight: 1.5, isNegative: true },
      { word: "advertisement", weight: 1.5, isNegative: true },
      { word: "promotional", weight: 1.5, isNegative: true },
      { word: "discount", weight: 1, isNegative: true },
      { word: "sale", weight: 1, isNegative: true },
      { word: "limited time offer", weight: 1.5, isNegative: true },
      { word: "click here", weight: 1, isNegative: true },
      { word: "buy now", weight: 1.5, isNegative: true },
      { word: "special offer", weight: 1.5, isNegative: true },
      { word: "exclusive deal", weight: 1.5, isNegative: true },
      { word: "free trial", weight: 1, isNegative: true },
      { word: "subscription", weight: 1, isNegative: true },
      { word: "account statement", weight: 1.5, isNegative: true },
      { word: "bill", weight: 1, isNegative: true },
      { word: "invoice", weight: 1, isNegative: true },
      { word: "payment due", weight: 1.5, isNegative: true },
      { word: "credit card", weight: 1, isNegative: true },
      { word: "bank statement", weight: 1.5, isNegative: true },
      { word: "transaction", weight: 1, isNegative: true },
      { word: "receipt", weight: 1, isNegative: true },
      { word: "order confirmation", weight: 1.5, isNegative: true },
      { word: "shipping confirmation", weight: 1.5, isNegative: true },
      { word: "tracking number", weight: 1.5, isNegative: true },
      { word: "delivery status", weight: 1.5, isNegative: true },
      { word: "password reset", weight: 2, isNegative: true },
      { word: "account security", weight: 1.5, isNegative: true },
      { word: "login attempt", weight: 1.5, isNegative: true },
      { word: "verify your account", weight: 1.5, isNegative: true },
      { word: "account activity", weight: 1, isNegative: true },
      { word: "social media", weight: 1, isNegative: true },
      { word: "friend request", weight: 1.5, isNegative: true },
      { word: "like", weight: 1, isNegative: true },
      { word: "comment", weight: 1, isNegative: true },
      { word: "share", weight: 1, isNegative: true },
      { word: "tweet", weight: 1, isNegative: true },
      { word: "post", weight: 1, isNegative: true },
      { word: "blog", weight: 1, isNegative: true },
      { word: "article", weight: 1, isNegative: true },
      { word: "news", weight: 1, isNegative: true },
      { word: "update", weight: 1, isNegative: true },
      { word: "announcement", weight: 1, isNegative: true },
      { word: "event invitation", weight: 1.5, isNegative: true },
      { word: "RSVP", weight: 1.5, isNegative: true },
      { word: "calendar invite", weight: 1.5, isNegative: true },
      { word: "meeting request", weight: 1.5, isNegative: true },
      { word: "webinar", weight: 1, isNegative: true },
      { word: "survey", weight: 1, isNegative: true },
      { word: "feedback", weight: 1, isNegative: true },
      { word: "review", weight: 1, isNegative: true },
      { word: "rate us", weight: 1.5, isNegative: true },
      { word: "how did we do", weight: 1.5, isNegative: true },
    ];

    // Function to calculate match score
    const calculateMatchScore = (text: string): number => {
      const lowerText = text.toLowerCase();
      let score = 0;

      jobKeywords.forEach(({ word, weight, isNegative }) => {
        const regex = new RegExp(`\\b${word}\\b`, "gi");
        const matches = (lowerText.match(regex) || []).length;

        if (matches > 0) {
          if (isNegative) {
            score -= weight * matches;
          } else {
            score += weight * matches;
          }
        }
      });

      return score;
    };

    // Function to calculate relevance score
    const calculateRelevanceScore = (text: string): number => {
      const words = text.toLowerCase().split(/\s+/);
      const uniqueWords = new Set(words);
      const totalUniqueWords = uniqueWords.size;

      let relevantWords = 0;
      jobKeywords.forEach(({ word }) => {
        if (uniqueWords.has(word.toLowerCase())) {
          relevantWords++;
        }
      });

      return (relevantWords / totalUniqueWords) * 100;
    };

    const scoredEmails = emails.map((email) => {
      const subjectScore = calculateMatchScore(email.subject);
      const bodyScore = calculateMatchScore(email.body);
      const totalScore = subjectScore + bodyScore;

      const subjectRelevance = calculateRelevanceScore(email.subject);
      const bodyRelevance = calculateRelevanceScore(email.body);
      const averageRelevance = (subjectRelevance + bodyRelevance) / 2;

      // Combine score and relevance
      const combinedScore = totalScore * (averageRelevance / 100);

      return { ...email, score: combinedScore };
    });

    // Normalize scores
    const maxScore = Math.max(...scoredEmails.map((email) => email.score));
    const normalizedEmails: ClassifiedEmail[] = scoredEmails.map((email) => ({
      ...email,
      matchPercentage: (email.score / maxScore) * 100,
    }));

    // Filter and sort emails
    return normalizedEmails
      .filter((email) => email.matchPercentage >= threshold)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);
  }
}
