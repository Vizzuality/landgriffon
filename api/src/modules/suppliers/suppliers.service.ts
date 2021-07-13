import { Injectable, NotFoundException } from '@nestjs/common';
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
      attributes: ['name', 'description', 'status', 'metadata'],
      keyForAttribute: 'camelCase',
    };
  }

  async getSupplierById(id: number): Promise<Supplier> {
    const found = await this.repository.findOne(id);

    if (!found) {
      throw new NotFoundException(`Supplier with ID "${id}" not found`);
    }

    return found;
  }

  async saveMany(entityArray: Supplier[]): Promise<void> {
    await this.supplierRepository.save(entityArray);
  }
}
