import {
  ScenariosImpactTable,
  ScenariosImpactTableRows,
} from 'modules/impact/dto/response-comparison-table.dto';

export function getDiffMaterialsScenariosComparison(
  scenarioIdOne: string,
  scebnarioIdTwo: string,
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
                        scenarioId: scebnarioIdTwo,
                        impact: 1800,
                      },
                    ],
                    isProjected: false,
                  },
                  {
                    year: 2021,
                    scenariosImpacts: [
                      {
                        scenarioId: scebnarioIdTwo,
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
                    scenarioId: scebnarioIdTwo,
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
                    scenarioId: scebnarioIdTwo,
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
  };
}
