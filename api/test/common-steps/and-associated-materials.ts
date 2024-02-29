import { Material } from 'modules/materials/material.entity';
import { SourcingLocation } from '../../src/modules/sourcing-locations/sourcing-location.entity';

/**
 * @description Associate materials with sourcing locations for tests
 */

export const AndAssociatedMaterials = async (
  materials: Material[],
  existingSourcingLocations: SourcingLocation[],
): Promise<SourcingLocation[]> => {
  const limitLength = Math.min(
    materials.length,
    existingSourcingLocations.length,
  );
  for (let i = 0; i < limitLength; i++) {
    existingSourcingLocations[i].materialId = materials[i].id;
    await existingSourcingLocations[i].save();
  }
  return existingSourcingLocations;
};
