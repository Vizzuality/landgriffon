import { EntityRepository, Repository } from 'typeorm';
import { ScenarioIntervention } from 'modules/scenario-interventions/scenario-intervention.entity';

@EntityRepository(ScenarioIntervention)
export class ScenarioInterventionRepository extends Repository<ScenarioIntervention> {
  async getScenarioInterventionsByScenarioId(
    scenarioId: string,
  ): Promise<ScenarioIntervention[]> {
    // TODO: Join with suppliers and selecting supplier field commented out due to performance issues
    //       This needs to be restored
    return (
      this.createQueryBuilder('intervention')
        .select([
          'intervention.id',
          'intervention.title',
          'intervention.description',
          'intervention.type',
          'intervention.startYear',
          'intervention.status',
          'intervention.endYear',
          'intervention.percentage',
          'replacedAdminRegions.id',
          'replacedAdminRegions.name',
          'newAdminRegion.id',
          'newAdminRegion.name',
          'replacedMaterials.id',
          'replacedMaterials.name',
          'newMaterial.id',
          'newMaterial.name',
          'replacedBusinessUnits.id',
          'replacedBusinessUnits.name',
          'newBusinessUnit.id',
          'newBusinessUnit.name',
          // 'replacedSuppliers.id',
          // 'replacedSuppliers.name',
        ])
        .leftJoin('intervention.replacedAdminRegions', 'replacedAdminRegions')
        .leftJoin('intervention.newAdminRegion', 'newAdminRegion')
        .leftJoin('intervention.replacedMaterials', 'replacedMaterials')
        .leftJoin('intervention.newMaterial', 'newMaterial')
        .leftJoin('intervention.replacedBusinessUnits', 'replacedBusinessUnits')
        .leftJoin('intervention.newBusinessUnit', 'newBusinessUnit')
        // .leftJoin('intervention.replacedSuppliers', 'replacedSuppliers')

        .where('intervention.scenarioId = :scenarioId', { scenarioId })
        .getMany()
    );
  }
}
