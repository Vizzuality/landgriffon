import { ScenariosImpactTable } from 'modules/impact/dto/response-comparison-table.dto';

export function getDiffMaterialsScenariosComparison(
  scenarioIdOne: string,
  scenarioIdTwo: string,
  indicatorId: string,
): ScenariosImpactTable {
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
                        scenarioId: scenarioIdOne,
                        impact: 900,
                      },
                    ],
                    isProjected: false,
                  },
                  {
                    year: 2021,
                    scenariosImpacts: [
                      {
                        scenarioId: scenarioIdOne,
                        impact: 913.5,
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
                        impact: 1800,
                      },
                    ],
                    isProjected: false,
                  },
                  {
                    year: 2021,
                    scenariosImpacts: [
                      {
                        scenarioId: scenarioIdTwo,
                        impact: 1827,
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
                        scenarioId: scenarioIdOne,
                        impact: 1000,
                      },
                    ],
                    isProjected: false,
                  },
                  {
                    year: 2021,
                    scenariosImpacts: [
                      {
                        scenarioId: scenarioIdOne,
                        impact: 1015,
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
                    scenarioId: scenarioIdOne,
                    impact: 1900,
                  },
                  {
                    scenarioId: scenarioIdTwo,
                    impact: 1800,
                  },
                ],
                isProjected: false,
              },
              {
                year: 2021,
                scenariosImpacts: [
                  {
                    scenarioId: scenarioIdOne,
                    impact: 1928.5,
                  },
                  {
                    scenarioId: scenarioIdTwo,
                    impact: 1827,
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
            scenarioId: scenarioIdOne,
            tonnage: 2005.12,
          },
          {
            scenarioId: scenarioIdTwo,
            tonnage: 1002.56,
          },
        ],
        isProjected: false,
      },
      {
        year: 2021,
        values: [
          {
            scenarioId: scenarioIdOne,
            tonnage: 2035.1968,
          },
          {
            scenarioId: scenarioIdTwo,
            tonnage: 1017.5984,
          },
        ],
        isProjected: true,
      },
    ],
  };
}
