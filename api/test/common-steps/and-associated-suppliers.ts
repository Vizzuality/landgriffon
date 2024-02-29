import { SourcingLocation } from '../../src/modules/sourcing-locations/sourcing-location.entity';
import {
  Supplier,
  SUPPLIER_TYPES,
} from '../../src/modules/suppliers/supplier.entity';

/**
 * @description Associate suppliers with sourcing locations for tests
 */

export const AndAssociatedSuppliers = async (
  supplier: Supplier[],
  existingSourcingLocations: SourcingLocation[],
  supplierType?: SUPPLIER_TYPES,
): Promise<SourcingLocation[]> => {
  const limitLength = Math.min(
    supplier.length,
    existingSourcingLocations.length,
  );
  for (let i = 0; i < limitLength; i++) {
    if (supplierType === SUPPLIER_TYPES.PRODUCER || !supplierType) {
      existingSourcingLocations[i].producerId = supplier[i].id;
    }
    if (supplierType === SUPPLIER_TYPES.T1SUPPLIER) {
      existingSourcingLocations[i].t1SupplierId = supplier[i].id;
    }
    await existingSourcingLocations[i].save();
  }
  return existingSourcingLocations;
};
