import nodemailer from "nodemailer";
// import { env } from "./env";

interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "your-email@example.com",
        pass: "your-password",
      },
    });
  }

  async sendEmail(options: EmailOptions) {
    try {
      await this.transporter.sendMail(options);
      console.log("Email sent successfully.");
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }
}

export { EmailService };
