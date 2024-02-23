import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AppConfig } from 'utils/app.config';

type CartoConfig = {
  apiKey: string;
  baseUrl: string;
  connection: string;
};

@Injectable()
export class CartoConnector {
  cartoApiKey: string;
  cartoBaseUrl: string;
  cartoConnection: string;
  logger: Logger = new Logger(CartoConnector.name);

  constructor(private readonly httpService: HttpService) {
    const { apiKey, baseUrl, connection } = AppConfig.get<CartoConfig>('carto');
    this.cartoApiKey = apiKey;
    this.cartoBaseUrl = baseUrl;
    this.cartoConnection = connection;
    if (!this.cartoApiKey || !this.cartoBaseUrl || !this.cartoConnection) {
      this.logger.error('Carto configuration is missing');
    }
  }

  private handleConnectionError(error: typeof Error): void {
    this.logger.error('Carto connection error', error);
    throw new ServiceUnavailableException(
      'Unable to connect to Carto. Please contact your administrator.',
    );
  }
}
