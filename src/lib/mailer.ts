import { Resend } from "resend";

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY not set");
    resend = new Resend(key);
  }
  return resend;
}

interface SendEmailParams {
  to: string;
  from?: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  const from = params.from ?? process.env.FROM_EMAIL ?? "requests@needitz.com";
  const client = getResend();
  const { error } = await client.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}
