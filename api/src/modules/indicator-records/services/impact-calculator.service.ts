import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { IndicatorRecordRepository } from 'modules/indicator-records/indicator-record.repository';
import {
  IndicatorRawDataBySourcingRecord,
  SourcingRecordsWithIndicatorRawDataDtoV2,
} from 'modules/sourcing-records/dto/sourcing-records-with-indicator-raw-data.dto';
import {
  Indicator,
  INDICATOR_TYPES_NEW,
} from 'modules/indicators/indicator.entity';
import { getManager } from 'typeorm';
import {
  INDICATOR_RECORD_STATUS,
  IndicatorRecord,
} from 'modules/indicator-records/indicator-record.entity';
import { IndicatorCoefficientsDtoV2 } from 'modules/indicator-coefficients/dto/indicator-coefficients.dto';
import {
  MaterialToH3,
  MATERIAL_TO_H3_TYPE,
} from 'modules/materials/material-to-h3.entity';
import { MissingH3DataError } from 'modules/indicator-records/errors/missing-h3-data.error';
import { IndicatorRecordCalculatedValuesDtoV2 } from 'modules/indicator-records/dto/indicator-record-calculated-values.dto';
import { MaterialsToH3sService } from 'modules/materials/materials-to-h3s.service';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import { H3DataService } from 'modules/h3-data/h3-data.service';
import { IndicatorDependencyManager } from 'modules/indicator-records/services/indicator-dependency-manager.service';

/**
 * @description: This is PoC (Proof of Concept) for the updated LG methodology v0.1
 *               Needs to be properly implemented (following the current methodology pattern)
 *               as soon as results are validated
 */

@Injectable()
export class ImpactCalculator {
  logger: Logger = new Logger(ImpactCalculator.name);
  constructor(
    private readonly indicatorRecordRepository: IndicatorRecordRepository,
    private readonly materialToH3: MaterialsToH3sService,
    private readonly indicatorService: IndicatorsService,
    private readonly dependencyManager: IndicatorDependencyManager,
    private readonly h3DataService: H3DataService,
  ) {}

  async calculateImpactForAllSourcingRecords(
    activeIndicators: Indicator[],
  ): Promise<any> {
    const rawData: SourcingRecordsWithIndicatorRawDataDtoV2[] =
      await this.getIndicatorRawDataForAllSourcingRecordsV2(activeIndicators);

    const newImpactToBeSaved: IndicatorRecord[] = [];

    rawData.forEach((data: SourcingRecordsWithIndicatorRawDataDtoV2) => {
      const landPerTon: number = data.harvestedArea ?? 0 / data.production ?? 0;
      const weightedTotalCropLandArea: number =
        data.weightedAllHarvest ?? 0 / data.production ?? 0;
      const deforestationPerHarvestLandUse: number =
        weightedTotalCropLandArea > 0
          ? data.rawDeforestation / weightedTotalCropLandArea
          : 0;
      const carbonPerHarvestLandUse: number =
        weightedTotalCropLandArea > 0
          ? data.rawCarbon / weightedTotalCropLandArea
          : 0;
      const landUse: number = landPerTon * data.tonnage;
      const deforestation: number = deforestationPerHarvestLandUse * landUse;
      const carbonLoss: number = carbonPerHarvestLandUse * landUse;
      const waterUse: number = data.rawWater * data.tonnage;
      const unsustainableWaterUse: number = waterUse * data.waterStressPerct;

      const map: Map<INDICATOR_TYPES_NEW, number> = new Map();
      map.set(INDICATOR_TYPES_NEW.CLIMATE_RISK, carbonLoss);
      map.set(INDICATOR_TYPES_NEW.DEFORESTATION_RISK, deforestation);
      map.set(INDICATOR_TYPES_NEW.WATER_USE, waterUse);
      map.set(
        INDICATOR_TYPES_NEW.UNSUSTAINABLE_WATER_USE,
        unsustainableWaterUse,
      );
      map.set(INDICATOR_TYPES_NEW.LAND_USE, landUse);
      map.set(
        INDICATOR_TYPES_NEW.SATELLIGENCE_DEFORESTATION,
        data.satDeforestation,
      );

      map.set(
        INDICATOR_TYPES_NEW.SATELLIGENCE_DEFORESTATION_RISK,
        data.satDeforestationRisk,
      );

      activeIndicators.forEach((indicator: Indicator) => {
        newImpactToBeSaved.push(
          IndicatorRecord.merge(new IndicatorRecord(), {
            value: map.get(indicator.nameCode as INDICATOR_TYPES_NEW),
            indicatorId: indicator.id,
            status: INDICATOR_RECORD_STATUS.SUCCESS,
            sourcingRecordId: data.sourcingRecordId,
            scaler: data.production,
            materialH3DataId: data.materialH3DataId,
          }),
        );
      });
    });
    await this.indicatorRecordRepository.saveChunks(newImpactToBeSaved);
  }

