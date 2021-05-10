import { ApiProperty } from '@nestjs/swagger';

import { IsDefined, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  @ApiProperty()
  username!: string;

  @IsNotEmpty()
  @IsDefined()
  @IsString()
  @ApiProperty()
  password!: string;
}
