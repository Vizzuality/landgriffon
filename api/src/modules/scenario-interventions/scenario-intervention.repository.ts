import { DataSource, InsertResult, QueryRunner, Repository } from 'typeorm';
import { ScenarioIntervention } from 'modules/scenario-interventions/scenario-intervention.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import {
  REPLACED_ADMIN_REGIONS_TABLE_NAME,
  REPLACED_BUSINESS_UNITS_TABLE_NAME,
  REPLACED_MATERIALS_TABLE_NAME,
  REPLACED_PRODUCERS_TABLE_NAME,
  REPLACED_T1SUPPLIERS_TABLE_NAME,
  ReplacedAdminRegion,
  ReplacedBusinessUnits,
  ReplacedMaterial,
  ReplacedProducer,
  ReplacedT1Supplier,
} from 'modules/scenario-interventions/intermediate-table-names/intermediate.table.names';
import { chunk } from 'lodash';
import * as config from 'config';
import { IMPACT_VIEW_NAME } from 'modules/impact/views/impact.materialized-view.entity';
import { ImpactService } from 'modules/impact/impact.service';

@Injectable()
export class ScenarioInterventionRepository extends Repository<ScenarioIntervention> {
  constructor(
    private dataSource: DataSource,
    private impactService: ImpactService,
  ) {
    super(ScenarioIntervention, dataSource.createEntityManager());
  }

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
        .orderBy('intervention.createdAt', 'DESC')
        .getMany()
    );
  }

  // TODO: This is a workaround to bypass TypeORM's issues when bulk inserting. This could be possibly fixed
  //       By upgrading TypeORM version

  async saveNewIntervention(
    newIntervention: ScenarioIntervention,
  ): Promise<any> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
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
      replacedT1Suppliers,
      replacedProducers,
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

    const replacedT1SuppliersToSave: ReplacedT1Supplier[] = [];
    const replacedProducersToSave: ReplacedProducer[] = [];
    const replacedAdminRegionsToSave: ReplacedAdminRegion[] = [];
    const replacedBusinessUnitsToSave: ReplacedBusinessUnits[] = [];
    const replacedMaterialsToSave: ReplacedMaterial[] = [];

    if (replacedT1Suppliers?.length) {
      for (const supplier of replacedT1Suppliers) {
        replacedT1SuppliersToSave.push({
          t1SupplierId: supplier.id,
          scenarioInterventionId: newIntervention.id,
        });
      }
    }
    if (replacedProducers?.length) {
      for (const supplier of replacedProducers) {
        replacedProducersToSave.push({
          producerId: supplier.id,
          scenarioInterventionId: newIntervention.id,
        });
      }
    }
    if (replacedAdminRegions?.length) {
      for (const region of replacedAdminRegions) {
        replacedAdminRegionsToSave.push({
          adminRegionId: region.id,
          scenarioInterventionId: newIntervention.id,
        });
      }
    }
    if (replacedMaterials?.length) {
      for (const material of replacedMaterials) {
        replacedMaterialsToSave.push({
          materialId: material.id,
          scenarioInterventionId: newIntervention.id,
        });
      }
    }
    if (replacedBusinessUnits?.length) {
      for (const unit of replacedBusinessUnits) {
        replacedBusinessUnitsToSave.push({
          businessUnitId: unit.id,
          scenarioInterventionId: newIntervention.id,
        });
      }
    }

    try {
      this.logger.log(
        `Saving Scenario Intervention with Id: ${newIntervention.id}`,
      );
      const intervention: InsertResult = await queryRunner.manager.insert(
        ScenarioIntervention,
        remainingData,
      );
      this.logger.log(
        `Saving ${locations.length} Sourcing Locations for Intervention with Id: ${newIntervention.id}`,
      );
      const sourcingLocationInsertPromises: Array<Promise<InsertResult>> =
        this.createInsertPromises(
          locations,
          batchChunkSize,
          SourcingLocation,
          queryRunner,
        );

      this.logger.log(
        `Saving ${sourcingLocationInsertPromises.length} Sourcing Locations chunks`,
      );
      await Promise.all(sourcingLocationInsertPromises);

      this.logger.log(
        `Saving ${records.length} Sourcing Records for Intervention with Id: ${newIntervention.id}`,
      );
      const sourcingRecordInsertPromises: Array<Promise<InsertResult>> =
        this.createInsertPromises(
          records,
          batchChunkSize,
          SourcingRecord,
          queryRunner,
        );

      this.logger.log(
        `Saving ${sourcingRecordInsertPromises.length} Sourcing Records chunks`,
      );
      await Promise.all(sourcingRecordInsertPromises);
      this.logger.log(
        `Saving ${impacts.length} Indicator Records for Intervention with Id: ${newIntervention.id}`,
      );
      const indicatorRecordInsertPromises: Array<Promise<InsertResult>> =
        this.createInsertPromises(
          impacts,
          batchChunkSize,
          IndicatorRecord,
          queryRunner,
        );

      this.logger.log(
        `Saving ${indicatorRecordInsertPromises.length} Indicator Records chunks`,
      );
      await Promise.all(indicatorRecordInsertPromises);

      this.logger.log(`Replacing suppliers...`);
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(REPLACED_T1SUPPLIERS_TABLE_NAME)
        .values(replacedT1SuppliersToSave)
        .execute();
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(REPLACED_PRODUCERS_TABLE_NAME)
        .values(replacedProducersToSave)
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
      this.logger.warn(`REFRESHING ${IMPACT_VIEW_NAME} ON THE BACKGROUND...`);
      this.impactService.updateImpactView();
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

  private createInsertPromises(
    data: any,
    batchChunkSize: number,
    entity: any,
    queryRunner: QueryRunner,
  ): Array<Promise<InsertResult>> {
    const insertPromises: Array<Promise<InsertResult>> = [];

    for (const [index, dataChunk] of chunk(data, batchChunkSize).entries()) {
      this.logger.debug(
        `Inserting chunk #${index} (${dataChunk.length} items)...`,
      );

      insertPromises.push(
        queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(entity)
          .values(dataChunk)
          .execute(),
      );
    }

    return insertPromises;
  }
}
