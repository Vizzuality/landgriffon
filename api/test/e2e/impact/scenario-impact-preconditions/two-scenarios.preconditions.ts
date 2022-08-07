import { Scenario } from 'modules/scenarios/scenario.entity';
import {
  createIndicator,
  createScenario,
  createUnit,
} from '../../../entity-mocks';
import { createNewSupplierInterventionPreconditions } from './new-supplier-intervention.preconditions';
import { createNewMaterialInterventionPreconditions } from './new-material-intervention.preconditions';
import {
  Indicator,
  INDICATOR_TYPES,
} from 'modules/indicators/indicator.entity';
import { Unit } from 'modules/units/unit.entity';

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
    unit,
    nameCode: INDICATOR_TYPES.DEFORESTATION,
  });

  await createNewSupplierInterventionPreconditions(newScenario1, indicator);
  await createNewMaterialInterventionPreconditions(newScenario2, indicator);

  return { newScenario1, newScenario2, indicator };
}
