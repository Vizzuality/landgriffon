import { Injectable } from '@nestjs/common';
import { CreateScenarioInterventionDto } from 'modules/scenario-interventions/dto/create.scenario-intervention.dto';
import {
  SCENARIO_INTERVENTION_TYPE,
  ScenarioIntervention,
} from 'modules/scenario-interventions/scenario-intervention.entity';
import { MaterialsService } from 'modules/materials/materials.service';
import { BusinessUnitsService } from 'modules/business-units/business-units.service';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { SuppliersService } from 'modules/suppliers/suppliers.service';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { NewMaterialIntervention } from 'modules/scenario-interventions/strategies/new-material.intervention.strategy';
import { IndicatorRecordsService } from 'modules/indicator-records/indicator-records.service';
import {
  IndicatorCoefficientsDto,
  IndicatorCoefficientsDtoV2,
} from 'modules/indicator-coefficients/dto/indicator-coefficients.dto';
import { NewSupplierLocationIntervention } from 'modules/scenario-interventions/strategies/new-supplier-location.intervention.strategy';
import { ChangeProductionEfficiencyIntervention } from 'modules/scenario-interventions/strategies/change-production-efficiency.intervention.strategy';
import { ImpactCalculator } from 'modules/indicator-records/services/impact-calculator.service';
import * as config from 'config';
const useNewMethodology: boolean =
  `${config.get('newMethodology')}`.toLowerCase() === 'true';

/**
 * @description: This service consumes a previously created Intervention instance and takes care of building the full entity
 *               with all the required relations mutating the original instance
 */

@Injectable()
export class InterventionBuilder {
  constructor(
    protected readonly materialService: MaterialsService,
    protected readonly businessUnitService: BusinessUnitsService,
    protected readonly adminRegionService: AdminRegionsService,
    protected readonly suppliersService: SuppliersService,
    protected readonly newMaterialIntervention: NewMaterialIntervention,
    protected readonly indicatorRecordService: IndicatorRecordsService,
    protected readonly newSupplierLocationIntervention: NewSupplierLocationIntervention,
    protected readonly changeProductionEfficiencyIntervention: ChangeProductionEfficiencyIntervention,
    protected readonly impactCalculator: ImpactCalculator,
  ) {}

  async addDescendantsEntitiesForFiltering(
    dto: CreateScenarioInterventionDto,
  ): Promise<CreateScenarioInterventionDto> {
    const dtoWithDescendants: CreateScenarioInterventionDto = { ...dto };

    // A Material Id is always required
    dtoWithDescendants.materialIds =
      await this.materialService.getMaterialsDescendants(dto.materialIds);

    if (dto.adminRegionIds)
      dtoWithDescendants.adminRegionIds =
        await this.adminRegionService.getAdminRegionDescendants(
          dto.adminRegionIds,
        );

    if (dto.businessUnitIds)
      dtoWithDescendants.businessUnitIds =
        await this.businessUnitService.getBusinessUnitsDescendants(
          dto.businessUnitIds,
        );

    if (dto.supplierIds)
      dtoWithDescendants.supplierIds =
        await this.suppliersService.getSuppliersDescendants(dto.supplierIds);

    return dtoWithDescendants;
  }

  /**
   * @description: For each cancelled location, get all elements: AdminRegions, BU, Suppliers, Materials
   *               to be added as replaced Elements of the Intervention
   * @param newIntervention
   * @param cancelledSourcingLocations
   * @param dto
   */

  async addReplacedElementsToIntervention(
    newIntervention: ScenarioIntervention,
    cancelledSourcingLocations: SourcingLocation[],
    dto: CreateScenarioInterventionDto,
  ): Promise<ScenarioIntervention> {
    if (dto.materialIds?.length) {
      newIntervention.replacedMaterials =
        await this.materialService.getMaterialsById(dto.materialIds);
    }
    if (dto.adminRegionIds?.length) {
      newIntervention.replacedAdminRegions =
        await this.adminRegionService.getAdminRegionsById(dto.adminRegionIds);
    }
    if (dto.businessUnitIds?.length) {
      newIntervention.replacedBusinessUnits =
        await this.businessUnitService.getBusinessUnitsById(
          dto.businessUnitIds,
        );
    }
    if (dto.supplierIds?.length) {
      newIntervention.replacedSuppliers =
        await this.suppliersService.getSuppliersById(dto.supplierIds);
    }

    newIntervention.replacedSourcingLocations = cancelledSourcingLocations;

    return newIntervention;
  }

  /**
   * @description: Add new replacing elements to the intervention instance. Since the new locations are created
   *               according to the new data the user wants apply for that intervention, we can get these elements
   *               using the the locations. i.e, we could not use the dto to determine the new Admin Regions, as this
   *               will only be known after the geocoding
   *
   */