  async createIndicatorRecordsBySourcingRecords(
    sourcingData: {
      sourcingRecordId: string;
      geoRegionId: string;
      materialId: string;
      adminRegionId: string;
      tonnage: number;
      year: number;
      sourcingRecord?: SourcingRecord;
    },
    providedCoefficients?: IndicatorCoefficientsDtoV2,
  ): Promise<any> {
    const {
      geoRegionId,
      materialId,
      adminRegionId,
      tonnage,
      sourcingRecordId,
      sourcingRecord,
    } = sourcingData;

    let calculatedIndicatorRecordValues: IndicatorRecordCalculatedValuesDtoV2;
    const indicatorRecords: IndicatorRecord[] = [];
    const materialH3s: MaterialToH3 | undefined =
      await this.materialToH3.findOne({
        where: { materialId },
      });
    if (!materialH3s) {
      throw new MissingH3DataError();
    }

    const indicatorsToCalculateImpactFor: Indicator[] =
      await this.indicatorService.findAllUnpaginated();
    let rawData: IndicatorRawDataBySourcingRecord;
    if (providedCoefficients) {
      calculatedIndicatorRecordValues = this.useProvidedIndicatorCoefficients(
        providedCoefficients,
        { sourcingRecordId, tonnage },
        materialH3s.h3DataId,
      );

      // Getting production / scaler value from received sourcing record of finding it by material h3 data and georegion

      if (
        sourcingData.sourcingRecord &&
        sourcingData.sourcingRecord.indicatorRecords
      ) {
        rawData = new IndicatorRawDataBySourcingRecord();
        rawData.production =
          sourcingData.sourcingRecord.indicatorRecords[0].scaler;
      } else {
        // Here we will get production value that will e saved as scaler later

        const productionValue: { production: number }[] =
          await this.getProductionValueForGeoregionAndMaterial(
            geoRegionId,
            materialId,
          );
        rawData = new IndicatorRawDataBySourcingRecord();
        rawData.production = productionValue[0].production;
      }
    } else {
      const queryForActiveIndicators: string =
        this.dependencyManager.buildQueryForIntervention(
          indicatorsToCalculateImpactFor.map(
            (i: Indicator) => i.nameCode as INDICATOR_TYPES_NEW,
          ),
        );

      rawData = await this.getImpactRawDataPerSourcingRecord(
        queryForActiveIndicators,
        materialId,
        geoRegionId,
        adminRegionId,
      );

      calculatedIndicatorRecordValues =
        new IndicatorRecordCalculatedValuesDtoV2();
      calculatedIndicatorRecordValues.values = new Map<
        INDICATOR_TYPES_NEW,
        number
      >();

      const landPerTon: number =
        rawData.harvestedArea ?? 0 / rawData.production ?? 0;
      const weightedTotalCropLandArea: number =
        rawData.weightedAllHarvest ?? 0 / rawData.production ?? 0;
      const deforestationPerHarvestLandUse: number =
        weightedTotalCropLandArea > 0
          ? rawData.rawDeforestation / weightedTotalCropLandArea
          : 0;
      const carbonPerHarvestLandUse: number =
        weightedTotalCropLandArea > 0
          ? rawData.rawCarbon / weightedTotalCropLandArea
          : 0;
      const landUse: number = landPerTon * sourcingData.tonnage;
      const deforestation: number = deforestationPerHarvestLandUse * landUse;
      const carbonLoss: number = carbonPerHarvestLandUse * landUse;
      const waterUse: number = rawData.rawWater * sourcingData.tonnage;
      const unsustainableWaterUse: number =
        waterUse * rawData.waterStressPerct ? rawData.waterStressPerct : 0;

      calculatedIndicatorRecordValues.values.set(
        INDICATOR_TYPES_NEW.CLIMATE_RISK,
        carbonLoss,
      );
      calculatedIndicatorRecordValues.values.set(
        INDICATOR_TYPES_NEW.DEFORESTATION_RISK,
        deforestation,
      );
      calculatedIndicatorRecordValues.values.set(
        INDICATOR_TYPES_NEW.WATER_USE,
        waterUse,
      );
      calculatedIndicatorRecordValues.values.set(
        INDICATOR_TYPES_NEW.UNSUSTAINABLE_WATER_USE,
        unsustainableWaterUse,
      );
      calculatedIndicatorRecordValues.values.set(
        INDICATOR_TYPES_NEW.LAND_USE,
        landUse,
      );
      calculatedIndicatorRecordValues.values.set(
        INDICATOR_TYPES_NEW.SATELLIGENCE_DEFORESTATION,
        rawData.satDeforestation,
      );

      calculatedIndicatorRecordValues.values.set(
        INDICATOR_TYPES_NEW.SATELLIGENCE_DEFORESTATION_RISK,
        rawData.satDeforestationRisk,
      );
    }

    indicatorsToCalculateImpactFor.forEach((indicator: Indicator) => {
      indicatorRecords.push(
        IndicatorRecord.merge(new IndicatorRecord(), {
          value: calculatedIndicatorRecordValues.values.get(
            indicator.nameCode as INDICATOR_TYPES_NEW,
          ),
          indicatorId: indicator.id,
          status: INDICATOR_RECORD_STATUS.SUCCESS,
          sourcingRecordId: sourcingData.sourcingRecordId,
          scaler: rawData?.production ?? null,
          materialH3DataId: materialH3s.h3DataId,
        }),
      );
    });

    return indicatorRecords;
  }

