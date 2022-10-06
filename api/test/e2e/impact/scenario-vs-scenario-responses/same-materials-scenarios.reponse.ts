export function getSameMaterialScenarioComparisonResponse(
  indicatorId: string,
): any {
  return {
    scenarioVsScenarioImpactTable: [
      {
        indicatorShortName: null,
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
                    scenarioOneValue: 900,
                    scenarioTwoValue: 0,
                    isProjected: false,
                    absoluteDifference: 900,
                    percentageDifference: 200,
                  },
                  {
                    year: 2021,
                    scenarioOneValue: 913.5,
                    scenarioTwoValue: 0,
                    isProjected: true,
                    absoluteDifference: 913.5,
                    percentageDifference: 200,
                  },
                ],
              },
              {
                name: 'Linen',
                children: [],
                values: [
                  {
                    year: 2020,
                    scenarioOneValue: 0,
                    scenarioTwoValue: 1500,
                    isProjected: false,
                    absoluteDifference: -1500,
                    percentageDifference: -200,
                  },
                  {
                    year: 2021,
                    scenarioOneValue: 0,
                    scenarioTwoValue: 1522.5,
                    isProjected: true,
                    absoluteDifference: -1522.5,
                    percentageDifference: -200,
                  },
                ],
              },
              {
                name: 'Wool',
                children: [],
                values: [
                  {
                    year: 2020,
                    scenarioOneValue: 1100,
                    scenarioTwoValue: 0,
                    isProjected: false,
                    absoluteDifference: 1100,
                    percentageDifference: 200,
                  },
                  {
                    year: 2021,
                    scenarioOneValue: 1116.5,
                    scenarioTwoValue: 0,
                    isProjected: true,
                    absoluteDifference: 1116.5,
                    percentageDifference: 200,
                  },
                ],
              },
            ],
            values: [
              {
                year: 2020,
                scenarioOneValue: 2000,
                scenarioTwoValue: 1500,
                isProjected: false,
                absoluteDifference: 500,
                percentageDifference: 28.57142857142857,
              },
              {
                year: 2021,
                scenarioOneValue: 2030,
                scenarioTwoValue: 1522.5,
                isProjected: true,
                absoluteDifference: 507.5,
                percentageDifference: 28.57142857142857,
              },
            ],
          },
        ],
        yearSum: [
          {
            year: 2020,
            scenarioOneValue: 2000,
            scenarioTwoValue: 1500,
            absoluteDifference: 500,
            percentageDifference: 200,
            isProjected: false,
          },
          {
            year: 2021,
            scenarioOneValue: 2030,
            scenarioTwoValue: 1522.5,
            absoluteDifference: 507.5,
            percentageDifference: 200,
            isProjected: true,
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
        value: 1100,
        isProjected: false,
      },
      {
        year: 2021,
        value: 1116.5,
        isProjected: true,
      },
    ],
  };
}

export function getScenarioComparisonResponseBySupplier(
  indicatorId: string,
): any {
  return {
    scenarioVsScenarioImpactTable: [
      {
        indicatorShortName: null,
        indicatorId: indicatorId,
        groupBy: 'supplier',
        rows: [
          {
            name: 'Supplier A Textile',
            children: [],
            values: [
              {
                year: 2020,
                scenarioOneValue: 1100,
                scenarioTwoValue: 0,
                isProjected: false,
                absoluteDifference: 1100,
                percentageDifference: 200,
              },
              {
                year: 2021,
                scenarioOneValue: 1116.5,
                scenarioTwoValue: 0,
                isProjected: true,
                absoluteDifference: 1116.5,
                percentageDifference: 200,
              },
            ],
          },
          {
            name: 'Supplier B Textile',
            children: [],
            values: [
              {
                year: 2020,
                scenarioOneValue: 900,
                scenarioTwoValue: 0,
                isProjected: false,
                absoluteDifference: 900,
                percentageDifference: 200,
              },
              {
                year: 2021,
                scenarioOneValue: 913.5,
                scenarioTwoValue: 0,
                isProjected: true,
                absoluteDifference: 913.5,
                percentageDifference: 200,
              },
            ],
          },
        ],
        yearSum: [
          {
            year: 2020,
            scenarioOneValue: 2000,
            scenarioTwoValue: 0,
            absoluteDifference: 2000,
            percentageDifference: 200,
          },
          {
            year: 2021,
            scenarioOneValue: 2030,
            scenarioTwoValue: 0,
            absoluteDifference: 2030,
            percentageDifference: 200,
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
        value: 1200,
        isProjected: false,
      },
      {
        year: 2021,
        value: 1218,
        isProjected: true,
      },
    ],
  };
}
