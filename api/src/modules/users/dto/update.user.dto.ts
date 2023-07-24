import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateUserDTO } from 'modules/users/dto/create.user.dto';
import { IsEmail, IsOptional, MaxLength } from 'class-validator';

export class UpdateUserDTO extends PartialType(CreateUserDTO) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email: string;
}

export class UpdateOwnUserDTO {
  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional()
  @IsOptional()
  title?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  fname?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  lname?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  // Limit the data URI of the avatar to a sensible size.
  @MaxLength(1e5)
  avatarDataUrl?: string;
}
