import {
  Connection,
  EntityRepository,
  getConnection,
  InsertQueryBuilder,
  InsertResult,
  QueryRunner,
  Repository,
} from 'typeorm';
import { ScenarioIntervention } from 'modules/scenario-interventions/scenario-intervention.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import {
  REPLACED_ADMIN_REGIONS_TABLE_NAME,
  REPLACED_BUSINESS_UNITS_TABLE_NAME,
  REPLACED_MATERIALS_TABLE_NAME,
  REPLACED_SUPPLIERS_TABLE_NAME,
  ReplacedAdminRegion,
  ReplacedBusinessUnits,
  ReplacedMaterial,
  ReplacedSuppliers,
} from 'modules/scenario-interventions/intermediate-table-names/intermediate.table.names';
import { chunk } from 'lodash';
import * as config from 'config';

@EntityRepository(ScenarioIntervention)
export class ScenarioInterventionRepository extends Repository<ScenarioIntervention> {
  logger: Logger = new Logger(ScenarioInterventionRepository.name);

  async getScenarioInterventionsByScenarioId(
    scenarioId: string,
  ): Promise<ScenarioIntervention[]> {
    // TODO: Join with suppliers and selecting supplier field commented out due to performance issues
    //       This needs to be restored
    return (
      this.createQueryBuilder('intervention')
        .select([
          'intervention.id',
          'intervention.title',
          'intervention.description',
          'intervention.type',
          'intervention.startYear',
          'intervention.status',
          'intervention.endYear',
          'intervention.percentage',
          'replacedAdminRegions.id',
          'replacedAdminRegions.name',
          'newAdminRegion.id',
          'newAdminRegion.name',
          'replacedMaterials.id',
          'replacedMaterials.name',
          'newMaterial.id',
          'newMaterial.name',
          'replacedBusinessUnits.id',
          'replacedBusinessUnits.name',
          'newBusinessUnit.id',
          'newBusinessUnit.name',
          // 'replacedSuppliers.id',
          // 'replacedSuppliers.name',
        ])
        .leftJoin('intervention.replacedAdminRegions', 'replacedAdminRegions')
        .leftJoin('intervention.newAdminRegion', 'newAdminRegion')
        .leftJoin('intervention.replacedMaterials', 'replacedMaterials')
        .leftJoin('intervention.newMaterial', 'newMaterial')
        .leftJoin('intervention.replacedBusinessUnits', 'replacedBusinessUnits')
        .leftJoin('intervention.newBusinessUnit', 'newBusinessUnit')
        // .leftJoin('intervention.replacedSuppliers', 'replacedSuppliers')

        .where('intervention.scenarioId = :scenarioId', { scenarioId })
        .getMany()
    );
  }

  // TODO: This is a workaround to bypass TypeORM's issues when bulk inserting. This could be possibly fixed
  //       By upgrading TypeORM version