  async getImpactRawDataPerSourcingRecord(
    dynamicQuery: string,
    materialId: string,
    geoRegionId: string,
    adminRegionId: string,
  ): Promise<IndicatorRawDataBySourcingRecord> {
    try {
      const res: any[] = await getManager().query(`SELECT ${dynamicQuery}`, [
        geoRegionId,
        materialId,
        adminRegionId,
      ]);
      return res[0];
    } catch (error: any) {
      console.error(error);
      throw new ServiceUnavailableException(
        `Could not calculate Raw Indicator values for new Scenario`,
      );
    }
  }

  async getProductionValueForGeoregionAndMaterial(
    geoRegionId: string,
    materialId: string,
  ): Promise<{ production: number }[]> {
    const res: { production: number }[] = await getManager().query(
      `SELECT sum_material_over_georegion($1, $2, 'producer') as production`,
      [geoRegionId, materialId],
    );
    return res;
  }

  /**
   * @description: Calculates Indicator values by the tonnage of the impact and estimates (coefficients) provided
   * by the user, for each possible indicator passed in an array
   */
  private useProvidedIndicatorCoefficients(
    newIndicatorCoefficients: IndicatorCoefficientsDtoV2,
    sourcingData: { sourcingRecordId: string; tonnage: number },
    materialH3DataId: string,
  ): IndicatorRecordCalculatedValuesDtoV2 {
    const calculatedIndicatorValues: IndicatorRecordCalculatedValuesDtoV2 =
      new IndicatorRecordCalculatedValuesDtoV2();
    calculatedIndicatorValues.sourcingRecordId = sourcingData.sourcingRecordId;
    calculatedIndicatorValues.materialH3DataId = materialH3DataId;
    calculatedIndicatorValues.values = new Map<INDICATOR_TYPES_NEW, number>();
    calculatedIndicatorValues.values.set(
      INDICATOR_TYPES_NEW.LAND_USE,
      newIndicatorCoefficients[INDICATOR_TYPES_NEW.LAND_USE] *
        sourcingData.tonnage,
    );
    calculatedIndicatorValues.values.set(
      INDICATOR_TYPES_NEW.DEFORESTATION_RISK,
      newIndicatorCoefficients[INDICATOR_TYPES_NEW.DEFORESTATION_RISK] *
        sourcingData.tonnage,
    );
    calculatedIndicatorValues.values.set(
      INDICATOR_TYPES_NEW.CLIMATE_RISK,
      newIndicatorCoefficients[INDICATOR_TYPES_NEW.CLIMATE_RISK] *
        sourcingData.tonnage,
    );
    calculatedIndicatorValues.values.set(
      INDICATOR_TYPES_NEW.WATER_USE,
      newIndicatorCoefficients[INDICATOR_TYPES_NEW.WATER_USE] *
        sourcingData.tonnage,
    );

    // TODO: We need to ignore satelligence indicators from being affected by a coefficient that a user can send
    //       updating the model will be required for this, as by default any indicator that is active will be shown
    //       in the UI, also for sending coefficients in intervention calculation

    // Depends on water use indicator's final value
    const waterUseValue: number = calculatedIndicatorValues.values.get(
      INDICATOR_TYPES_NEW.WATER_USE,
    )!;
    calculatedIndicatorValues.values.set(
      INDICATOR_TYPES_NEW.UNSUSTAINABLE_WATER_USE,
      waterUseValue *
        newIndicatorCoefficients[INDICATOR_TYPES_NEW.UNSUSTAINABLE_WATER_USE] *
        sourcingData.tonnage,
    );

    return calculatedIndicatorValues;
  }

