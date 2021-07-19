import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import { Supplier, supplierResource } from 'modules/suppliers/supplier.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { CreateSupplierDto } from 'modules/suppliers/dto/create.supplier.dto';
import { UpdateSupplierDto } from 'modules/suppliers/dto/update.supplier.dto';

@Injectable()
export class SuppliersService extends AppBaseService<
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(SupplierRepository)
    protected readonly supplierRepository: SupplierRepository,
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
        const parentSupplier: Supplier = await this.getSupplierById(
          createModel.parentId,
        );
        createModel.parent = parentSupplier;
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
    const found = await this.repository.findOne(id);

    if (!found) {
      throw new NotFoundException(`Supplier with ID "${id}" not found`);
    }

    return found;
  }

  async saveMany(entityArray: Supplier[]): Promise<void> {
    await this.supplierRepository.save(entityArray);
  }

  async createTree(importData: CreateSupplierDto[]): Promise<Supplier[]> {
    return this.supplierRepository.saveListToTree(importData, 'mpath');
  }
}
