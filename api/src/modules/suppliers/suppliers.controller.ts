import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { SuppliersService } from 'modules/suppliers/suppliers.service';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  JSONAPIQueryParams,
  JSONAPISingleEntityQueryParams,
} from 'decorators/json-api-parameters.decorator';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';
import { Supplier, supplierResource } from 'modules/suppliers/supplier.entity';
import { CreateSupplierDto } from 'modules/suppliers/dto/create.supplier.dto';
import { UpdateSupplierDto } from 'modules/suppliers/dto/update.supplier.dto';

@Controller(`/api/v1/suppliers`)
@ApiTags(supplierResource.className)
export class SuppliersController {
  constructor(public readonly suppliersService: SuppliersService) {}

  @ApiOperation({
    description: 'Find all suppliers',
  })
  @ApiOkResponse({
    type: Supplier,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams()
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<Supplier> {
    const results = await this.suppliersService.findAllPaginated(
      fetchSpecification,
    );
    return this.suppliersService.serialize(results.data, results.metadata);
  }

  @ApiOperation({ description: 'Find supplier by id' })
  @ApiOkResponse({ type: Supplier })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Supplier> {
    return await this.suppliersService.serialize(
      await this.suppliersService.getById(id),
    );
  }

  @ApiOperation({ description: 'Create a supplier' })
  @ApiOkResponse({ type: Supplier })
  @Post()
  async create(@Body() dto: CreateSupplierDto): Promise<Supplier> {
    return await this.suppliersService.serialize(
      await this.suppliersService.create(dto),
    );
  }

  @ApiOperation({ description: 'Updates a supplier' })
  @ApiOkResponse({ type: Supplier })
  @Patch(':id')
  async update(
    @Body(new ValidationPipe()) dto: UpdateSupplierDto,
    @Param('id') id: string,
  ): Promise<Supplier> {
    return await this.suppliersService.serialize(
      await this.suppliersService.update(id, dto),
    );
  }

  @ApiOperation({ description: 'Deletes a supplier' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.suppliersService.remove(id);
  }
}
