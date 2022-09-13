import { IndicatorCoefficient } from 'modules/indicator-coefficients/indicator-coefficient.entity';
import { Scenario } from 'modules/scenarios/scenario.entity';
import {
  SCENARIO_INTERVENTION_TYPE,
  ScenarioIntervention,
} from 'modules/scenario-interventions/scenario-intervention.entity';
import { Material } from 'modules/materials/material.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { Indicator } from 'modules/indicators/indicator.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingLocationGroup } from 'modules/sourcing-location-groups/sourcing-location-group.entity';
import { Unit } from 'modules/units/unit.entity';
import {
  ADMIN_REGIONS_STATUS,
  AdminRegion,
} from 'modules/admin-regions/admin-region.entity';
import { UnitConversion } from 'modules/unit-conversions/unit-conversion.entity';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import {
  MATERIAL_TO_H3_TYPE,
  MaterialToH3,
} from 'modules/materials/material-to-h3.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { Task, TASK_STATUS, TASK_TYPE } from 'modules/tasks/task.entity';
import { Target } from 'modules/targets/target.entity';
import { H3DataRepository } from '../src/modules/h3-data/h3-data.repository';
import {
  CONTEXTUAL_LAYER_CATEGORY,
  ContextualLayer,
} from '../src/modules/contextual-layers/contextual-layer.entity';

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

async function createBusinessUnit(
  additionalData: Partial<BusinessUnit> = {},
): Promise<BusinessUnit> {
  const businessUnit = BusinessUnit.merge(
    new BusinessUnit(),
    {
      name: 'Fake BusinessUnit',
    },
    additionalData,
  );
  return businessUnit.save();
}

async function createContextualLayer(
  additionalData: Partial<ContextualLayer> = {},
): Promise<ContextualLayer> {
  const businessUnit = ContextualLayer.merge(
    new ContextualLayer(),
    {
      name: 'A fake Contextual Layer',
      category: CONTEXTUAL_LAYER_CATEGORY.ENVIRONMENTAL_DATASETS,
    },
    additionalData,
  );
  return businessUnit.save();
}

async function createH3Data(
  additionalData: Partial<H3Data> = {},
): Promise<H3Data> {
  const h3Data = H3Data.merge(
    new H3Data(),
    {
      h3tableName: H3DataRepository.generateRandomTableName(),
      h3columnName: H3DataRepository.generateRandomTableName(),
      h3resolution: 6,
      year: 2020,
    },
    additionalData,
  );

  return h3Data.save();
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
  const sourcingRecord: SourcingRecord = await createSourcingRecord();
  const basicMaterial: Material = await createMaterial();
  const basicH3: H3Data = await createH3Data();
  const basicMaterialToH3: MaterialToH3 = await createMaterialToH3(
    basicMaterial.id,
    basicH3.id,
    MATERIAL_TO_H3_TYPE.HARVEST,
  );
  const indicatorRecord = IndicatorRecord.merge(
    new IndicatorRecord(),
    {
      value: 2000,
      sourcingRecordId: sourcingRecord.id,
      materialH3DataId: basicMaterialToH3.h3DataId,
    },
    additionalData,
  );

  return indicatorRecord.save();
}

// Alternate version that doesn't crete a Matching Sourcing Record
async function createIndicatorRecordV2(
  additionalData: Partial<IndicatorRecord> = {},
): Promise<IndicatorRecord> {
  const basicMaterial: Material = await createMaterial();
  const basicH3: H3Data = await createH3Data();
  const basicMaterialToH3: MaterialToH3 = await createMaterialToH3(
    basicMaterial.id,
    basicH3.id,
    MATERIAL_TO_H3_TYPE.HARVEST,
  );
  const indicatorRecord = IndicatorRecord.merge(
    new IndicatorRecord(),
    {
      value: 2000,
      materialH3DataId: basicMaterialToH3.h3DataId,
    },
    additionalData,
  );

  return indicatorRecord.save();
}

