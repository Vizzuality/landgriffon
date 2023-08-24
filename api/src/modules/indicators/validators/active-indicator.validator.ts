import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Indicator,
  INDICATOR_STATUS,
} from 'modules/indicators/indicator.entity';
import { difference } from 'lodash';
import { CreateScenarioInterventionDto } from 'modules/scenario-interventions/dto/create.scenario-intervention.dto';
import { DataSource } from 'typeorm';

/**
 * @description: Validates the IndicatorCoefficient DTO against currently active indicators
 */

@ValidatorConstraint({ name: 'ActiveIndicators', async: true })
@Injectable()
export class ActiveIndicatorValidator implements ValidatorConstraintInterface {
  constructor(private dataSource: DataSource) {}

  differentNameCodes: string[];
  indicatorNameCodes: string[];

  async validate(coefficientDto: Record<string, any>): Promise<boolean> {
    const activeIndicators: Indicator[] = await this.dataSource
      .getRepository(Indicator)
      .find({ where: { status: INDICATOR_STATUS.ACTIVE } });
    if (!activeIndicators.length) {
      throw new NotFoundException(`No Active Indicators Found in the Database`);
    }
    this.indicatorNameCodes = activeIndicators.map(
      (indicator: Indicator) => indicator.nameCode,
    );

    this.differentNameCodes = difference(
      this.indicatorNameCodes,
      Object.keys(coefficientDto),
    );

    return !this.differentNameCodes.length;
  }

  defaultMessage(): string {
    return `Provided coefficients should match currently active indicators: ${this.indicatorNameCodes.join(
      ', ',
    )}`;
  }
}

/**
 *@description: Decorator for above Validator
 *
 */

export function ActiveIndicators(validationOptions?: ValidationOptions) {
  return function (
    object: CreateScenarioInterventionDto,
    newIndicatorCoefficient: string,
  ): void {
    registerDecorator({
      name: 'ActiveIndicators',
      target: object.constructor,
      propertyName: newIndicatorCoefficient,
      options: validationOptions,
      validator: ActiveIndicatorValidator,
    });
  };
}
