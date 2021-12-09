import { Unit } from 'modules/units/unit.entity';
import { UnitConversion } from 'modules/unit-conversions/unit-conversion.entity';
import { Indicator } from 'modules/indicators/indicator.entity';
import { h3DataMock } from './h3-data.mock';
import { Material } from 'modules/materials/material.entity';
import {
  createAdminRegion,
  createGeoRegion,
  createIndicatorRecord,
  createMaterial,
  createMaterialToH3,
  createSourcingLocation,
  createSourcingRecord,
  createSupplier,
} from '../../entity-mocks';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { getManager } from 'typeorm';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import {
  MATERIAL_TO_H3_TYPE,
  MaterialToH3,
} from 'modules/materials/material-to-h3.entity';
import { h3BasicFixture } from './h3-fixtures';

export interface ImpactMapMockData {
  indicatorId: string;
  adminRegionOneId: string;
  adminRegionTwoId: string;
  t1SupplierOneId: string;
  t1SupplierTwoId: string;
  producerOneId: string;
  producerTwoId: string;
  materialOneId: string;
  materialTwoId: string;
}

export const createImpactMapMockData = async (): Promise<ImpactMapMockData> => {
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
  indicator.nameCode = 'UWU_T';
  await indicator.save();

  const harvestH3Data = await h3DataMock({
    h3TableName: 'harvestTable',
    h3ColumnName: 'harvestColumn',
    additionalH3Data: h3BasicFixture,
    indicatorId: indicator.id,
    year: 2020,
  });

  const productionH3Data = await h3DataMock({
    h3TableName: 'productionTable',
    h3ColumnName: 'productionColumn',
    additionalH3Data: h3BasicFixture,
    indicatorId: indicator.id,
    year: 2020,
  });

  const materialOne: Material = await createMaterial({
    name: 'MaterialOne',
  });
  await createMaterialToH3(
    materialOne.id,
    productionH3Data.id,
    MATERIAL_TO_H3_TYPE.PRODUCER,
  );
  await createMaterialToH3(
    materialOne.id,
    harvestH3Data.id,
    MATERIAL_TO_H3_TYPE.HARVEST,
  );

  const geoRegionOne: GeoRegion = await createGeoRegion({
    h3Compact: ['861203a4fffffff', '861203a5fffffff'],
    h3Flat: ['861203a4fffffff', '861203a5fffffff'],
    h3FlatLength: 2,
  });

  const adminRegionOne: AdminRegion = await createAdminRegion({
    name: 'AdminRegionOne',
  });

  const t1SupplierOne: Supplier = await createSupplier({
    name: 'T1SupplierOne',
  });

  const producerOne: Supplier = await createSupplier({
    name: 'ProducerOne',
  });

  const sourcingLocationOne: SourcingLocation = await createSourcingLocation({
    adminRegion: adminRegionOne,
    geoRegion: geoRegionOne,
    material: materialOne,
    t1Supplier: t1SupplierOne,
    producer: producerOne,
  });

  const sourcingRecordOne: SourcingRecord = await createSourcingRecord({
    sourcingLocation: sourcingLocationOne,
  });

  await createIndicatorRecord({
    sourcingRecordId: sourcingRecordOne.id,
    indicatorId: indicator.id,
    value: 1234,
  });

  const materialTwo: Material = await createMaterial({
    name: 'MaterialTwo',
  });
  await createMaterialToH3(
    materialTwo.id,
    productionH3Data.id,
    MATERIAL_TO_H3_TYPE.PRODUCER,
  );
  await createMaterialToH3(
    materialTwo.id,
    harvestH3Data.id,
    MATERIAL_TO_H3_TYPE.HARVEST,
  );

  const geoRegionTwo: GeoRegion = await createGeoRegion({
    h3Compact: ['861203a4fffffff', '861203a6fffffff'],
    h3Flat: ['861203a4fffffff', '861203a6fffffff'],
    h3FlatLength: 2,
    name: 'DEF',
  });

  const adminRegionTwo: AdminRegion = await createAdminRegion({
    name: 'AdminRegionTwo',
  });

  const t1SupplierTwo: Supplier = await createSupplier({
    name: 'T1SupplierTwo',
  });

  const producerTwo: Supplier = await createSupplier({
    name: 'ProducerTwo',
  });

  const sourcingLocationTwo: SourcingLocation = await createSourcingLocation({
    adminRegion: adminRegionTwo,
    geoRegion: geoRegionTwo,
    material: materialTwo,
    t1Supplier: t1SupplierTwo,
    producer: producerTwo,
  });

  const sourcingRecordTwo: SourcingRecord = await createSourcingRecord({
    sourcingLocation: sourcingLocationTwo,
  });

  await createIndicatorRecord({
    sourcingRecordId: sourcingRecordTwo.id,
    indicatorId: indicator.id,
    value: 1000,
  });

  return {
    indicatorId: indicator.id,
    adminRegionOneId: adminRegionOne.id,
    adminRegionTwoId: adminRegionTwo.id,
    t1SupplierOneId: t1SupplierOne.id,
    t1SupplierTwoId: t1SupplierTwo.id,
    producerOneId: producerOne.id,
    producerTwoId: producerTwo.id,
    materialOneId: materialOne.id,
    materialTwoId: materialTwo.id,
  };
};

export const deleteImpactMapMockData = async (): Promise<void> => {
  await getManager().delete(MaterialToH3, {});
  await getManager().delete(Material, {});
  await getManager().delete(H3Data, {});
  await getManager().delete(Indicator, {});
  await getManager().delete(UnitConversion, {});
  await getManager().delete(Unit, {});
};