async function createIndicatorRecordForIntervention(
  additionalData: Partial<IndicatorRecord> = {},
  sourcingRecord: SourcingRecord,
): Promise<IndicatorRecord> {
  const basicMaterial: Material = await createMaterial();
  const basicH3: H3Data = await createH3Data();
  const basicMaterialToH3: MaterialToH3 = await createMaterialToH3(
    basicMaterial.id,
    basicH3.id,
    MATERIAL_TO_H3_TYPE.HARVEST,
  );
  const indicatorRecord = IndicatorRecord.merge(
    new IndicatorRecord(),
    {
      value: 2000,
      sourcingRecordId: sourcingRecord.id,
      materialH3DataId: basicMaterialToH3.h3DataId,
    },
    additionalData,
  );

  return indicatorRecord.save();
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

async function createMaterialToH3(
  materialId: string,
  h3DataId: string,
  type: MATERIAL_TO_H3_TYPE,
): Promise<MaterialToH3> {
  const materialToH3 = MaterialToH3.merge(new MaterialToH3(), {
    materialId,
    h3DataId,
    type,
  });

  return materialToH3.save();
}

async function createMaterial(
  additionalData: Partial<Material> = {},
): Promise<Material> {
  const material = Material.merge(
    new Material(),
    {
      name: 'Material name',
      hsCodeId: '1',
    },
    additionalData,
  );

  return material.save();
}

async function createGeoRegion(
  additionalData: Partial<GeoRegion> = {},
): Promise<GeoRegion> {
  const geoRegion = GeoRegion.merge(
    new GeoRegion(),
    {
      h3Compact: [
        '8667737afffffff',
        '8667737a7ffffff',
        '86677378fffffff',
        '866773637ffffff',
        '86677362fffffff',
        '866773607ffffff',
        '861203a4fffffff',
      ],
      h3Flat: [
        '8667737afffffff',
        '8667737a7ffffff',
        '86677378fffffff',
        '866773637ffffff',
        '86677362fffffff',
        '866773607ffffff',
        '861203a4fffffff',
      ],
      h3FlatLength: 7,
      name: 'ABC',
    },
    additionalData,
  );

  return geoRegion.save();
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
  const scenario: Scenario = await createScenario();
  const scenarioIntervention = ScenarioIntervention.merge(
    new ScenarioIntervention(),
    {
      title: 'Scenario intervention title',
      startYear: 2020,
      percentage: 50,
      scenario: scenario,
      type: SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY,
      newIndicatorCoefficients: JSON.parse(
        JSON.stringify({ ce: 11, de: 10, ww: 5, bi: 3 }),
      ),
    },
    additionalData,
  );

  return scenarioIntervention.save();
}

async function createSourcingLocation(
  additionalData: Partial<SourcingLocation> = {},
): Promise<SourcingLocation> {
  const material: Material = await createMaterial();
  const sourcingLocation = SourcingLocation.merge(
    new SourcingLocation(),
    {
      title: 'test sourcing location',
      locationAddressInput: 'pqrst',
      locationCountryInput: 'uvwxy',
      materialId: material.id,
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

async function createTarget(
  additionalData: Partial<Target> = {},
): Promise<Target> {
  const indicator: Indicator = await createIndicator({
    name: (Math.random() + 1).toString(30).substring(6),
    nameCode: (Math.random() + 1).toString(30).substring(6),
  });
  const target: Target = Target.merge(
    new Target(),
    {
      baseLineYear: 2020,
      targetYear: 2023,
      value: 10,
      indicatorId: indicator.id,
    },
    additionalData,
  );
  return target.save();
}

async function createTask(additionalData: Partial<Task> = {}): Promise<Task> {
  const task: Task = Task.merge(
    new Task(),
    {
      userId: '2a833cc7-5a6f-492d-9a60-0d6d056923ea',
      type: TASK_TYPE.SOURCING_DATA_IMPORT,
      data: {
        filename: 'fakeFile.xlsx',
      },
      status: TASK_STATUS.COMPLETED,
    },
    additionalData,
  );
  return task.save();
}

async function createUnit(additionalData: Partial<Unit> = {}): Promise<Unit> {
  const unit = Unit.merge(
    new Unit(),
    {
      name: 'test unit name',
      symbol: 'm3/year',
    },
    additionalData,
  );
  return unit.save();
}

async function createUnitConversion(
  additionalData: Partial<UnitConversion> = {},
): Promise<UnitConversion> {
  const unitConversion = UnitConversion.merge(
    new UnitConversion(),
    {
      factor: 1,
    },
    additionalData,
  );
  return unitConversion.save();
}

export {
  createAdminRegion,
  createBusinessUnit,
  createContextualLayer,
  createH3Data,
  createIndicator,
  createIndicatorCoefficient,
  createIndicatorRecord,
  createIndicatorRecordV2,
  createMaterial,
  createMaterialToH3,
  createSupplier,
  createScenario,
  createScenarioIntervention,
  createSourcingLocation,
  createSourcingLocationGroup,
  createSourcingRecord,
  createTarget,
  createTask,
  createUnit,
  createUnitConversion,
  createGeoRegion,
  createIndicatorRecordForIntervention,
};
