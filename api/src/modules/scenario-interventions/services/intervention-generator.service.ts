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
import { Material } from 'modules/materials/material.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';

/**
 * @description: Utility wrapper to encapsulate some logics regarding new intervention generation
 */

@Injectable()
export class InterventionGeneratorService {
  constructor(
    protected readonly materialService: MaterialsService,
    protected readonly businessUnitService: BusinessUnitsService,
    protected readonly adminRegionService: AdminRegionsService,
    protected readonly suppliersService: SuppliersService,
  ) {}

  createInterventionInstance(
    dto: CreateScenarioInterventionDto,
  ): ScenarioIntervention {
    const scenarioIntervention: ScenarioIntervention =
      new ScenarioIntervention();
    scenarioIntervention.title = dto.title;
    scenarioIntervention.description = dto.description;
    scenarioIntervention.scenarioId = dto.scenarioId;
    scenarioIntervention.startYear = dto.startYear;
    scenarioIntervention.percentage = dto.percentage;
    scenarioIntervention.endYear = dto.endYear;
    scenarioIntervention.type = dto.type;
    scenarioIntervention.newIndicatorCoefficients =
      dto.newIndicatorCoefficients as unknown as JSON;
    scenarioIntervention.newLocationType = dto.newLocationType;
    scenarioIntervention.newLocationCountryInput = dto.newLocationCountryInput;
    scenarioIntervention.newLocationAddressInput = dto.newLocationAddressInput;

    return scenarioIntervention;
  }
  async addDescendantsEntitiesForFiltering(
    dto: CreateScenarioInterventionDto,
  ): Promise<CreateScenarioInterventionDto> {
    dto.materialIds = await this.materialService.getMaterialsDescendants(
      dto.materialIds,
    );

    dto.adminRegionIds =
      await this.adminRegionService.getAdminRegionDescendants(
        dto.adminRegionIds,
      );

    dto.supplierIds = await this.suppliersService.getSuppliersDescendants(
      dto.supplierIds,
    );

    dto.businessUnitIds =
      await this.businessUnitService.getBusinessUnitsDescendants(
        dto.businessUnitIds,
      );

    return dto;
  }

  async addReplacedElementsToIntervention(
    newIntervention: ScenarioIntervention,
    cancelledSourcingLocations: SourcingLocation[],
  ): Promise<ScenarioIntervention> {
    const materialIds: string[] = [];
    const adminRegionsIds: string[] = [];
    const businessUnitIds: string[] = [];
    const supplierIds: string[] = [];
    for await (const sourcingLocation of cancelledSourcingLocations) {
      if (sourcingLocation.materialId) {
        materialIds.push(sourcingLocation.materialId);
      }
      if (sourcingLocation.adminRegionId) {
        adminRegionsIds.push(sourcingLocation.adminRegionId);
      }
      if (sourcingLocation.businessUnitId) {
        businessUnitIds.push(sourcingLocation.businessUnitId);
      }
      if (sourcingLocation.producerId || sourcingLocation.t1SupplierId) {
        supplierIds.push(
          sourcingLocation.producerId
            ? sourcingLocation.producerId
            : sourcingLocation.t1SupplierId,
        );
      }
    }

    const replacedMaterials: Material[] =
      await this.materialService.getMaterialsById(materialIds);

    const replacedAdminRegions: AdminRegion[] =
      await this.adminRegionService.getAdminRegionsById(adminRegionsIds);

    const replacedBusinessUnits: BusinessUnit[] =
      await this.businessUnitService.getBusinessUnitsById(businessUnitIds);

    const replacedSuppliers: Supplier[] =
      await this.suppliersService.getSuppliersById(supplierIds);

    newIntervention.replacedMaterials = replacedMaterials;
    newIntervention.replacedAdminRegions = replacedAdminRegions;
    newIntervention.replacedBusinessUnits = replacedBusinessUnits;
    newIntervention.replacedSuppliers = replacedSuppliers;

    newIntervention.replacedSourcingLocations = cancelledSourcingLocations;

    return newIntervention;
  }

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
}
