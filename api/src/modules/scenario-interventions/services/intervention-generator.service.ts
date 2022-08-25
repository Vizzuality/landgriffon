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
   */

  async addReplacedElementsToIntervention(
    newIntervention: ScenarioIntervention,
    cancelledSourcingLocations: SourcingLocation[],
  ): Promise<ScenarioIntervention> {
    const materialIds: string[] = [];
    const adminRegionsIds: string[] = [];
    const businessUnitIds: string[] = [];
    const supplierIds: string[] = [];
    // Get Ids for all the elements to avoid a round trip to DB for each Id
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
    // If Ids are received, get those
    if (adminRegionsIds.length) {
      newIntervention.replacedAdminRegions =
        await this.adminRegionService.getAdminRegionsById(adminRegionsIds);
      // If no Id is received, the user want to replace all of them present in Sourcing Locations
    } else {
      newIntervention.replacedAdminRegions =
        await this.adminRegionService.getAdminRegionWithSourcingLocations(
          {},
          false,
        );
    }
    if (businessUnitIds) {
      newIntervention.replacedBusinessUnits =
        await this.businessUnitService.getBusinessUnitsById(businessUnitIds);
    } else {
      newIntervention.replacedBusinessUnits =
        await this.businessUnitService.getBusinessUnitWithSourcingLocations(
          {},
          false,
        );
    }

    if (supplierIds.length) {
      newIntervention.replacedSuppliers =
        await this.suppliersService.getSuppliersById(supplierIds);
    } else {
      newIntervention.replacedSuppliers =
        await this.suppliersService.getSuppliersWithSourcingLocations(
          {},
          false,
        );
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
