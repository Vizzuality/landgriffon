import {
  createAdminRegion,
  createBusinessUnit,
  createIndicator,
  createIndicatorRecord,
  createMaterial,
  createSourcingLocation,
  createSourcingRecord,
  createSupplier,
  createUnit,
} from '../../../entity-mocks';
import {
  Indicator,
  INDICATOR_NAME_CODES,
} from '../../../../src/modules/indicators/indicator.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { TestApplication } from '../../../utils/application-manager';
import * as request from 'supertest';
import { GROUP_BY_VALUES } from '../../../../src/modules/impact/dto/impact-table.dto';
import { range } from 'lodash';
import { Material } from '../../../../src/modules/materials/material.entity';
import { Scenario } from 'modules/scenarios/scenario.entity';
import { createNewCoefficientsInterventionPreconditions } from '../mocks/actual-vs-scenario-preconditions/new-coefficients-intervention.preconditions';
import { ScenarioIntervention } from '../../../../src/modules/scenario-interventions/scenario-intervention.entity';

export const impactReportFixtures = () => ({
  GivenSourcingLocationWithImpact: async () => {
    const parentMaterial = await createMaterial({
      name: 'CSV Parent Material',
    });
    const childMaterial = await createMaterial({
      parentId: parentMaterial.id,
      name: 'CSV Child Material',
    });
    const supplier = await createSupplier();
    const businessUnit = await createBusinessUnit();
    const adminRegion = await createAdminRegion();
    const sourcingLocationParentMaterial = await createSourcingLocation({
      materialId: parentMaterial.id,
      producerId: supplier.id,
      businessUnitId: businessUnit.id,
      adminRegionId: adminRegion.id,
    });

    const sourcingLocationChildMaterial = await createSourcingLocation({
      materialId: childMaterial.id,
      producerId: supplier.id,
      businessUnitId: businessUnit.id,
      adminRegionId: adminRegion.id,
    });
    const unit = await createUnit();
    const indicators: Indicator[] = [];
    for (const indicator of Object.values(INDICATOR_NAME_CODES)) {
      indicators.push(
        await createIndicator({
          nameCode: indicator,
          name: indicator,
          unit,
          shortName: indicator,
        }),
      );
    }
    const sourcingRecords: SourcingRecord[] = [];
    for (const year of [2018, 2019, 2020, 2021, 2022, 2023]) {
      sourcingRecords.push(
        await createSourcingRecord({
          sourcingLocationId: sourcingLocationParentMaterial.id,
          year,
          tonnage: 100 * year,
        }),
      );
      sourcingRecords.push(
        await createSourcingRecord({
          sourcingLocationId: sourcingLocationChildMaterial.id,
          year,
          tonnage: 100 * year,
        }),
      );
    }
    for (const sourcingRecord of sourcingRecords) {
      for (const indicator of indicators) {
        await createIndicatorRecord({
          sourcingRecordId: sourcingRecord.id,
          indicatorId: indicator.id,
          value: sourcingRecord.tonnage * 2,
        });
      }
    }
    return {
      materials: [parentMaterial, childMaterial],
      indicators,
      sourcingRecords,
    };
  },
  GivenAScenarioIntervention: async (
    customScenario?: Scenario,
  ): Promise<{
    indicator: Indicator;
    scenarioIntervention: ScenarioIntervention;
  }> => {
    const { indicator, scenarioIntervention } =
      await createNewCoefficientsInterventionPreconditions(customScenario);
    return {
      indicator,
      scenarioIntervention,
    };
  },

  WhenIRequestAnImpactReport: (options: {
    app: TestApplication;
    jwtToken: string;
    indicatorIds: string[];
  }): Promise<request.Response> => {
    return request(options.app.getHttpServer())
      .get('/api/v1/impact/table/report')
      .set('Authorization', `Bearer ${options.jwtToken}`)
      .query({
        'indicatorIds[]': [...options.indicatorIds],
        startYear: 2010,
        endYear: 2027,
        groupBy: 'material',
      });
  },
  WhenIRequestAnActualVsScenarioImpactReport: (options: {
    app: TestApplication;
    jwtToken: string;
    indicatorIds: string[];
    comparedScenarioId: string;
  }): Promise<request.Response> => {
    return request(options.app.getHttpServer())
      .get('/api/v1/impact/compare/scenario/vs/actual/report')
      .set('Authorization', `Bearer ${options.jwtToken}`)
      .query({
        'indicatorIds[]': [...options.indicatorIds],
        startYear: 2010,
        endYear: 2027,
        groupBy: 'material',
        comparedScenarioId: options.comparedScenarioId,
      });
  },

  ThenIShouldGetAnImpactReportAboutProvidedFilters: (
    response: request.Response,
    filters?: {
      groupBy?: GROUP_BY_VALUES;
      indicators?: Indicator[];
      materials?: Material[];
      isActualVsScenario?: boolean;
      isScenarioVsScenario?: boolean;
    },
  ) => {
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/csv');
    expect(response.headers['content-disposition']).toContain(
      'filename=impact_report.csv',
    );
    expect(response.text).toContain('Indicator');
    expect(response.text).toContain(
      `Group by ${filters?.groupBy ?? GROUP_BY_VALUES.MATERIAL}`,
    );
    if (filters?.materials?.length) {
      for (const material of filters?.materials ?? []) {
        expect(response.text).toContain(material.name);
      }
    }
    if (filters?.isActualVsScenario) {
      expect(response.text).toContain('Compared Scenario');
      expect(response.text).toContain('Absolute Difference');
      expect(response.text).toContain('Percentage Difference');
    }
    if (filters?.isScenarioVsScenario) {
      expect(response.text).toContain('Base Scenario');
      expect(response.text).toContain('Compared Scenario');
      expect(response.text).toContain('Absolute Difference');
      expect(response.text).toContain('Percentage Difference');
    }
    for (const year of range(2010, 2027)) {
      expect(response.text).toContain(year.toString());
    }
    for (const indicatorShortName of filters?.indicators?.map(
      (indicator: Indicator) => indicator.shortName,
    ) ?? Object.values(INDICATOR_NAME_CODES)) {
      expect(response.text).toContain(indicatorShortName);
    }
  },
});
