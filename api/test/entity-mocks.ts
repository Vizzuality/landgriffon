import { IndicatorCoefficient } from 'modules/indicator-coefficients/indicator-coefficient.entity';
import { Scenario } from 'modules/scenarios/scenario.entity';
import {
  SCENARIO_INTERVENTION_TYPE,
  ScenarioIntervention,
} from 'modules/scenario-interventions/scenario-intervention.entity';
import { Material, MATERIALS_STATUS } from 'modules/materials/material.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import {
  Indicator,
  INDICATOR_NAME_CODES,
} from 'modules/indicators/indicator.entity';
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
import { DeepPartial } from 'typeorm';
import { User } from '../src/modules/users/user.entity';
import { faker } from '@faker-js/faker';
import { genSalt, hash } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const wkt = require('wellknown');

async function createAdminRegion(
  additionalData: Partial<AdminRegion> = {},
): Promise<AdminRegion> {
  const defaultData: Partial<AdminRegion> = {
    name: 'Fake Admin Region',
    status: ADMIN_REGIONS_STATUS.ACTIVE,
  };

  const adminRegion = AdminRegion.merge(
    new AdminRegion(),
    defaultData,
    additionalData,
  );
  // https://github.com/typeorm/typeorm/issues/9150
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return adminRegion.save();
}

async function createBusinessUnit(
  additionalData: Partial<BusinessUnit> = {},
): Promise<BusinessUnit> {
  const defaultData: Partial<BusinessUnit> = {
    name: 'Fake BusinessUnit',
  };

  const businessUnit = BusinessUnit.merge(
    new BusinessUnit(),
    defaultData,
    additionalData,
  );
  // https://github.com/typeorm/typeorm/issues/9150
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return businessUnit.save();
}

async function createContextualLayer(
  additionalData: DeepPartial<ContextualLayer> = {},
): Promise<ContextualLayer> {
  const defaultData: DeepPartial<ContextualLayer> = {
    name: 'A fake Contextual Layer',
    category: CONTEXTUAL_LAYER_CATEGORY.ENVIRONMENTAL_DATASETS,
  };

  const contextualLayer = ContextualLayer.merge(
    new ContextualLayer(),
    defaultData,
    additionalData,
  );
  // https://github.com/typeorm/typeorm/issues/9150
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return contextualLayer.save();
}

async function createH3Data(
  additionalData: Partial<H3Data> = {},
): Promise<H3Data> {
  const defaultData: DeepPartial<H3Data> = {
    h3tableName: H3DataRepository.generateRandomTableName(),
    h3columnName: H3DataRepository.generateRandomTableName(),
    h3resolution: 6,
    year: 2020,
  };

  const h3Data = H3Data.merge(new H3Data(), defaultData, additionalData);
  // https://github.com/typeorm/typeorm/issues/9150
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return h3Data.save();
}

async function createIndicatorCoefficient(
  additionalData: Partial<IndicatorCoefficient> = {},
): Promise<IndicatorCoefficient> {
  const defaultData: DeepPartial<IndicatorCoefficient> = {
    year: 2000,
  };

  const indicatorCoefficient = IndicatorCoefficient.merge(
    new IndicatorCoefficient(),
    defaultData,
    additionalData,
  );
  // https://github.com/typeorm/typeorm/issues/9150
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return indicatorCoefficient.save();
}

async function createIndicator(
  additionalData: Partial<Indicator> = {},
): Promise<Indicator> {
  const defaultData: DeepPartial<Indicator> = {
    name: 'test indicator',
  };

  const indicator = Indicator.merge(
    new Indicator(),
    defaultData,
    additionalData,
  );
  // https://github.com/typeorm/typeorm/issues/9150
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
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
  const defaultData: DeepPartial<IndicatorRecord> = {
    value: 2000,
    sourcingRecordId: sourcingRecord.id,
    materialH3DataId: basicMaterialToH3.h3DataId,
  };

  const indicatorRecord = IndicatorRecord.merge(
    new IndicatorRecord(),
    defaultData,
    additionalData,
  );
  // https://github.com/typeorm/typeorm/issues/9150
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
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
  const defaultData: DeepPartial<IndicatorRecord> = {
    value: 2000,
    materialH3DataId: basicMaterialToH3.h3DataId,
  };

  const indicatorRecord = IndicatorRecord.merge(
    new IndicatorRecord(),
    defaultData,
    additionalData,
  );
  // https://github.com/typeorm/typeorm/issues/9150
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
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
  const defaultData: DeepPartial<IndicatorRecord> = {
    value: 2000,
    sourcingRecordId: sourcingRecord.id,
    materialH3DataId: basicMaterialToH3.h3DataId,
  };

  const indicatorRecord = IndicatorRecord.merge(
    new IndicatorRecord(),
    defaultData,
    additionalData,
  );

  // https://github.com/typeorm/typeorm/issues/9150
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return indicatorRecord.save();
}

