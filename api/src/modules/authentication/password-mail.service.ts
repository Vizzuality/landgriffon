import { Inject, Injectable, Logger } from '@nestjs/common';
import { IEmailService } from 'modules/notifications/email/email.service.interface';

@Injectable()
export class PasswordMailService {
  logger: Logger = new Logger(PasswordMailService.name);

  constructor(
    @Inject('IEmailService') private emailService: IEmailService,
    @Inject('PASSWORD_RESET_URL') private passwordResetUrl: string,
  ) {}

  async sendUserActivationEmail(email: string, token: string): Promise<void> {
    await this.emailService.sendMail({
      to: email,
      subject: 'Activate account',
      text: 'Activate account',
      html: `<a href="${this.passwordResetUrl}/${token}">Activate account</a>`,
    });
  }

  async sendPasswordRecoveryEmail(email: string, token: string): Promise<void> {
    await this.emailService.sendMail({
      to: email,
      subject: 'Reset password',
      text: 'Reset password',
      html: `<a href="${this.passwordResetUrl}/${token}">Reset password</a>`,
    });
  }
}
