import {
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import {
  Supplier,
  SUPPLIER_TYPES,
  supplierResource,
} from 'modules/suppliers/supplier.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { CreateSupplierDto } from 'modules/suppliers/dto/create.supplier.dto';
import { UpdateSupplierDto } from 'modules/suppliers/dto/update.supplier.dto';
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';
import { SelectQueryBuilder } from 'typeorm';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { GetSupplierByType } from 'modules/suppliers/dto/get-supplier-by-type.dto';
import { GetSupplierTreeWithOptions } from 'modules/suppliers/dto/get-supplier-tree-with-options.dto';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { BusinessUnitsService } from 'modules/business-units/business-units.service';
import { MaterialsService } from 'modules/materials/materials.service';

@Injectable()
export class SuppliersService extends AppBaseService<
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
  AppInfoDTO
> {
  constructor(
    protected readonly supplierRepository: SupplierRepository,
    @Inject(forwardRef(() => AdminRegionsService))
    protected readonly adminRegionService: AdminRegionsService,
    @Inject(forwardRef(() => BusinessUnitsService))
    protected readonly businessUnitsService: BusinessUnitsService,
    @Inject(forwardRef(() => MaterialsService))
    protected readonly materialsService: MaterialsService,
    @Inject(forwardRef(() => SourcingLocationsService))
    protected readonly sourcingLocationService: SourcingLocationsService,
  ) {
    super(
      supplierRepository,
      supplierResource.name.singular,
      supplierResource.name.plural,
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<Supplier> {
    return {
      attributes: [
        'name',
        'description',
        'status',
        'metadata',
        'parentId',
        'children',
        'createdAt',
        'updatedAt',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  async create(createModel: CreateSupplierDto): Promise<Supplier> {
    if (createModel.parentId) {
      try {
        createModel.parent = await this.getSupplierById(createModel.parentId);
      } catch (error) {
        throw new HttpException(
          `Parent supplier with ID "${createModel.parentId}" not found`,
          400,
        );
      }
    }

    return super.create(createModel);
  }

  async getSupplierById(id: string): Promise<Supplier> {
    const found: Supplier | null = await this.repository.findOne({
      where: { id },
    });

    if (!found) {
      throw new NotFoundException(`Supplier with ID "${id}" not found`);
    }

    return found;
  }

  async getSuppliersById(id: string[]): Promise<Supplier[]> {
    return await this.repository.findByIds(id);
  }

  async saveMany(entityArray: Supplier[]): Promise<void> {
    await this.supplierRepository.save(entityArray);
  }

  async getTrees(
    supplierTreeOptions: GetSupplierTreeWithOptions,
  ): Promise<Supplier[]> {
    if (supplierTreeOptions.withSourcingLocations) {
      if (supplierTreeOptions.originIds) {
        supplierTreeOptions.originIds =
          await this.adminRegionService.getAdminRegionDescendants(
            supplierTreeOptions.originIds,
          );
      }
      if (supplierTreeOptions.businessUnitIds) {
        supplierTreeOptions.businessUnitIds =
          await this.businessUnitsService.getBusinessUnitsDescendants(
            supplierTreeOptions.businessUnitIds,
          );
      }
      if (supplierTreeOptions.materialIds) {
        supplierTreeOptions.materialIds =
          await this.materialsService.getMaterialsDescendants(
            supplierTreeOptions.materialIds,
          );
      }
      return this.getSuppliersWithSourcingLocations(supplierTreeOptions);
    }

    return this.findTreesWithOptions(supplierTreeOptions.depth);
  }

  async createTree(importData: CreateSupplierDto[]): Promise<Supplier[]> {
    this.logger.log(`Creating Supplier tree with ${importData.length} nodes`);
    return this.supplierRepository.saveListToTree(importData, 'mpath');
  }

  async clearTable(): Promise<void> {
    await this.supplierRepository.delete({});
  }

  async getSuppliersByIds(ids: string[]): Promise<Supplier[]> {
    return this.supplierRepository.findByIds(ids);
  }

  async findTreesWithOptions(depth?: number): Promise<Supplier[]> {
    return this.supplierRepository.findTrees({ depth });
  }

  async findAllUnpaginated(): Promise<Supplier[]> {
    return this.supplierRepository.find({});
  }

  /**
   *
   *  @description Get a tree of Suppliers that are associated with sourcing locations
   */

  async getSuppliersWithSourcingLocations(
    supplierTreeOptions: GetSupplierTreeWithOptions,
    withAncesty: boolean = true,
  ): Promise<any> {
    const supplierLineage: Supplier[] =
      await this.supplierRepository.getSuppliersFromSourcingLocations(
        supplierTreeOptions,
        withAncesty,
      );
    if (!withAncesty) {
      return supplierLineage;
    }
    return this.buildTree<Supplier>(supplierLineage, null);
  }

  async getSupplierByType(typeOptions: GetSupplierByType): Promise<Supplier[]> {
    const { type } = typeOptions;
    const queryBuilder: SelectQueryBuilder<Supplier> = this.supplierRepository
      .createQueryBuilder('s')
      .innerJoin(
        SourcingLocation,
        'sl',
        's.id = sl.t1SupplierId OR s.id = sl.producerId',
      );
    if (type === SUPPLIER_TYPES.T1SUPPLIER) {
      queryBuilder.where('sl.t1SupplierId IS NOT NULL');
    } else if (type === SUPPLIER_TYPES.PRODUCER) {
      queryBuilder.where('sl.producerId IS NOT NULL');
    }
    return queryBuilder.getMany();
  }

  async getSuppliersDescendants(supplierIds: string[]): Promise<string[]> {
    // using type casting not to search for and provide the full entity, since only id is used by the method (to improve performance)
    let suppliers: Supplier[] = [];
    for (const id of supplierIds) {
      const result: Supplier[] = await this.supplierRepository.findDescendants({
        id,
      } as Supplier);
      suppliers = [...suppliers, ...result];
    }

    return suppliers.map((supplier: Supplier) => supplier.id);
  }
}
