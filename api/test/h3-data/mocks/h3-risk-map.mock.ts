import { Unit } from '../../../src/modules/units/unit.entity';
import { UnitConversion } from '../../../src/modules/unit-conversions/unit-conversion.entity';
import { Indicator } from '../../../src/modules/indicators/indicator.entity';
import { h3DataMock } from './h3-data.mock';
import { Material } from '../../../src/modules/materials/material.entity';
import {
  createGeoRegion,
  createIndicatorRecord,
  createMaterial,
  createSourcingLocation,
  createSourcingRecord,
} from '../../entity-mocks';
import { GeoRegion } from '../../../src/modules/geo-regions/geo-region.entity';
import { SourcingLocation } from '../../../src/modules/sourcing-locations/sourcing-location.entity';
import { SourcingRecord } from '../../../src/modules/sourcing-records/sourcing-record.entity';
import { H3Data } from '../../../src/modules/h3-data/h3-data.entity';

export const createWorldForRiskMapGeneration = async (data: {
  indicatorType: string;
  fakeTable: string;
  fakeColumn: string;
}): Promise<{
  indicator: Indicator;
  material: Material;
  h3Data: H3Data;
  unit: Unit;
  unitConversion: UnitConversion;
}> => {
  const unit: Unit = new Unit();
  unit.name = 'test unit';
  unit.symbol = 'tonnes';
  await unit.save();

  const unitConversion: UnitConversion = new UnitConversion();
  unitConversion.unit = unit;
  unitConversion.factor = 1;
  await unitConversion.save();

  const indicator: Indicator = new Indicator();
  indicator.name = 'test indicator';
  indicator.unit = unit;
  indicator.nameCode = data.indicatorType;
  await indicator.save();

  const h3Data = await h3DataMock(
    data.fakeTable,
    data.fakeColumn,
    null,
    indicator.id,
  );

  const material = await createMaterial({
    name: 'Material with no H3',
    harvestId: h3Data.id,
    producerId: h3Data.id,
  });
  return { indicator, material, h3Data, unit, unitConversion };
};
