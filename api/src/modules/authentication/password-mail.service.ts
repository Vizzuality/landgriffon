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
    await this.emailService.sendMail({
      to: email,
      subject: 'Welcome to Landgriffon - Please Set Up Your Password',
      text: `Welcome to Landgriffon!

An account has been created for you by an administrator. As this is your first time logging in, we request you create a new password for your account.

To get started, please click on the link below:

${this.passwordActivationUrl}/${token}

This link will take you to our app where you can create your new password. For security reasons, this link will expire after 24 hours.

Please remember that a strong password includes a mix of letters, numbers, and special characters. Never share your password with anyone, even if they claim to be from Landgriffon. Our team will never ask you for your password in an email, over the phone, or on any social media platform.

Thank you for choosing Landgriffon. We are committed to providing you with a secure and seamless experience.

If you have any questions or need further assistance, please don't hesitate to contact us.

Best regards.`,
    });
  }

  async sendPasswordRecoveryEmail(email: string, token: string): Promise<void> {
    await this.emailService.sendMail({
      to: email,
      subject: 'Password Reset Request for Your Landgriffon Account',
      text: `Dear User,

We recently received a request to reset your password for your Landgriffon account. If you made this request, please click on the link below to securely change your password:

${this.passwordResetUrl}/${token}

This link will direct you to our app to create a new password. For security reasons, this link will expire after 24 hours.

If you did not request a password reset, please ignore this email; your password will remain the same.

Thank you for using Landgriffon. We're committed to ensuring your account's security.

Best regards.`,
    });
  }
}
