export function getMultiInterventionsScenariosComparison(
  scenarioIdOne: string,
  scenarioIdTwo: string,
  indicatorId: string,
): any {
  return {
    scenariosImpactTable: [
      {
        indicatorShortName: null,
        indicatorId: indicatorId,
        groupBy: 'material',
        rows: [
          {
            name: 'Oils',
            children: [
              {
                name: 'Olive Oil',
                children: [],
                values: [
                  {
                    year: 2020,
                    scenariosImpacts: [
                      {
                        scenarioId: scenarioIdTwo,
                        newImpact: 1500,
                        canceledImpact: 0,
                        impactResult: 1500,
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
                        canceledImpact: 0,
                        impactResult: 1522.5,
                      },
                    ],
                    isProjected: true,
                  },
                ],
              },
              {
                name: 'Palm Oil',
                children: [],
                values: [
                  {
                    year: 2020,
                    scenariosImpacts: [
                      {
                        scenarioId: scenarioIdTwo,
                        newImpact: 0,
                        canceledImpact: 2000,
                        impactResult: -2000,
                      },
                      {
                        scenarioId: scenarioIdOne,
                        newImpact: 2500,
                        canceledImpact: 2000,
                        impactResult: 500,
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
                        canceledImpact: 2030,
                        impactResult: -2030,
                      },
                      {
                        scenarioId: scenarioIdOne,
                        newImpact: 2537.5,
                        canceledImpact: 2030,
                        impactResult: 507.5,
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
                    newImpact: 1500,
                    canceledImpact: 2000,
                    impactResult: -500,
                  },
                  {
                    scenarioId: scenarioIdOne,
                    newImpact: 2500,
                    canceledImpact: 2000,
                    impactResult: 500,
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
                    newImpact: 2537.5,
                    canceledImpact: 2030,
                    impactResult: 507.5,
                  },
                ],
                isProjected: true,
              },
            ],
          },
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
                        canceledImpact: 1000,
                        impactResult: -1000,
                      },
                      {
                        scenarioId: scenarioIdOne,
                        newImpact: 500,
                        canceledImpact: 1000,
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
                        newImpact: 0,
                        canceledImpact: 1015,
                        impactResult: -1015,
                      },
                      {
                        scenarioId: scenarioIdOne,
                        newImpact: 507.5,
                        canceledImpact: 1015,
                        impactResult: -507.5,
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
                        newImpact: 1500,
                        canceledImpact: 0,
                        impactResult: 1500,
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
                        canceledImpact: 0,
                        impactResult: 1522.5,
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
                        newImpact: 1200,
                        canceledImpact: 1200,
                        impactResult: 0,
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
                        newImpact: 1218,
                        canceledImpact: 1218,
                        impactResult: 0,
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
                    newImpact: 1500,
                    canceledImpact: 2200,
                    impactResult: -700,
                  },
                  {
                    scenarioId: scenarioIdOne,
                    newImpact: 1700,
                    canceledImpact: 2200,
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
                    newImpact: 1522.5,
                    canceledImpact: 2233,
                    impactResult: -710.5,
                  },
                  {
                    scenarioId: scenarioIdOne,
                    newImpact: 1725.5,
                    canceledImpact: 2233,
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
