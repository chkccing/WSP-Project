import { User } from "./syncPsqlSequelize";
import { generateResetToken } from "./generateResetToken";
import { EmailService } from "./emailService";

export class ForgotPasswordService {
  private emailService: EmailService;

  constructor(emailService: EmailService) {
    this.emailService = emailService;
  }

  async forgotPassword(emailAddress: string): Promise<boolean> {
    const user = await User.findOne({ where: { email: emailAddress } });

    if (!user) {
      return false;
    }

    const token = generateResetToken(user);

    const link = `http://localhost:3000/reset-password/${token}`;

    await this.emailService.sendEmail({
      from: "Test <test@example.com>",
      to: emailAddress,
      subject: "Reset Password",
      text: `Copy paste in your browser: ${link}`,
      html: `<a href="${link}">Click here</a> for reset password`,
    });

    return true;
  }
}
