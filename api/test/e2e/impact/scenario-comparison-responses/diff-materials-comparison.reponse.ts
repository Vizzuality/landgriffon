import { ScenariosImpactTable } from 'modules/impact/dto/response-comparison-table.dto';

export function getDiffMaterialsScenariosComparison(
  scenarioIdOne: string,
  scenarioIdTwo: string,
  indicatorId: string,
): any {
  return {
    scenariosImpactTable: [
      {
        indicatorShortName: 'Deforestation',
        indicatorId: indicatorId,
        groupBy: 'material',
        rows: [
          {
            name: 'Textile',
            children: [
              {
                name: 'Cotton',
                children: [],
                values: [
                  {
                    year: 2020,
                    scenariosImpacts: [
                      {
                        scenarioId: scenarioIdTwo,
                        newImpact: 0,
                        canceledImpact: 1200,
                        impactResult: -1200,
                      },
                      {
                        scenarioId: scenarioIdOne,
                        newImpact: 900,
                        canceledImpact: 1200,
                        impactResult: -300,
                      },
                    ],
                    isProjected: false,
                  },
                  {
                    year: 2021,
                    scenariosImpacts: [
                      {
                        scenarioId: scenarioIdTwo,
                        newImpact: 0,
                        canceledImpact: 1218,
                        impactResult: -1218,
                      },
                      {
                        scenarioId: scenarioIdOne,
                        newImpact: 913.5,
                        canceledImpact: 1218,
                        impactResult: -304.5,
                      },
                    ],
                    isProjected: true,
                  },
                ],
              },
              {
                name: 'Linen',
                children: [],
                values: [
                  {
                    year: 2020,
                    scenariosImpacts: [
                      {
                        scenarioId: scenarioIdTwo,
                        newImpact: 1800,
                        canceledImpact: 0,
                        impactResult: 1800,
                      },
                    ],
                    isProjected: false,
                  },
                  {
                    year: 2021,
                    scenariosImpacts: [
                      {
                        scenarioId: scenarioIdTwo,
                        newImpact: 1827,
                        canceledImpact: 0,
                        impactResult: 1827,
                      },
                    ],
                    isProjected: true,
                  },
                ],
              },
              {
                name: 'Wool',
                children: [],
                values: [
                  {
                    year: 2020,
                    scenariosImpacts: [
                      {
                        scenarioId: scenarioIdTwo,
                        newImpact: 0,
                        canceledImpact: 1200,
                        impactResult: -1200,
                      },
                      {
                        scenarioId: scenarioIdOne,
                        newImpact: 1000,
                        canceledImpact: 1200,
                        impactResult: -200,
                      },
                    ],
                    isProjected: false,
                  },
                  {
                    year: 2021,
                    scenariosImpacts: [
                      {
                        scenarioId: scenarioIdTwo,
                        newImpact: 0,
                        canceledImpact: 1218,
                        impactResult: -1218,
                      },
                      {
                        scenarioId: scenarioIdOne,
                        newImpact: 1015,
                        canceledImpact: 1218,
                        impactResult: -203,
                      },
                    ],
                    isProjected: true,
                  },
                ],
              },
            ],
            values: [
              {
                year: 2020,
                scenariosImpacts: [
                  {
                    scenarioId: scenarioIdTwo,
                    newImpact: 1800,
                    canceledImpact: 2400,
                    impactResult: -600,
                  },
                  {
                    scenarioId: scenarioIdOne,
                    newImpact: 1900,
                    canceledImpact: 2400,
                    impactResult: -500,
                  },
                ],
                isProjected: false,
              },
              {
                year: 2021,
                scenariosImpacts: [
                  {
                    scenarioId: scenarioIdTwo,
                    newImpact: 1827,
                    canceledImpact: 2436,
                    impactResult: -609,
                  },
                  {
                    scenarioId: scenarioIdOne,
                    newImpact: 1928.5,
                    canceledImpact: 2436,
                    impactResult: -507.5,
                  },
                ],
                isProjected: true,
              },
            ],
          },
        ],
        yearSum: [],
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
            newTonnage: 1002.56,
            canceledTonnage: 2005.12,
            tonnageDifference: -1002.56,
          },
          {
            scenarioId: scenarioIdOne,
            newTonnage: 2005.12,
            canceledTonnage: 2005.12,
            tonnageDifference: 0,
          },
        ],
        isProjected: false,
      },
      {
        year: 2021,
        values: [
          {
            scenarioId: scenarioIdTwo,
            newTonnage: 1017.5984,
            canceledTonnage: 2035.1968,
            tonnageDifference: -1017.5984,
          },
          {
            scenarioId: scenarioIdOne,
            newTonnage: 2035.1968,
            canceledTonnage: 2035.1968,
            tonnageDifference: 0,
          },
        ],
        isProjected: true,
      },
    ],
  };
}
