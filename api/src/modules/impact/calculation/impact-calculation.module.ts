import { Module } from '@nestjs/common';
import { IndicatorStrategyFactory } from 'modules/impact/calculation/indicator.strategy.factory';
import { ImpactPerLocationDependencyBuilder } from 'modules/impact/calculation/impact-per-location.dependency.builder';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import * as config from 'config';
import { ImpactCalculatorV2 } from 'modules/impact/calculation/impact.calculator';
import { ImpactCalculationRepository } from 'modules/impact/calculation/impact-calculation.repository';

/**
 * @description: Module for the impact calculation services
 */
const calculationCacheConfig: any = config.get('calculationCache');
const calculationCacheTTL: number = parseInt(
  `${calculationCacheConfig.ttl}`,
  10,
);

@Module({
  imports: [
    CacheModule.register(
      calculationCacheConfig.store === 'redis'
        ? {
            store: redisStore,
            host: calculationCacheConfig.host,
            port: calculationCacheConfig.port,
            db: calculationCacheConfig.database,
            ttl: calculationCacheTTL,
          }
        : {
            store: 'memory',
            ttl: calculationCacheTTL,
          },
    ),
  ],
  providers: [
    ImpactCalculatorV2,
    IndicatorStrategyFactory,
    ImpactPerLocationDependencyBuilder,
    ImpactCalculationRepository,
  ],
  exports: [ImpactCalculatorV2],
})
export class ImpactCalculationModule {}
