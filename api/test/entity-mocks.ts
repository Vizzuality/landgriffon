import { IndicatorCoefficient } from 'modules/indicator-coefficients/indicator-coefficient.entity';
import { IndicatorSource } from 'modules/indicator-sources/indicator-source.entity';
import { Layer } from 'modules/layers/layer.entity';
import { Scenario } from 'modules/scenarios/scenario.entity';
import { ScenarioIntervention } from '../src/modules/scenario-interventions/scenario-intervention.entity';
import { Material } from '../src/modules/materials/material.entity';
import { Supplier } from '../src/modules/suppliers/supplier.entity';
import { SourcingRecord } from '../src/modules/sourcing-records/sourcing-record.entity';
import { IndicatorRecord } from '../src/modules/indicator-records/indicator-record.entity';
import { Indicator } from '../src/modules/indicators/indicator.entity';
import { SourcingLocation } from '../src/modules/sourcing-locations/sourcing-location.entity';
import { SourcingLocationGroup } from '../src/modules/sourcing-location-groups/sourcing-location-group.entity';
import {
  ADMIN_REGIONS_STATUS,
  AdminRegion,
} from '../src/modules/admin-regions/admin-region.entity';

async function createAdminRegion(
  additionalData: Partial<AdminRegion> = {},
): Promise<AdminRegion> {
  const adminRegion = AdminRegion.merge(
    new AdminRegion(),
    {
      name: 'Fake Admin Region',
      status: ADMIN_REGIONS_STATUS.ACTIVE,
    },
    additionalData,
  );
  return adminRegion.save();
}

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

async function createIndicator(
  additionalData: Partial<Indicator> = {},
): Promise<Indicator> {
  const indicator = Indicator.merge(
    new Indicator(),
    {
      name: 'test indicator',
    },
    additionalData,
  );

  return indicator.save();
}

async function createIndicatorRecord(
  additionalData: Partial<IndicatorRecord> = {},
): Promise<IndicatorRecord> {
  const indicatorRecord = IndicatorRecord.merge(
    new IndicatorRecord(),
    {
      value: 2000,
    },
    additionalData,
  );

  return indicatorRecord.save();
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

async function createSupplier(
  additionalData: Partial<Supplier> = {},
): Promise<Supplier> {
  const supplier = Supplier.merge(
    new Supplier(),
    {
      name: 'Material name',
    },
    additionalData,
  );

  return supplier.save();
}

async function createMaterial(
  additionalData: Partial<Material> = {},
): Promise<Material> {
  const material = Material.merge(
    new Material(),
    {
      name: 'Material name',
    },
    additionalData,
  );

  if (!material.layerId) {
    const layer: Layer = await createLayer();
    material.layer = layer;
  }

  return material.save();
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

async function createSourcingLocation(
  additionalData: Partial<SourcingLocation> = {},
): Promise<SourcingLocation> {
  const sourcingLocation = SourcingLocation.merge(
    new SourcingLocation(),
    {
      title: 'test sourcing location',
      locationAddressInput: 'pqrst',
      locationCountryInput: 'uvwxy',
    },
    additionalData,
  );

  return sourcingLocation.save();
}

async function createSourcingLocationGroup(
  additionalData: Partial<SourcingLocationGroup> = {},
): Promise<SourcingLocationGroup> {
  const sourcingLocationGroup = SourcingLocationGroup.merge(
    new SourcingLocationGroup(),
    {
      title: 'test sourcing location group',
    },
    additionalData,
  );

  return sourcingLocationGroup.save();
}

async function createSourcingRecord(
  additionalData: Partial<SourcingRecord> = {},
): Promise<SourcingRecord> {
  const sourcingRecord = SourcingRecord.merge(
    new SourcingRecord(),
    {
      year: 2020,
      tonnage: 1002.56,
    },
    additionalData,
  );

  return sourcingRecord.save();
}

export {
  createAdminRegion,
  createIndicator,
  createIndicatorCoefficient,
  createIndicatorRecord,
  createIndicatorSource,
  createLayer,
  createMaterial,
  createSupplier,
  createScenario,
  createScenarioIntervention,
  createSourcingLocation,
  createSourcingLocationGroup,
  createSourcingRecord,
};
