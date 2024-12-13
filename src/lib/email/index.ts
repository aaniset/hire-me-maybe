import Mailgun from "mailgun.js";

interface EmailOptions {
  to: string;
  action: "ACTIVATE" | "SIGNIN" | "RESET_PASSWORD"; // New action added
  variables: Record<string, any>;
}

function constructEmailData(
  action: string,
  to: string,
  variables: Record<string, any>
): any {
  let subject: string;
  let template: string;
  let from: string;

  switch (action) {
    case "ACTIVATE":
      subject = "Activate Your BeatFever Account";
      template = process.env.MAILGUN_ACTIVATION_TEMPLATE as string;
      from = process.env.EMAIL_NOREPLY as string;

      break;
    case "SIGNIN":
      subject = "Your BeatFever Magic Link";
      template = process.env.MAILGUN_SIGN_IN_TEMPLATE as string;
      from = process.env.EMAIL_NOREPLY as string;

      break;
    case "RESET_PASSWORD":
      subject = "Reset Your BeatFever Password";
      template = process.env.MAILGUN_RESET_PASSWORD_TEMPLATE as string;
      from = process.env.EMAIL_NOREPLY as string;

      break;
    default:
      throw new Error("Invalid email action.");
  }

  return {
    from,
    to,
    subject,
    template,
    "h:X-Mailgun-Variables": JSON.stringify({ ...variables }),
    "h:X-Entity-Ref-ID": new Date().getTime() + "",
    // Set this to prevent Gmail from threading emails.
    // See https://stackoverflow.com/questions/23434110/force-emails-not-to-be-grouped-into-conversations/25435722.
  };
}

async function sendEmail(emailData: any): Promise<any> {
  const mg = new Mailgun(FormData).client({
    username: "api",
    key: process.env.MAILGUN_API_KEY as string,
  });

  try {
    const result = await mg.messages.create(
      process.env.MAILGUN_DOMAIN as string,
      emailData
    );
    console.log("Email sent successfully!", result);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

export async function sendEmailRequest(options: EmailOptions): Promise<any> {
  const { to, action, variables } = options;
  const emailData = constructEmailData(action, to, variables);
  return sendEmail(emailData);
}
