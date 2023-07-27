import { Logger } from '@nestjs/common';
import { AppConfig } from 'utils/app.config';

const logger: Logger = new Logger('Authentication');
export const getPasswordSettingUrl = (kind: 'activation' | 'reset'): string => {
  const clientUrl: string = AppConfig.get('client.url');
  const clientPort: string = AppConfig.get('client.port');
  const passwordActivationUrl: string = AppConfig.get(
    'auth.password.activationUrl',
  );
  const passwordResetUrl: string = AppConfig.get('auth.password.resetUrl');
  const protocol: string =
    process.env.NODE_ENV === 'production' ? 'https' : 'http';
  if (!clientUrl || !clientPort || !passwordResetUrl) {
    logger.error('Missing client url, port or password reset url');
  }
  return `${protocol}://${clientUrl}:${clientPort}${
    kind === 'activation' ? passwordActivationUrl : passwordResetUrl
  }`;
};