async function createSupplier(
  additionalData: Partial<Supplier> = {},
): Promise<Supplier> {
  const defaultData: DeepPartial<Supplier> = {
    name: 'Supplier name',
  };

  const supplier = Supplier.merge(new Supplier(), defaultData, additionalData);

  // https://github.com/typeorm/typeorm/issues/9150
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
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

  // https://github.com/typeorm/typeorm/issues/9150
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return materialToH3.save();
}

async function createMaterial(
  additionalData: Partial<Material> = {},
): Promise<Material> {
  const defaultData: DeepPartial<Material> = {
    name: 'Material name',
    hsCodeId: uuidv4(),
    status: MATERIALS_STATUS.ACTIVE,
  };

  const material = Material.merge(new Material(), defaultData, additionalData);

  // https://github.com/typeorm/typeorm/issues/9150
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return material.save();
}

async function createGeoRegion(
  additionalData: Partial<GeoRegion> = {},
): Promise<GeoRegion> {
  const geomstring =
    'MULTIPOLYGON (((-74.94038756755259 -8.789917036555973, -74.9404292564128 -8.78987345274758, -74.94037947090003 -8.789320280383404, -74.94007769168027 -8.78832128710426, -74.94014586742746 -8.788218619928239, -74.94016386858105 -8.78780352397087, -74.94010104117281 -8.787799975977926, -74.94010288471793 -8.78778799293464, -74.9395829026956 -8.787693953632717, -74.93871995380748 -8.787450557792479, -74.93826369227841 -8.787672292367361, -74.93588217957925 -8.78758885088354, -74.93581959017885 -8.787667135197673, -74.9357715871026 -8.788277919312772, -74.93494257105218 -8.78845185941805, -74.93498553672873 -8.788177110353425, -74.93374345713029 -8.788556626292976, -74.9326813890679 -8.788562556226449, -74.93185593961496 -8.788775235806332, -74.93064363729047 -8.789016035583105, -74.92945984843114 -8.789701969314692, -74.92933888309716 -8.79004576552706, -74.92900915373343 -8.790418620740047, -74.92907515796331 -8.791877374183946, -74.92920716642304 -8.792695696771696, -74.92975920180011 -8.793276823308746, -74.9315893190828 -8.793092997666013, -74.93331142944389 -8.792891382340077, -74.93551357056765 -8.792594889014318, -74.93895179090532 -8.79218572783506, -74.9395578297432 -8.79241699290495, -74.9406559001128 -8.79224502658469, -74.94093191780134 -8.79210863944635, -74.94088391472505 -8.79196039249988, -74.94060189665201 -8.791729127144945, -74.94034388011707 -8.791438562776397, -74.94015186781199 -8.791088699254734, -74.94014586742746 -8.790721045706444, -74.94026587511813 -8.790288162835186, -74.9404098843469 -8.78997980760475, -74.94038756755259 -8.789917036555973), (-74.9373868084098 -8.7894253831326, -74.9374531890935 -8.789707501038329, -74.93732595944972 -8.789840262405733, -74.93722085670055 -8.789856857576657, -74.93708256360951 -8.789541549329078, -74.9373868084098 -8.7894253831326)))';

  const defaultData: DeepPartial<GeoRegion> = {
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
    theGeom: wkt.parse(geomstring),
  };

  const geoRegion = GeoRegion.merge(
    new GeoRegion(),
    defaultData,
    additionalData,
  );

  // https://github.com/typeorm/typeorm/issues/9150
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return geoRegion.save();
}

async function createScenario(
  additionalData: Partial<Scenario> = {},
): Promise<Scenario> {
  const defaultData: DeepPartial<Scenario> = {
    title: 'Scenario title',
  };

  const scenario = Scenario.merge(new Scenario(), defaultData, additionalData);

  // https://github.com/typeorm/typeorm/issues/9150
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return scenario.save();
}

