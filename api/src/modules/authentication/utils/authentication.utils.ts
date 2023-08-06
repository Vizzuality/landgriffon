import { Logger } from '@nestjs/common';
import { AppConfig } from 'utils/app.config';
import { TOKEN_TYPE } from 'modules/authentication/authentication.service';

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

export const getSecretByTokenType = (tokenType?: TOKEN_TYPE): string => {
  switch (tokenType) {
    case TOKEN_TYPE.ACCOUNT_ACTIVATION:
      return AppConfig.get('auth.jwt.accountActivationSecret');
    case TOKEN_TYPE.PASSWORD_RESET:
      return AppConfig.get('auth.jwt.passwordRecoverySecret');
    case TOKEN_TYPE.GENERAL:
      return AppConfig.get('auth.jwt.secret');
    default:
      return AppConfig.get('auth.jwt.secret');
  }
};
