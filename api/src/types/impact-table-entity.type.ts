import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { Material } from 'modules/materials/material.entity';

export type ImpactTableEntityType =
  | BusinessUnit
  | AdminRegion
  | Supplier
  | Material;
