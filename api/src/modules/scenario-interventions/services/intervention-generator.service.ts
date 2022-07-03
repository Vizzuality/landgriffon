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

  async addDescendantsEntitiesForFiltering(
    dto: CreateScenarioInterventionDto,
  ): Promise<CreateScenarioInterventionDto> {
    let dtoWithDescendants: CreateScenarioInterventionDto = { ...dto };

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

  async addReplacedElementsToIntervention(
    newIntervention: ScenarioIntervention,
    cancelledSourcingLocations: SourcingLocation[],
  ): Promise<ScenarioIntervention> {
    const materialIds: string[] = [];
    const adminRegionsIds: string[] = [];
    const businessUnitIds: string[] = [];
    const supplierIds: string[] = [];
    for (const sourcingLocation of cancelledSourcingLocations) {
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

    newIntervention.replacedMaterials =
      await this.materialService.getMaterialsById(materialIds);

    newIntervention.replacedAdminRegions =
      await this.adminRegionService.getAdminRegionsById(adminRegionsIds);

    newIntervention.replacedBusinessUnits =
      await this.businessUnitService.getBusinessUnitsById(businessUnitIds);

    if (supplierIds.length) {
      newIntervention.replacedSuppliers =
        await this.suppliersService.getSuppliersById(supplierIds);
    }

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