async function createScenarioIntervention(
  additionalData: Partial<ScenarioIntervention> = {},
): Promise<ScenarioIntervention> {
  let scenario = {};
  if (!additionalData.scenario) {
    scenario = await createScenario();
  }
  const defaultData: DeepPartial<ScenarioIntervention> = {
    title: 'Scenario intervention title',
    startYear: 2020,
    percentage: 50,
    scenario: additionalData.scenario ?? scenario,
    type: SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY,
    newIndicatorCoefficients: JSON.parse(
      JSON.stringify({ ce: 11, de: 10, ww: 5, bi: 3 }),
    ),
  };

  const scenarioIntervention = ScenarioIntervention.merge(
    new ScenarioIntervention(),
    defaultData,
    additionalData,
  );

  // https://github.com/typeorm/typeorm/issues/9150
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return scenarioIntervention.save();
}

async function createSourcingLocation(
  additionalData: Partial<SourcingLocation> = {},
): Promise<SourcingLocation> {
  const material: Material = await createMaterial();
  const defaultData: DeepPartial<SourcingLocation> = {
    title: 'test sourcing location',
    locationAddressInput: 'pqrst',
    locationCountryInput: 'uvwxy',
    materialId: material.id,
  };

  const sourcingLocation = SourcingLocation.merge(
    new SourcingLocation(),
    defaultData,
    additionalData,
  );
  // https://github.com/typeorm/typeorm/issues/9150
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return sourcingLocation.save();
}

async function createSourcingLocationGroup(
  additionalData: Partial<SourcingLocationGroup> = {},
): Promise<SourcingLocationGroup> {
  const defaultData: DeepPartial<SourcingLocationGroup> = {
    title: 'test sourcing location group',
  };

  const sourcingLocationGroup = SourcingLocationGroup.merge(
    new SourcingLocationGroup(),
    defaultData,
    additionalData,
  );
  // https://github.com/typeorm/typeorm/issues/9150
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return sourcingLocationGroup.save();
}

async function createSourcingRecord(
  additionalData: Partial<SourcingRecord> = {},
): Promise<SourcingRecord> {
  const defaultData: DeepPartial<SourcingRecord> = {
    year: 2020,
    tonnage: 1002.56,
  };

  const sourcingRecord = SourcingRecord.merge(
    new SourcingRecord(),
    defaultData,
    additionalData,
  );
  // https://github.com/typeorm/typeorm/issues/9150
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return sourcingRecord.save();
}

async function createTarget(
  additionalData: Partial<Target> = {},
): Promise<Target> {
  const indicator: Indicator = await createIndicator({
    name: (Math.random() + 1).toString(30).substring(6),
    nameCode: (Math.random() + 1)
      .toString(30)
      .substring(6) as INDICATOR_NAME_CODES,
  });
  const defaultData: DeepPartial<Target> = {
    baseLineYear: 2020,
    targetYear: 2023,
    value: 10,
    indicatorId: indicator.id,
  };

  const target = Target.merge(new Target(), defaultData, additionalData);
  // https://github.com/typeorm/typeorm/issues/9150
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return target.save();
}

async function createTask(additionalData: Partial<Task> = {}): Promise<Task> {
  const user: User = await createUser();
  const defaultData: DeepPartial<Task> = {
    userId: user.id,
    type: TASK_TYPE.SOURCING_DATA_IMPORT,
    data: {
      filename: 'fakeFile.xlsx',
    },
    status: TASK_STATUS.COMPLETED,
  };

  const task = Task.merge(new Task(), defaultData, additionalData);
  // https://github.com/typeorm/typeorm/issues/9150
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return task.save();
}

async function createUnit(additionalData: Partial<Unit> = {}): Promise<Unit> {
  const defaultData: DeepPartial<Unit> = {
    name: 'test unit name',
    symbol: 'm3/year',
  };

  const unit = Unit.merge(new Unit(), defaultData, additionalData);
  // https://github.com/typeorm/typeorm/issues/9150
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return unit.save();
}

async function createUnitConversion(
  additionalData: Partial<UnitConversion> = {},
): Promise<UnitConversion> {
  const defaultData: DeepPartial<UnitConversion> = {
    factor: 1,
  };

  const unitConversion = UnitConversion.merge(
    new UnitConversion(),
    defaultData,
    additionalData,
  );
  // https://github.com/typeorm/typeorm/issues/9150
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return unitConversion.save();
}

async function createUser(additionalData: Partial<User> = {}): Promise<User> {
  const salt = await genSalt();
  const defaultData: DeepPartial<User> = {
    email: faker.internet.email(),
    password: await hash(faker.internet.password(), salt),
    salt,
  };

  const user = User.merge(new User(), defaultData, additionalData);

  // https://github.com/typeorm/typeorm/issues/9150
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return user.save();
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
  createUser,
};
