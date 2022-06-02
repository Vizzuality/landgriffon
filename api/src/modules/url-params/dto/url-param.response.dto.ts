import { ApiProperty } from '@nestjs/swagger';

class UrlResponseAttributes {
  @ApiProperty()
  params: Record<string, any>;
}

class UrlResponseDto {
  @ApiProperty()
  type: string;
  @ApiProperty()
  id: string;
  @ApiProperty()
  attributes: UrlResponseAttributes;
}

export class SerializedUrlResponseDto {
  @ApiProperty()
  data: UrlResponseDto;
}
