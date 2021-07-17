import { Injectable } from '@nestjs/common';
import { validateOrReject } from 'class-validator';
import { DTOTransformedData } from 'modules/data-validation/dto-processor.service';

@Injectable()
export class DataValidationService {
  async validateDTOs(
    dtoLists: DTOTransformedData,
  ): Promise<void | Array<ErrorConstructor>> {
    const validationErrorArray: Array<typeof Error> = [];
    for (const parsedSheet in dtoLists) {
      for (const dto of dtoLists[parsedSheet as keyof DTOTransformedData]) {
        try {
          await validateOrReject(dto);
        } catch (err) {
          validationErrorArray.push(err);
        }
      }
    }

    /**
     * @note If errors are thrown, we should bypass all-exceptions.exception.filter.ts
     * in order to return the array containing errors in a more readable way
     * Or add a function per entity to validate
     */
    if (validationErrorArray.length) throw new Error(`${validationErrorArray}`);
  }
}
