import { SUPPLIER_TYPES } from 'modules/suppliers/supplier.entity';

/**
 * @description: Utility function to convert a string to a SUPPLIER_TYPES enum
 */
export function convertToSupplierType(supplierType: string): SUPPLIER_TYPES {
  switch (supplierType.toLowerCase()) {
    case 'tier 1 supplier':
      return SUPPLIER_TYPES.T1SUPPLIER;
    case 'producer':
      return SUPPLIER_TYPES.PRODUCER;
    default:
      throw new Error(
        `Invalid supplier type: ${supplierType}. Available types are: Tier 1 Supplier, Producer`,
      );
  }
}
