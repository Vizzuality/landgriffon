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
  logger: Logger = new Logger(CartoConnector.name);

  constructor(private readonly httpService: HttpService) {
    const { apiKey, baseUrl } = AppConfig.get<CartoConfig>('carto');
    this.cartoApiKey = apiKey;
    this.cartoBaseUrl = baseUrl;
    if (!this.cartoApiKey || !this.cartoBaseUrl) {
      this.logger.error('Carto configuration is missing');
    }
  }

  private handleConnectionError(error: typeof Error): void {
    this.logger.error('Carto connection error', error);
    throw new ServiceUnavailableException(
      'Unable to connect to Carto. Please contact your administrator.',
    );
  }

  async select(query: string): Promise<any> {
    try {
      const response: any = await this.httpService
        .get(`${this.cartoBaseUrl}${query}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cartoApiKey}`,
          },
        })
        .toPromise();
      return response.data;
    } catch (e: any) {
      this.handleConnectionError(e);
    }
  }
}
