import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';
import { Controller, Get } from '@nestjs/common';
import { HealthIndicatorResult } from '@nestjs/terminus/dist/health-indicator';
import { HealthCheckResult } from '@nestjs/terminus/dist/health-check/health-check-result.interface';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      (): Promise<HealthIndicatorResult> =>
        this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
    ]);
  }
}
