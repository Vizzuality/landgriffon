import { Unit } from 'modules/units/unit.entity';
import { UnitConversion } from 'modules/unit-conversions/unit-conversion.entity';
import { Indicator } from 'modules/indicators/indicator.entity';
import { h3DataMock } from './h3-data.mock';
import { Material } from 'modules/materials/material.entity';
import { createMaterial, createMaterialToH3 } from '../../entity-mocks';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import { MATERIAL_TO_H3_TYPE } from 'modules/materials/material-to-h3.entity';
import { h3AlternativeFixture } from './h3-alternative-fixture';

export const createWorldForRiskMapGeneration = async (data: {
  indicatorType: string;
  fakeTable: string;
  fakeColumn: string;
  year: number;
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

  const h3Data = await h3DataMock({
    h3TableName: data.fakeTable,
    h3ColumnName: data.fakeColumn,
    indicatorId: indicator.id,
    year: data.year,
  });

  const material = await createMaterial({
    name: 'Material with no H3',
  });
  await createMaterialToH3(
    material.id,
    h3Data.id,
    MATERIAL_TO_H3_TYPE.PRODUCER,
  );
  await createMaterialToH3(material.id, h3Data.id, MATERIAL_TO_H3_TYPE.HARVEST);
  return { indicator, material, h3Data, unit, unitConversion };
};
