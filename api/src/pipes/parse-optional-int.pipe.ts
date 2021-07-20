import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseOptionalIntPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    return value === null ? null : parseInt(value, 10);
  }
}
