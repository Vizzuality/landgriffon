import { Scenario } from 'modules/scenarios/scenario.entity';
import {
  createIndicator,
  createMaterial,
  createScenario,
  createUnit,
} from '../../../../entity-mocks';
import { createNewSupplierInterventionPreconditions } from './new-supplier-intervention.preconditions';
import { createNewMaterialInterventionPreconditions } from './new-material-intervention.preconditions';
import {
  Indicator,
  INDICATOR_NAME_CODES,
} from 'modules/indicators/indicator.entity';
import { Unit } from 'modules/units/unit.entity';
import { Material } from 'modules/materials/material.entity';

export async function createTwoScenariosPreconditions(): Promise<{
  newScenario1: Scenario;
  newScenario2: Scenario;
  indicator: Indicator;
}> {
  const newScenario1: Scenario = await createScenario();
  const newScenario2: Scenario = await createScenario();

  const unit: Unit = await createUnit({
    name: 'comaprisonTestUnit',
    shortName: 'unit',
  });
  const indicator: Indicator = await createIndicator({
    name: 'Deforestation',
    shortName: 'Deforestation',
    unit,
    nameCode: INDICATOR_NAME_CODES.DF_SLUC,
  });

  const textile: Material = await createMaterial({ name: 'Textile' });

  const wool: Material = await createMaterial({
    name: 'Wool',
    parent: textile,
  });
  const cotton: Material = await createMaterial({
    name: 'Cotton',
    parent: textile,
  });

  const preconditionsMaterials: Record<string, any> = { textile, cotton, wool };

  await createNewSupplierInterventionPreconditions(
    newScenario1,
    indicator,
    preconditionsMaterials,
  );
  await createNewMaterialInterventionPreconditions(newScenario2, indicator);

  return { newScenario1, newScenario2, indicator };
}
