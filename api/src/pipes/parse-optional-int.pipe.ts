import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseOptionalIntPipe implements PipeTransform {
  transform(value: any): any {
    return value === null ? null : parseInt(value, 10);
  }
}
