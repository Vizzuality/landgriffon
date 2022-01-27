import { CustomDecorator, SetMetadata } from '@nestjs/common';
export const Public = (isPublic: boolean = true): CustomDecorator =>
  SetMetadata('isPublic', isPublic);
