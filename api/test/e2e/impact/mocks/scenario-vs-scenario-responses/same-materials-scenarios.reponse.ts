export function getSameMaterialScenarioComparisonResponse(
  indicatorId: string,
): any {
  return {
    impactTable: [
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
                    baseScenarioValue: 900,
                    comparedScenarioValue: 0,
                    isProjected: false,
                    absoluteDifference: -900,
                    percentageDifference: -200,
                  },
                  {
                    year: 2021,
                    baseScenarioValue: 913.5,
                    comparedScenarioValue: 0,
                    isProjected: true,
                    absoluteDifference: -913.5,
                    percentageDifference: -200,
                  },
                ],
              },
              {
                name: 'Linen',
                children: [],
                values: [
                  {
                    year: 2020,
                    baseScenarioValue: 0,
                    comparedScenarioValue: 1500,
                    isProjected: false,
                    absoluteDifference: 1500,
                    percentageDifference: 200,
                  },
                  {
                    year: 2021,
                    baseScenarioValue: 0,
                    comparedScenarioValue: 1522.5,
                    isProjected: true,
                    absoluteDifference: 1522.5,
                    percentageDifference: 200,
                  },
                ],
              },
              {
                name: 'Wool',
                children: [],
                values: [
                  {
                    year: 2020,
                    baseScenarioValue: 1100,
                    comparedScenarioValue: 0,
                    isProjected: false,
                    absoluteDifference: -1100,
                    percentageDifference: -200,
                  },
                  {
                    year: 2021,
                    baseScenarioValue: 1116.5,
                    comparedScenarioValue: 0,
                    isProjected: true,
                    absoluteDifference: -1116.5,
                    percentageDifference: -200,
                  },
                ],
              },
            ],
            values: [
              {
                year: 2020,
                baseScenarioValue: 2000,
                comparedScenarioValue: 1500,
                isProjected: false,
                absoluteDifference: -500,
                percentageDifference: -28.57142857142857,
              },
              {
                year: 2021,
                baseScenarioValue: 2030,
                comparedScenarioValue: 1522.5,
                isProjected: true,
                absoluteDifference: -507.5,
                percentageDifference: -28.57142857142857,
              },
            ],
          },
        ],
        yearSum: [
          {
            year: 2020,
            baseScenarioValue: 2000,
            comparedScenarioValue: 1500,
            absoluteDifference: -500,
            percentageDifference: -28.57142857142857,
            isProjected: false,
          },
          {
            year: 2021,
            baseScenarioValue: 2030,
            comparedScenarioValue: 1522.5,
            absoluteDifference: -507.5,
            percentageDifference: -28.57142857142857,
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
    impactTable: [
      {
        indicatorShortName: null,
        indicatorId: indicatorId,
        groupBy: 'supplier',
        rows: [
          {
            children: [],
            name: 'Supplier A Textile',
            values: [
              {
                absoluteDifference: 400,
                baseScenarioValue: 1100,
                comparedScenarioValue: 1500,
                isProjected: false,
                percentageDifference: 30.76923076923077,
                year: 2020,
              },
              {
                absoluteDifference: 406,
                baseScenarioValue: 1116.5,
                comparedScenarioValue: 1522.5,
                isProjected: true,
                percentageDifference: 30.76923076923077,
                year: 2021,
              },
            ],
          },
          {
            children: [],
            name: 'Supplier B Textile',
            values: [
              {
                absoluteDifference: -900,
                baseScenarioValue: 900,
                comparedScenarioValue: 0,
                isProjected: false,
                percentageDifference: -200,
                year: 2020,
              },
              {
                absoluteDifference: -913.5,
                baseScenarioValue: 913.5,
                comparedScenarioValue: 0,
                isProjected: true,
                percentageDifference: -200,
                year: 2021,
              },
            ],
          },
        ],
        yearSum: [
          {
            year: 2020,
            baseScenarioValue: 2000,
            comparedScenarioValue: 0,
            absoluteDifference: -2000,
            percentageDifference: -200,
          },
          {
            year: 2021,
            baseScenarioValue: 2030,
            comparedScenarioValue: 0,
            absoluteDifference: -2030,
            percentageDifference: -200,
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

export function getComparisonResponseWithProjectedYears(
  indicatorId: string,
): any {
  return {
    impactTable: [
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
                    year: 2018,
                    baseScenarioValue: 0,
                    comparedScenarioValue: 0,
                    isProjected: false,
                    absoluteDifference: 0,
                    percentageDifference: 0,
                  },
                  {
                    year: 2019,
                    baseScenarioValue: 0,
                    comparedScenarioValue: 0,
                    isProjected: false,
                    absoluteDifference: 0,
                    percentageDifference: 0,
                  },
                  {
                    year: 2020,
                    baseScenarioValue: 900,
                    comparedScenarioValue: 0,
                    isProjected: false,
                    absoluteDifference: -900,
                    percentageDifference: -200,
                  },
                  {
                    year: 2021,
                    baseScenarioValue: 913.5,
                    comparedScenarioValue: 0,
                    isProjected: true,
                    absoluteDifference: -913.5,
                    percentageDifference: -200,
                  },
                  {
                    year: 2022,
                    baseScenarioValue: 927.2025,
                    comparedScenarioValue: 0,
                    isProjected: true,
                    absoluteDifference: -927.2025,
                    percentageDifference: -200,
                  },
                ],
              },
              {
                name: 'Linen',
                children: [],
                values: [
                  {
                    year: 2018,
                    baseScenarioValue: 0,
                    comparedScenarioValue: 0,
                    isProjected: false,
                    absoluteDifference: 0,
                    percentageDifference: 0,
                  },
                  {
                    year: 2019,
                    baseScenarioValue: 0,
                    comparedScenarioValue: 0,
                    isProjected: false,
                    absoluteDifference: 0,
                    percentageDifference: 0,
                  },
                  {
                    year: 2020,
                    baseScenarioValue: 0,
                    comparedScenarioValue: 1500,
                    isProjected: false,
                    absoluteDifference: 1500,
                    percentageDifference: 200,
                  },
                  {
                    year: 2021,
                    baseScenarioValue: 0,
                    comparedScenarioValue: 1522.5,
                    isProjected: true,
                    absoluteDifference: 1522.5,
                    percentageDifference: 200,
                  },
                  {
                    year: 2022,
                    baseScenarioValue: 0,
                    comparedScenarioValue: 1545.3375,
                    isProjected: true,
                    absoluteDifference: 1545.3375,
                    percentageDifference: 200,
                  },
                ],
              },
              {
                name: 'Wool',
                children: [],
                values: [
                  {
                    year: 2018,
                    baseScenarioValue: 0,
                    comparedScenarioValue: 0,
                    isProjected: false,
                    absoluteDifference: 0,
                    percentageDifference: 0,
                  },
                  {
                    year: 2019,
                    baseScenarioValue: 0,
                    comparedScenarioValue: 0,
                    isProjected: false,
                    absoluteDifference: 0,
                    percentageDifference: 0,
                  },
                  {
                    year: 2020,
                    baseScenarioValue: 1100,
                    comparedScenarioValue: 0,
                    isProjected: false,
                    absoluteDifference: -1100,
                    percentageDifference: -200,
                  },
                  {
                    year: 2021,
                    baseScenarioValue: 1116.5,
                    comparedScenarioValue: 0,
                    isProjected: true,
                    absoluteDifference: -1116.5,
                    percentageDifference: -200,
                  },
                  {
                    year: 2022,
                    baseScenarioValue: 1133.2475,
                    comparedScenarioValue: 0,
                    isProjected: true,
                    absoluteDifference: -1133.2475,
                    percentageDifference: -200,
                  },
                ],
              },
            ],
            values: [
              {
                year: 2018,
                baseScenarioValue: 0,
                comparedScenarioValue: 0,
                isProjected: false,
                absoluteDifference: 0,
                percentageDifference: 0,
              },
              {
                year: 2019,
                baseScenarioValue: 0,
                comparedScenarioValue: 0,
                isProjected: false,
                absoluteDifference: 0,
                percentageDifference: 0,
              },
              {
                year: 2020,
                baseScenarioValue: 2000,
                comparedScenarioValue: 1500,
                isProjected: false,
                absoluteDifference: -500,
                percentageDifference: -28.57142857142857,
              },
              {
                year: 2021,
                baseScenarioValue: 2030,
                comparedScenarioValue: 1522.5,
                isProjected: true,
                absoluteDifference: -507.5,
                percentageDifference: -28.57142857142857,
              },
              {
                year: 2022,
                baseScenarioValue: 2060.45,
                comparedScenarioValue: 1545.3375,
                isProjected: true,
                absoluteDifference: -515.1124999999997,
                percentageDifference: -28.57142857142856,
              },
            ],
          },
        ],
        yearSum: [
          {
            year: 2018,
            baseScenarioValue: 0,
            comparedScenarioValue: 0,
            absoluteDifference: 0,
            percentageDifference: 0,
            isProjected: false,
          },
          {
            year: 2019,
            baseScenarioValue: 0,
            comparedScenarioValue: 0,
            absoluteDifference: 0,
            percentageDifference: 0,
            isProjected: false,
          },
          {
            year: 2020,
            baseScenarioValue: 2000,
            comparedScenarioValue: 1500,
            absoluteDifference: -500,
            percentageDifference: -28.57142857142857,
            isProjected: false,
          },
          {
            year: 2021,
            baseScenarioValue: 2030,
            comparedScenarioValue: 1522.5,
            absoluteDifference: -507.5,
            percentageDifference: -28.57142857142857,
            isProjected: true,
          },
          {
            year: 2022,
            baseScenarioValue: 2060.45,
            comparedScenarioValue: 1545.3375,
            absoluteDifference: -515.1124999999997,
            percentageDifference: -28.57142857142856,
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
        year: 2018,
        value: 0,
        isProjected: false,
      },
      {
        year: 2019,
        value: 0,
        isProjected: false,
      },
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
      {
        year: 2022,
        value: 1133.2475,
        isProjected: true,
      },
    ],
  };
}