  async getIndicatorRawDataForAllSourcingRecordsV2(
    activeIndicators: Indicator[],
  ): Promise<SourcingRecordsWithIndicatorRawDataDtoV2[]> {
    const { params, query } = this.dependencyManager.buildQueryForImport(
      activeIndicators.map(
        (indicator: Indicator) => indicator.nameCode as INDICATOR_TYPES_NEW,
      ),
    );
    try {
      // TODO due to possible performance issues this query that makes use of the stored procedures for
      //      indicator value calculation has not been refactored. It remains to be reworked
      const response: any = await getManager().query(
        `
        SELECT
          -- TODO: Hack to retrieve 1 materialH3Id for each sourcingRecord. This should include a year fallback strategy in the stored procedures
          --       used below
          distinct on (sr.id)
          sr.id as "sourcingRecordId",
          sr.tonnage,
          sr.year,
          slwithmaterialh3data.id as "sourcingLocationId",
          slwithmaterialh3data."materialH3DataId",
          ${params}

      FROM
          sourcing_records sr
          INNER JOIN
              (
                  SELECT
                      sourcing_location.id,
                      "scenarioInterventionId",
                      "interventionType",
                      mth."h3DataId" as "materialH3DataId",
                      ${query}

                  FROM
                      sourcing_location
                  inner join
                    material_to_h3 mth
                  on
                    mth."materialId" = sourcing_location."materialId"
                  WHERE "scenarioInterventionId" IS NULL
                  AND "interventionType" IS NULL
                  and mth."type" = 'producer'
              ) as slwithmaterialh3data
              on sr."sourcingLocationId" = slwithmaterialh3data.id`,
      );
      if (!response.length)
        this.logger.warn(
          `Could not retrieve Sourcing Records with weighted indicator values`,
        );

      return response;
    } catch (err: any) {
      this.logger.error(
        `Error querying data from DB to calculate Indicator Records: ${err.message}`,
      );
      throw new MissingH3DataError(
        `Could net retrieve Indicator Raw data from Sourcing Locations: ${err}`,
      );
    }
  }
}
