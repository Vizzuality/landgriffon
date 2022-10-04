import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateSupplierDto } from 'modules/suppliers/dto/create.supplier.dto';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(300)
  @ApiProperty()
  name?: string;
}
