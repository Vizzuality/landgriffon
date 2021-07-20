import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class DepthDto {
  @IsOptional()
  @Transform((val: any) => (val ? parseInt(val, 10) : null))
  depth?: number;
}
