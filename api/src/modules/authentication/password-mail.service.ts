import { Inject, Injectable, Logger } from '@nestjs/common';
import { IEmailService } from 'modules/notifications/email/email.service.interface';

@Injectable()
export class PasswordMailService {
  logger: Logger = new Logger(PasswordMailService.name);

  constructor(
    @Inject('IEmailService') private emailService: IEmailService,
    @Inject('PASSWORD_RESET_URL') private passwordResetUrl: string,
    @Inject('PASSWORD_ACTIVATION_URL') private passwordActivationUrl: string,
  ) {}

  async sendUserActivationEmail(email: string, token: string): Promise<void> {
    const htmlContent: string = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Landgriffon</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h1 style="color: #2c3e50;">Welcome to Landgriffon!</h1>

      <p>Hi there,</p>

      <p>An account has been created for you. To get started, please set it up by clicking the link below:</p>

      <p>
        <a href="${this.passwordActivationUrl}/${token}" style="background-color: #3498db; color: #ffffff; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
          Set Up Your Account
        </a>
      </p>

      <p>This link will expire in 24 hours for security purposes.</p>

      <p>To ensure a secure account, we recommend using a password with a mix of letters, numbers, and special characters.</p>

      <p>If you didn't request this, please ignore this email.</p>

      <p>For any assistance, feel free to reach out to our support team at
        <a href="mailto:support@landgriffon.com">support@landgriffon.com</a>.
      </p>

      <p>Best regards,<br/>The Landgriffon Team</p>

      <hr style="border: none; border-top: 1px solid #ccc;" />

      <p style="font-size: 12px; color: #777;">
        If you have received this email by mistake, please disregard it. You are receiving this email as part of your Landgriffon account registration.
      </p>
    </body>
    </html>
  `;

    await this.emailService.sendMail({
      to: email,
      subject: 'Welcome to Landgriffon - Set up your Account',
      html: htmlContent,
    });
  }

  async sendPasswordRecoveryEmail(email: string, token: string): Promise<void> {
    const htmlContent: string = `
    <h1>Dear User,</h1>
    <br/>
    <p>We recently received a request to reset your password for your Landgriffon account. If you made this request, please click on the link below to securely change your password:</p>
    <br/>
    <p><a href="${this.passwordResetUrl}/${token}">Secure Password Reset Link</a></p>
    <br/>
    <p>This link will direct you to our app to create a new password. For security reasons, this link will expire after 24 hours.</p>
    <p>If you did not request a password reset, please ignore this email; your password will remain the same.</p>
    <br/>
    <p>Thank you for using Landgriffon. We're committed to ensuring your account's security.</p>
    <p>Best regards.</p>`;

    await this.emailService.sendMail({
      to: email,
      subject: 'Password Reset Request for Your Landgriffon Account',
      html: htmlContent,
    });
  }
}