  async addReplacingElementsToIntervention(
    newIntervention: ScenarioIntervention,
    newSourcingLocations: SourcingData[],
    type: SCENARIO_INTERVENTION_TYPE,
  ): Promise<ScenarioIntervention> {
    if (type === SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL) {
      newIntervention.newMaterial = await this.materialService.getMaterialById(
        newSourcingLocations[0].materialId,
      );
      newIntervention.newAdminRegion =
        await this.adminRegionService.getAdminRegionById(
          newSourcingLocations[0].adminRegionId!,
        );
      if (newSourcingLocations[0].producerId) {
        newIntervention.newProducer =
          await this.suppliersService.getSupplierById(
            newSourcingLocations[0].producerId,
          );
      }
      if (newSourcingLocations[0].t1SupplierId) {
        newIntervention.newT1Supplier =
          await this.suppliersService.getSupplierById(
            newSourcingLocations[0].t1SupplierId,
          );
      }
    }
    if (type === SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER) {
      if (newSourcingLocations[0].producerId) {
        newIntervention.newProducer =
          await this.suppliersService.getSupplierById(
            newSourcingLocations[0].producerId,
          );
        newIntervention.newAdminRegion =
          await this.adminRegionService.getAdminRegionById(
            newSourcingLocations[0].adminRegionId!,
          );
      }
      if (newSourcingLocations[0].t1SupplierId) {
        newIntervention.newT1Supplier =
          await this.suppliersService.getSupplierById(
            newSourcingLocations[0].t1SupplierId,
          );
        newIntervention.newAdminRegion =
          await this.adminRegionService.getAdminRegionById(
            newSourcingLocations[0].adminRegionId!,
          );
      }
    }
    return newIntervention;
  }

  /**
   * @description:  Mutates the filtered Sourcing Location applying the percentage selected by the user to the volume (Sourcing Records)
   *                and impact associated to these volumes (Indicator Records), as the relation is proportial
   */
  applySelectedPercentage(
    filteredSourcingLocations: SourcingLocation[],
    percentage: number,
  ): void {
    filteredSourcingLocations.forEach((sl: SourcingLocation) => {
      sl.sourcingRecords.forEach((sr: SourcingRecord) => {
        sr.tonnage = sr.tonnage * (percentage / 100);

        sr.indicatorRecords.map((ir: IndicatorRecord) => {
          ir.value = -ir.value * (percentage / 100);
        });
      });
    });
  }

  /**
   * @description: Receives a array of new generated Sourcing Locations for when the intervention type requires new locations to be added. Calculates the new Impact for said locations
   *               and mutates the received New Intervention instance
   * @param newSourcingLocations
   * @param newIndicatorCoefficients
   * @param newScenarioIntervention
   */

  async calculateNewImpactForNewLocations(
    newSourcingLocations: SourcingLocation[],
    newIndicatorCoefficients: IndicatorCoefficientsDto | undefined,
    newScenarioIntervention: ScenarioIntervention,
  ): Promise<ScenarioIntervention> {
    for (const sourcingLocation of newSourcingLocations) {
      for await (const sourcingRecord of sourcingLocation.sourcingRecords) {
        const sourcingData: any = {
          sourcingRecordId: sourcingRecord.id,
          tonnage: sourcingRecord.tonnage,
          geoRegionId: sourcingLocation.geoRegionId,
          materialId: sourcingLocation.materialId,
          adminRegionId: sourcingLocation.adminRegionId,
          year: sourcingRecord.year,
        };
        sourcingRecord.indicatorRecords = useNewMethodology
          ? await this.impactCalculator.createIndicatorRecordsBySourcingRecords(
              sourcingData,
              newIndicatorCoefficients as unknown as IndicatorCoefficientsDtoV2,
            )
          : await this.indicatorRecordService.createIndicatorRecordsBySourcingRecords(
              sourcingData,
              newIndicatorCoefficients,
            );
      }
    }

    newScenarioIntervention.newSourcingLocations = newSourcingLocations;

    return newScenarioIntervention;
  }

  async generateNewLocationsForIntervention(
    dto: CreateScenarioInterventionDto,
    newIntervention: ScenarioIntervention,
    actualSourcingLocations: SourcingLocation[],
    locationData: {
      adminRegionId: string;
      geoRegionId: string;
      locationWarning: string | undefined;
    },
  ): Promise<any> {
    switch (dto.type) {
      case SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL:
        const newMaterialInterventionLocation: SourcingLocation[] =
          this.newMaterialIntervention.generateNewSourcingLocation(
            dto,
            actualSourcingLocations,
            locationData,
          );

        // Mutates the original instance adding the new Replacing elements: new Admin Region etc
        await this.addReplacingElementsToIntervention(
          newIntervention,
          newMaterialInterventionLocation,
          SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL,
        );

        return newMaterialInterventionLocation;

      case SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER:
        const newSupplerInterventionLocations: SourcingLocation[] =
          this.newSupplierLocationIntervention.generateNewReplacingSourcingLocationsForNewSupplierIntervention(
            dto,
            actualSourcingLocations,
            locationData,
          );

        await this.addReplacingElementsToIntervention(
          newIntervention,
          newSupplerInterventionLocations,
          SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER,
        );
        // Mutates the original instance calculating new impact for the new location created

        return newSupplerInterventionLocations;

      case SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY:
        return this.changeProductionEfficiencyIntervention.generateNewLocationForChangeProductionEfficiency(
          actualSourcingLocations,
        );
    }
  }
}
