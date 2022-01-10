import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SuppliersService } from 'modules/suppliers/suppliers.service';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
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
import { ApiOkTreeResponse } from 'decorators/api-tree-response.decorator';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { ParseOptionalIntPipe } from 'pipes/parse-optional-int.pipe';
import { PaginationMeta } from 'utils/app-base.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller(`/api/v1/suppliers`)
@UseGuards(JwtAuthGuard)
@ApiTags(supplierResource.className)
export class SuppliersController {
  constructor(
    public readonly suppliersService: SuppliersService,
    public readonly suppliersRepository: SupplierRepository,
  ) {}

  @ApiOperation({
    description: 'Find all suppliers',
  })
  @ApiOkResponse({
    type: Supplier,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams({
    availableFilters: supplierResource.columnsAllowedAsFilter.map(
      (columnName: string) => ({
        name: columnName,
      }),
    ),
  })
  @Get()
  async findAll(
    @ProcessFetchSpecification({
      allowedFilters: supplierResource.columnsAllowedAsFilter,
    })
    fetchSpecification: FetchSpecification,
  ): Promise<Supplier> {
    const results: {
      data: (Partial<Supplier> | undefined)[];
      metadata: PaginationMeta | undefined;
    } = await this.suppliersService.findAllPaginated(fetchSpecification);
    return this.suppliersService.serialize(results.data, results.metadata);
  }

  @ApiOperation({
    description:
      'Find all suppliers and return them in a tree format. Data in the "children" will recursively extend for the full depth of the tree',
  })
  @ApiOkTreeResponse({
    treeNodeType: Supplier,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Get('/trees')
  @ApiQuery({
    name: 'depth',
    required: false,
    description:
      'A non-negative integer value. If specified, limits the depth of the tree crawling. 0 will return only the tree roots',
  })
  async getTrees(
    @Query('depth', ParseOptionalIntPipe) depth?: number,
  ): Promise<Supplier> {
    const results: Supplier[] = await this.suppliersRepository.findTrees({
      depth,
    });
    return this.suppliersService.serialize(results);
  }

  @ApiOperation({ description: 'Find supplier by id' })
  @ApiOkResponse({ type: Supplier })
  @ApiNotFoundResponse({ description: 'Supplier not found' })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Supplier> {
    return await this.suppliersService.serialize(
      await this.suppliersService.getById(id),
    );
  }

  @ApiOperation({ description: 'Create a supplier' })
  @ApiOkResponse({ type: Supplier })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @Post()
  @UsePipes(ValidationPipe)
  async create(@Body() dto: CreateSupplierDto): Promise<Supplier> {
    return await this.suppliersService.serialize(
      await this.suppliersService.create(dto),
    );
  }

  @ApiOperation({ description: 'Updates a supplier' })
  @ApiOkResponse({ type: Supplier })
  @ApiNotFoundResponse({ description: 'Supplier not found' })
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
  @ApiNotFoundResponse({ description: 'Supplier not found' })
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.suppliersService.remove(id);
  }
}
