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
import { CreateScenarioInterventionDtoV2 } from 'modules/scenario-interventions/dto/create.scenario-intervention.dto';
import { getConnection } from 'typeorm';

/**
 * @description: Validates de IndicatorCoefficient DTO agains currently active indicators
 */

@ValidatorConstraint({ name: 'ActiveIndicators', async: true })
@Injectable()
export class ActiveIndicatorValidator implements ValidatorConstraintInterface {
  differentNameCodes: string[];
  indicatorNameCodes: string[];

  async validate(coefficientDto: Record<string, any>): Promise<boolean> {
    const activeIndicators: Indicator[] = await getConnection()
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
    object: CreateScenarioInterventionDtoV2,
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
