import { ScenariosImpactTable } from 'modules/impact/dto/response-comparison-table.dto';

export function getGroupedBySupplierScenariosComparison(
  scenarioIdOne: string,
  scenarioIdTwo: string,
  indicatorId: string,
): any {
  return {
    scenariosImpactTable: [
      {
        indicatorShortName: null,
        indicatorId: indicatorId,
        groupBy: 'supplier',
        rows: [
          {
            name: 'Supplier A Oils',
            children: [],
            values: [
              {
                year: 2020,
                scenariosImpacts: [
                  {
                    scenarioId: scenarioIdTwo,
                    newImpact: 1500,
                    canceledImpact: 2000,
                    impactResult: -500,
                  },
                  {
                    scenarioId: scenarioIdOne,
                    newImpact: 0,
                    canceledImpact: 2000,
                    impactResult: -2000,
                  },
                ],
                isProjected: false,
              },
              {
                year: 2021,
                scenariosImpacts: [
                  {
                    scenarioId: scenarioIdTwo,
                    newImpact: 1522.5,
                    canceledImpact: 2030,
                    impactResult: -507.5,
                  },
                  {
                    scenarioId: scenarioIdOne,
                    newImpact: 0,
                    canceledImpact: 2030,
                    impactResult: -2030,
                  },
                ],
                isProjected: true,
              },
            ],
          },
          {
            name: 'Supplier A Textile',
            children: [],
            values: [
              {
                year: 2020,
                scenariosImpacts: [
                  {
                    scenarioId: scenarioIdTwo,
                    newImpact: 1500,
                    canceledImpact: 2200,
                    impactResult: -700,
                  },
                  {
                    scenarioId: scenarioIdOne,
                    newImpact: 600,
                    canceledImpact: 2200,
                    impactResult: -1600,
                  },
                ],
                isProjected: false,
              },
              {
                year: 2021,
                scenariosImpacts: [
                  {
                    scenarioId: scenarioIdTwo,
                    newImpact: 1522.5,
                    canceledImpact: 2233,
                    impactResult: -710.5,
                  },
                  {
                    scenarioId: scenarioIdOne,
                    newImpact: 609,
                    canceledImpact: 2233,
                    impactResult: -1624,
                  },
                ],
                isProjected: true,
              },
            ],
          },
          {
            name: 'Supplier B Oils',
            children: [],
            values: [
              {
                year: 2020,
                scenariosImpacts: [
                  {
                    scenarioId: scenarioIdOne,
                    newImpact: 2500,
                    canceledImpact: 0,
                    impactResult: 2500,
                  },
                ],
                isProjected: false,
              },
              {
                year: 2021,
                scenariosImpacts: [
                  {
                    scenarioId: scenarioIdOne,
                    newImpact: 2537.5,
                    canceledImpact: 0,
                    impactResult: 2537.5,
                  },
                ],
                isProjected: true,
              },
            ],
          },
          {
            name: 'Supplier B Textile',
            children: [],
            values: [
              {
                year: 2020,
                scenariosImpacts: [
                  {
                    scenarioId: scenarioIdOne,
                    newImpact: 1100,
                    canceledImpact: 0,
                    impactResult: 1100,
                  },
                ],
                isProjected: false,
              },
              {
                year: 2021,
                scenariosImpacts: [
                  {
                    scenarioId: scenarioIdOne,
                    newImpact: 1116.5,
                    canceledImpact: 0,
                    impactResult: 1116.5,
                  },
                ],
                isProjected: true,
              },
            ],
          },
        ],
        yearSum: [
          {
            year: 2020,
            values: [
              {
                scenarioId: scenarioIdTwo,
                newImpact: 3000,
                canceledImpact: 4200,
                impactResult: -1200,
              },
              {
                scenarioId: scenarioIdOne,
                newImpact: 4200,
                canceledImpact: 4200,
                impactResult: 0,
              },
            ],
          },
          {
            year: 2021,
            values: [
              {
                scenarioId: scenarioIdTwo,
                newImpact: 3045,
                canceledImpact: 4263,
                impactResult: -1218,
              },
              {
                scenarioId: scenarioIdOne,
                newImpact: 4263,
                canceledImpact: 4263,
                impactResult: 0,
              },
            ],
          },
        ],
        metadata: {
          unit: 'm3/year',
        },
      },
    ],

    purchasedTonnes: [
      {
        year: 2020,
        values: [
          {
            scenarioId: scenarioIdTwo,
            newTonnage: 2005.12,
            canceledTonnage: 3007.68,
            tonnageDifference: -1002.56,
          },
          {
            scenarioId: scenarioIdOne,
            newTonnage: 4010.24,
            canceledTonnage: 3007.68,
            tonnageDifference: 1002.56,
          },
        ],
        isProjected: false,
      },
      {
        year: 2021,
        values: [
          {
            scenarioId: scenarioIdTwo,
            newTonnage: 2035.1968,
            canceledTonnage: 3052.7952,
            tonnageDifference: -1017.5984000000001,
          },
          {
            scenarioId: scenarioIdOne,
            newTonnage: 4070.3936,
            canceledTonnage: 3052.7952,
            tonnageDifference: 1017.5983999999999,
          },
        ],
        isProjected: true,
      },
    ],
  };
}
