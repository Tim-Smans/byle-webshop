import { EmailTemplate } from "@/components/shared/email-template";
import { Resend } from "resend";


export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  if (process.env.RESEND_API_KEY === undefined) {
    throw new Error('Resend API key not set')
  }

  try {
    const body = await req.json();

    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return Response.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'Els <contact@timsmans.be>',
      to: ['byle.art@outlook.com'],
      subject: 'New contact form message from ' + name,
      react: EmailTemplate({ name: name, email: email, subject: subject, message: message }),
    });

    return Response.json({
      success: true,
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}