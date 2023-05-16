import { ObjectLiteral } from 'typeorm';

export const getNewCoefficientsScenarioInterventionResponse = (
  entityIds: ObjectLiteral,
) => {
  return {
    impactTable: [
      {
        indicatorShortName: null,
        indicatorId: 'a91dedf8-0379-49aa-b593-9d438d6f5cd3',
        groupBy: 'material',
        rows: [
          {
            id: entityIds['Rubber'],
            name: 'Rubber',
            children: [],
            values: [
              {
                year: 2020,
                value: 3000,
                comparedScenarioValue: 3000,
                isProjected: false,
                absoluteDifference: 0,
                percentageDifference: 0,
              },
              {
                year: 2021,
                value: 3045,
                comparedScenarioValue: 3045,
                isProjected: true,
                absoluteDifference: 0,
                percentageDifference: 0,
              },
              {
                year: 2022,
                value: 3090.675,
                comparedScenarioValue: 3090.675,
                isProjected: true,
                absoluteDifference: 0,
                percentageDifference: 0,
              },
              {
                year: 2023,
                value: 3137.0351250000003,
                comparedScenarioValue: 3137.0351250000003,
                isProjected: true,
                absoluteDifference: 0,
                percentageDifference: 0,
              },
            ],
          },
          {
            id: entityIds['Textile'],
            name: 'Textile',
            children: [
              {
                id: entityIds['Cotton'],
                name: 'Cotton',
                children: [],
                values: [
                  {
                    year: 2020,
                    value: 1200,
                    comparedScenarioValue: 1000,
                    isProjected: false,
                    absoluteDifference: -200,
                    percentageDifference: -18.181818181818183,
                  },
                  {
                    year: 2021,
                    value: 1218,
                    comparedScenarioValue: 1015,
                    isProjected: true,
                    absoluteDifference: -203,
                    percentageDifference: -18.181818181818183,
                  },
                  {
                    year: 2022,
                    value: 1236.27,
                    comparedScenarioValue: 1030.225,
                    isProjected: true,
                    absoluteDifference: -206.04500000000007,
                    percentageDifference: -18.181818181818187,
                  },
                  {
                    year: 2023,
                    value: 1254.81405,
                    comparedScenarioValue: 1045.678375,
                    isProjected: true,
                    absoluteDifference: -209.135675,
                    percentageDifference: -18.181818181818183,
                  },
                ],
              },
              {
                id: entityIds['Wool'],
                name: 'Wool',
                children: [],
                values: [
                  {
                    year: 2020,
                    value: 1500,
                    comparedScenarioValue: 1250,
                    isProjected: false,
                    absoluteDifference: -250,
                    percentageDifference: -18.181818181818183,
                  },
                  {
                    year: 2021,
                    value: 1522.5,
                    comparedScenarioValue: 1268.75,
                    isProjected: true,
                    absoluteDifference: -253.75,
                    percentageDifference: -18.181818181818183,
                  },
                  {
                    year: 2022,
                    value: 1545.3375,
                    comparedScenarioValue: 1287.78125,
                    isProjected: true,
                    absoluteDifference: -257.5562500000001,
                    percentageDifference: -18.181818181818187,
                  },
                  {
                    year: 2023,
                    value: 1568.5175625000002,
                    comparedScenarioValue: 1307.09796875,
                    isProjected: true,
                    absoluteDifference: -261.4195937500001,
                    percentageDifference: -18.181818181818183,
                  },
                ],
              },
            ],
            values: [
              {
                year: 2020,
                value: 2700,
                comparedScenarioValue: 2250,
                isProjected: false,
                absoluteDifference: -450,
                percentageDifference: -18.181818181818183,
              },
              {
                year: 2021,
                value: 2740.5,
                comparedScenarioValue: 2283.75,
                isProjected: true,
                absoluteDifference: -456.75,
                percentageDifference: -18.181818181818183,
              },
              {
                year: 2022,
                value: 2781.6075,
                comparedScenarioValue: 2318.00625,
                isProjected: true,
                absoluteDifference: -463.60125000000016,
                percentageDifference: -18.181818181818187,
              },
              {
                year: 2023,
                value: 2823.3316125,
                comparedScenarioValue: 2352.77634375,
                isProjected: true,
                absoluteDifference: -470.5552687500003,
                percentageDifference: -18.181818181818194,
              },
            ],
          },
        ],
        yearSum: [
          {
            year: 2020,
            value: 5700,
            comparedScenarioValue: 5250,
            absoluteDifference: -450,
            percentageDifference: -8.21917808219178,
            isProjected: false,
          },
          {
            year: 2021,
            value: 5785.5,
            comparedScenarioValue: 5328.75,
            absoluteDifference: -456.75,
            percentageDifference: -8.21917808219178,
            isProjected: true,
          },
          {
            year: 2022,
            value: 5872.282499999999,
            comparedScenarioValue: 5408.68125,
            absoluteDifference: -463.6012499999997,
            percentageDifference: -8.219178082191776,
            isProjected: true,
          },
          {
            year: 2023,
            value: 5960.3667375,
            comparedScenarioValue: 5489.81146875,
            absoluteDifference: -470.5552687500003,
            percentageDifference: -8.219178082191785,
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
        value: 3007.68,
        isProjected: false,
      },
      {
        year: 2021,
        value: 3052.7952,
        isProjected: true,
      },
      {
        year: 2022,
        value: 3098.587128,
        isProjected: true,
      },
      {
        year: 2023,
        value: 3145.06593492,
        isProjected: true,
      },
    ],
  };
};