  async saveNewIntervention(
    newIntervention: ScenarioIntervention,
  ): Promise<any> {
    const connection: Connection = getConnection();
    const queryRunner: QueryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const locations: SourcingLocation[] = [];
    const records: SourcingRecord[] = [];
    const impacts: IndicatorRecord[] = [];

    const dbConfig: any = config.get('db');
    const batchChunkSize: number = parseInt(`${dbConfig.batchChunkSize}`, 10);

    newIntervention.id = uuidv4();
    const {
      newSourcingLocations,
      replacedSourcingLocations,
      replacedAdminRegions,
      replacedMaterials,
      replacedBusinessUnits,
      replacedSuppliers,
      ...remainingData
    } = newIntervention;
    const allLocations: SourcingLocation[] = replacedSourcingLocations.concat(
      newSourcingLocations ?? [],
    );
    for (const location of allLocations) {
      location.scenarioInterventionId = newIntervention.id;
      location.id = uuidv4();
      locations.push(location);
      for (const record of location.sourcingRecords) {
        record.sourcingLocationId = location.id;
        record.id = uuidv4();
        records.push(record);
        for (const impact of record.indicatorRecords) {
          impact.sourcingRecordId = record.id;
          impacts.push(impact);
        }
      }
    }

    const replacedSuppliersToSave: ReplacedSuppliers[] = [];
    const replacedAdminRegionsToSave: ReplacedAdminRegion[] = [];
    const replacedBusinessUnitsToSave: ReplacedBusinessUnits[] = [];
    const replacedMaterialsToSave: ReplacedMaterial[] = [];
    // We could have replaced suppliers or not, as this can be null for actual Sourcing Location data
    if (replacedSuppliers.length) {
      for (const supplier of replacedSuppliers) {
        replacedSuppliersToSave.push({
          supplierId: supplier.id,
          scenarioInterventionId: newIntervention.id,
        });
      }
    }

    for (const region of replacedAdminRegions) {
      replacedAdminRegionsToSave.push({
        adminRegionId: region.id,
        scenarioInterventionId: newIntervention.id,
      });
    }
    for (const material of replacedMaterials) {
      replacedMaterialsToSave.push({
        materialId: material.id,
        scenarioInterventionId: newIntervention.id,
      });
    }
    for (const unit of replacedBusinessUnits) {
      replacedBusinessUnitsToSave.push({
        businessUnitId: unit.id,
        scenarioInterventionId: newIntervention.id,
      });
    }

    try {
      this.logger.log(
        `Saving ${locations.length} Sourcing Locations for Intervention with Id: ${newIntervention.id}`,
      );
      const intervention: InsertResult = await queryRunner.manager.insert(
        ScenarioIntervention,
        remainingData,
      );
      this.logger.log(
        `Saving ${locations.length} Sourcing Locations for Intervention with Id: ${newIntervention.id}`,
      );
      await queryRunner.manager.insert(SourcingLocation, locations);
      this.logger.log(
        `Saving ${records.length} Sourcing Records for Intervention with Id: ${newIntervention.id}`,
      );
      const sourcingRecordInsertPromises: Array<Promise<InsertResult>> = [];

      for (const [index, dataChunk] of chunk(
        records,
        batchChunkSize,
      ).entries()) {
        this.logger.debug(
          `Inserting sourcing record chunk #${index} (${dataChunk.length} items)...`,
        );

        sourcingRecordInsertPromises.push(
          queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into(SourcingRecord)
            .values(dataChunk)
            .execute(),
        );
      }
      this.logger.log(
        `Saving ${sourcingRecordInsertPromises.length} Sourcing Records chunks`,
      );
      await Promise.all(sourcingRecordInsertPromises);
      this.logger.log(
        `Saving ${impacts.length} Indicator Records for Intervention with Id: ${newIntervention.id}`,
      );
      const indicatorRecordInsertPromises: Array<Promise<InsertResult>> = [];
      for (const [index, dataChunk] of chunk(
        impacts,
        batchChunkSize,
      ).entries()) {
        this.logger.debug(
          `Inserting indicator record chunk #${index} (${dataChunk.length} items)...`,
        );
        indicatorRecordInsertPromises.push(
          queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into(IndicatorRecord)
            .values(dataChunk)
            .execute(),
        );
      }
      this.logger.log(
        `Saving ${indicatorRecordInsertPromises.length} Indicator Records chunks`,
      );
      await Promise.all(indicatorRecordInsertPromises);

      this.logger.log(`Replacing suppliers...`);
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(REPLACED_SUPPLIERS_TABLE_NAME)
        .values(replacedSuppliersToSave)
        .execute();
      this.logger.log(`Replacing admin regions...`);
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(REPLACED_ADMIN_REGIONS_TABLE_NAME)
        .values(replacedAdminRegionsToSave)
        .execute();
      this.logger.log(`Replacing materials...`);
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(REPLACED_MATERIALS_TABLE_NAME)
        .values(replacedMaterialsToSave)
        .execute();
      this.logger.log(`Replacing business units...`);
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(REPLACED_BUSINESS_UNITS_TABLE_NAME)
        .values(replacedBusinessUnitsToSave)
        .execute();
      this.logger.log('Committing transaction...');

      await queryRunner.commitTransaction();
      this.logger.log('New Intervention Saving Finished');

      return intervention;
    } catch (err) {
      // rollback changes before throwing error
      await queryRunner.rollbackTransaction();
      this.logger.error('Intervention could not been saved: ' + err);
      throw new ServiceUnavailableException(
        'Intervention could not been saved: ' + err,
      );
    } finally {
      // release query runner which is manually created
      await queryRunner.release();
    }
  }
}
