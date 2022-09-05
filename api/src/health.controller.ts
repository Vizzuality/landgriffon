import {
  HealthCheck,
  HealthCheckService,
  MicroserviceHealthIndicator,
} from '@nestjs/terminus';
import { Transport, RedisOptions } from '@nestjs/microservices';
import { Controller, Get } from '@nestjs/common';
import { HealthIndicatorResult } from '@nestjs/terminus/dist/health-indicator';
import { HealthCheckResult } from '@nestjs/terminus/dist/health-check/health-check-result.interface';
import { Public } from 'decorators/public.decorator';
import * as config from 'config';

const redisConfig: any = config.get('redis');

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private microservice: MicroserviceHealthIndicator,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      (): Promise<HealthIndicatorResult> =>
        this.microservice.pingCheck<RedisOptions>('redis', {
          transport: Transport.REDIS,
          options: {
            url: `redis://${redisConfig.host}:${redisConfig.port}`,
          },
        }),
    ]);
  }
}
