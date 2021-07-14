import { IndicatorCoefficient } from 'modules/indicator-coefficients/indicator-coefficient.entity';
import { IndicatorSource } from 'modules/indicator-sources/indicator-source.entity';
import { Layer } from 'modules/layers/layer.entity';
import { Scenario } from 'modules/scenarios/scenario.entity';
import { ScenarioIntervention } from '../src/modules/scenario-interventions/scenario-intervention.entity';

async function createIndicatorCoefficient(
  additionalData: Partial<IndicatorCoefficient> = {},
): Promise<IndicatorCoefficient> {
  const indicatorCoefficient = IndicatorCoefficient.merge(
    new IndicatorCoefficient(),
    {
      year: 2000,
    },
    additionalData,
  );

  if (!indicatorCoefficient.indicatorSourceId) {
    const indicatorSource: IndicatorSource = await createIndicatorSource();
    indicatorCoefficient.indicatorSource = indicatorSource;
  }

  return indicatorCoefficient.save();
}

async function createIndicatorSource(
  additionalData: Partial<IndicatorSource> = {},
): Promise<IndicatorSource> {
  const indicatorSource = IndicatorSource.merge(
    new IndicatorSource(),
    {
      title: 'Indicator Source title',
    },
    additionalData,
  );

  if (!indicatorSource.layerId) {
    const layer: Layer = await createLayer();
    indicatorSource.layer = layer;
  }

  return indicatorSource.save();
}

async function createLayer(
  additionalData: Partial<Layer> = {},
): Promise<Layer> {
  const layer = Layer.merge(new Layer(), additionalData);

  return layer.save();
}

async function createScenario(
  additionalData: Partial<Scenario> = {},
): Promise<Scenario> {
  const scenario = Scenario.merge(
    new Scenario(),
    {
      title: 'Scenario title',
    },
    additionalData,
  );

  return scenario.save();
}

async function createScenarioIntervention(
  additionalData: Partial<ScenarioIntervention> = {},
): Promise<ScenarioIntervention> {
  const scenarioIntervention = ScenarioIntervention.merge(
    new ScenarioIntervention(),
    {
      title: 'Scenario intervention title',
    },
    additionalData,
  );

  return scenarioIntervention.save();
}

export {
  createIndicatorCoefficient,
  createIndicatorSource,
  createLayer,
  createScenario,
  createScenarioIntervention,
};
