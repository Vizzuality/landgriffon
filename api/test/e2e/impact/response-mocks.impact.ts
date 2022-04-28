export const groupByMaterialResponseData = {
  rows: [
    {
      name: 'Fake Material 1',
      values: [
        {
          year: 2010,
          value: 1000,
          isProjected: false,
        },
        {
          year: 2011,
          value: 1050,
          isProjected: false,
        },
        {
          year: 2012,
          value: 1100,
          isProjected: false,
        },
        {
          year: 2013,
          value: 1116.5,
          isProjected: true,
        },
      ],
      children: [],
    },
    {
      name: 'Fake Material 2',
      values: [
        {
          year: 2010,
          value: 2000,
          isProjected: false,
        },
        {
          year: 2011,
          value: 2050,
          isProjected: false,
        },
        {
          year: 2012,
          value: 2100,
          isProjected: false,
        },
        {
          year: 2013,
          value: 2131.5,
          isProjected: true,
        },
      ],
      children: [],
    },
  ],
  yearSum: [
    {
      year: 2010,
      value: 3000,
    },
    {
      year: 2011,
      value: 3100,
    },
    {
      year: 2012,
      value: 3200,
    },
    {
      year: 2013,
      value: 3248,
    },
  ],
};

export const groupByMaterialNestedResponseData = {
  rows: [
    {
      name: 'Fake Material Parent',
      values: [
        {
          year: 2010,
          value: 3000,
          isProjected: false,
        },
        {
          year: 2011,
          value: 3100,
          isProjected: false,
        },
        {
          year: 2012,
          value: 3200,
          isProjected: false,
        },
        {
          year: 2013,
          value: 3248,
          isProjected: true,
        },
      ],
      children: [
        {
          name: 'Fake Material Child',
          values: [
            {
              year: 2010,
              value: 3000,
              isProjected: false,
            },
            {
              year: 2011,
              value: 3100,
              isProjected: false,
            },
            {
              year: 2012,
              value: 3200,
              isProjected: false,
            },
            {
              year: 2013,
              value: 3248,
              isProjected: true,
            },
          ],
          children: [
            {
              name: 'Fake Material Grandchild',
              values: [
                {
                  year: 2010,
                  value: 1000,
                  isProjected: false,
                },
                {
                  year: 2011,
                  value: 1050,
                  isProjected: false,
                },
                {
                  year: 2012,
                  value: 1100,
                  isProjected: false,
                },
                {
                  year: 2013,
                  value: 1116.5,
                  isProjected: true,
                },
              ],
              children: [],
            },
          ],
        },
      ],
    },
  ],
  yearSum: [
    {
      year: 2010,
      value: 3000,
    },
    {
      year: 2011,
      value: 3100,
    },
    {
      year: 2012,
      value: 3200,
    },
    {
      year: 2013,
      value: 3248,
    },
  ],
};

export const groupByMaterialNestedResponseDataForGrandchild = {
  rows: [
    {
      name: 'Fake Material Parent',
      values: [
        {
          year: 2010,
          value: 1000,
          isProjected: false,
        },
        {
          year: 2011,
          value: 1050,
          isProjected: false,
        },
        {
          year: 2012,
          value: 1100,
          isProjected: false,
        },
        {
          year: 2013,
          value: 1116.5,
          isProjected: true,
        },
      ],
      children: [
        {
          name: 'Fake Material Child',
          values: [
            {
              year: 2010,
              value: 1000,
              isProjected: false,
            },
            {
              year: 2011,
              value: 1050,
              isProjected: false,
            },
            {
              year: 2012,
              value: 1100,
              isProjected: false,
            },
            {
              year: 2013,
              value: 1116.5,
              isProjected: true,
            },
          ],
          children: [
            {
              name: 'Fake Material Grandchild',
              values: [
                {
                  year: 2010,
                  value: 1000,
                  isProjected: false,
                },
                {
                  year: 2011,
                  value: 1050,
                  isProjected: false,
                },
                {
                  year: 2012,
                  value: 1100,
                  isProjected: false,
                },
                {
                  year: 2013,
                  value: 1116.5,
                  isProjected: true,
                },
              ],
              children: [],
            },
          ],
        },
      ],
    },
  ],
  yearSum: [
    {
      year: 2010,
      value: 1000,
    },
    {
      year: 2011,
      value: 1050,
    },
    {
      year: 2012,
      value: 1100,
    },
    {
      year: 2013,
      value: 1116.5,
    },
  ],
};

export const groupByOriginResponseData = {
  rows: [
    {
      name: 'Fake AdminRegion 1',
      values: [
        { isProjected: false, value: 600, year: 2010 },
        { isProjected: false, value: 650, year: 2011 },
        { isProjected: false, value: 700, year: 2012 },
        { isProjected: true, value: 710.5, year: 2013 },
      ],
      children: [],
    },
    {
      name: 'Fake AdminRegion 2',
      values: [
        { isProjected: false, value: 500, year: 2010 },
        { isProjected: false, value: 550, year: 2011 },
        { isProjected: false, value: 600, year: 2012 },
        { isProjected: true, value: 609, year: 2013 },
      ],
      children: [],
    },
  ],
  yearSum: [
    {
      year: 2010,
      value: 1100,
    },
    {
      year: 2011,
      value: 1200,
    },
    {
      year: 2012,
      value: 1300,
    },
    {
      year: 2013,
      value: 1319.5,
    },
  ],
};

export const groupBySupplierResponseData = {
  rows: [
    {
      name: 'Fake Supplier 1',
      values: [
        { isProjected: false, value: 100, year: 2010 },
        { isProjected: false, value: 150, year: 2011 },
        { isProjected: false, value: 200, year: 2012 },
        { isProjected: true, value: 203, year: 2013 },
      ],
      children: [],
    },
    {
      name: 'Fake Supplier 2',
      values: [
        { isProjected: false, value: 300, year: 2010 },
        { isProjected: false, value: 350, year: 2011 },
        { isProjected: false, value: 400, year: 2012 },
        { isProjected: true, value: 406, year: 2013 },
      ],
      children: [],
    },
  ],
  yearSum: [
    { value: 400, year: 2010 },
    { value: 500, year: 2011 },
    { value: 600, year: 2012 },
    { value: 609, year: 2013 },
  ],
};

export const groupByBusinessUnitResponseData = {
  rows: [
    {
      name: 'Fake BusinessUnit 1',
      values: [
        { isProjected: false, value: 100, year: 2010 },
        { isProjected: false, value: 150, year: 2011 },
        { isProjected: false, value: 200, year: 2012 },
        { isProjected: true, value: 203, year: 2013 },
      ],
      children: [],
    },
    {
      name: 'Fake BusinessUnit 2',
      values: [
        { isProjected: false, value: 300, year: 2010 },
        { isProjected: false, value: 350, year: 2011 },
        { isProjected: false, value: 400, year: 2012 },
        { isProjected: true, value: 406, year: 2013 },
      ],
      children: [],
    },
  ],
  yearSum: [
    { value: 400, year: 2010 },
    { value: 500, year: 2011 },
    { value: 600, year: 2012 },
    { value: 609, year: 2013 },
  ],
};

export const groupByLocationTypeResponseData = {
  rows: [
    {
      name: 'aggregation point',
      children: [],
      values: [
        {
          year: 2010,
          value: 300,
          isProjected: false,
        },
        {
          year: 2011,
          value: 350,
          isProjected: false,
        },
        {
          year: 2012,
          value: 400,
          isProjected: false,
        },
        {
          year: 2013,
          value: 406,
          isProjected: true,
        },
      ],
    },
    {
      name: 'country of production',
      children: [],
      values: [
        {
          year: 2010,
          value: 100,
          isProjected: false,
        },
        {
          year: 2011,
          value: 150,
          isProjected: false,
        },
        {
          year: 2012,
          value: 200,
          isProjected: false,
        },
        {
          year: 2013,
          value: 203,
          isProjected: true,
        },
      ],
    },
  ],
  yearSum: [
    { value: 400, year: 2010 },
    { value: 500, year: 2011 },
    { value: 600, year: 2012 },
    { value: 609, year: 2013 },
  ],
};

export const filteredByLocationTypeResponseData = {
  rows: [
    {
      name: 'Fake Material',
      children: [],
      values: [
        {
          year: 2010,
          value: 300,
          isProjected: false,
        },
        {
          year: 2011,
          value: 350,
          isProjected: false,
        },
        {
          year: 2012,
          value: 400,
          isProjected: false,
        },
        {
          year: 2013,
          value: 406,
          isProjected: true,
        },
      ],
    },
  ],
  yearSum: [
    { value: 300, year: 2010 },
    { value: 350, year: 2011 },
    { value: 400, year: 2012 },
    { value: 406, year: 2013 },
  ],
};
export const scenarioInterventionComparisonTable = {
  impactTable: [
    {
      indicatorShortName: null,
      indicatorId: '8be70a63-58d6-4d3c-b724-ad0b0758c0a2',
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
                  value: 1200,
                  isProjected: false,
                  interventionValue: 1000,
                  absoluteDifference: -200,
                  percentageDifference: 83.33333333333334,
                },
                {
                  year: 2021,
                  value: 1218,
                  isProjected: true,
                  interventionValue: 1015,
                  absoluteDifference: -203,
                  percentageDifference: 83.33333333333334,
                },
                {
                  year: 2022,
                  value: 1236.27,
                  isProjected: true,
                  interventionValue: 1030.225,
                  absoluteDifference: -206.04500000000007,
                  percentageDifference: 83.33333333333333,
                },
                {
                  year: 2023,
                  value: 1254.81405,
                  isProjected: true,
                  interventionValue: 1045.678375,
                  absoluteDifference: -209.135675,
                  percentageDifference: 83.33333333333334,
                },
              ],
            },
            {
              name: 'Wool',
              children: [],
              values: [
                {
                  year: 2020,
                  value: 1200,
                  isProjected: false,
                  interventionValue: 1000,
                  absoluteDifference: -200,
                  percentageDifference: 83.33333333333334,
                },
                {
                  year: 2021,
                  value: 1218,
                  isProjected: true,
                  interventionValue: 1015,
                  absoluteDifference: -203,
                  percentageDifference: 83.33333333333334,
                },
                {
                  year: 2022,
                  value: 1236.27,
                  isProjected: true,
                  interventionValue: 1030.225,
                  absoluteDifference: -206.04500000000007,
                  percentageDifference: 83.33333333333333,
                },
                {
                  year: 2023,
                  value: 1254.81405,
                  isProjected: true,
                  interventionValue: 1045.678375,
                  absoluteDifference: -209.135675,
                  percentageDifference: 83.33333333333334,
                },
              ],
            },
          ],
          values: [
            {
              year: 2020,
              value: 2400,
              isProjected: false,
              interventionValue: 2000,
              absoluteDifference: -400,
              percentageDifference: 83.33333333333334,
            },
            {
              year: 2021,
              value: 2436,
              isProjected: true,
              interventionValue: 2030,
              absoluteDifference: -406,
              percentageDifference: 83.33333333333334,
            },
            {
              year: 2022,
              value: 2472.54,
              isProjected: true,
              interventionValue: 2060.45,
              absoluteDifference: -412.09000000000015,
              percentageDifference: 83.33333333333333,
            },
            {
              year: 2023,
              value: 2509.6281,
              isProjected: true,
              interventionValue: 2091.35675,
              absoluteDifference: -418.27135,
              percentageDifference: 83.33333333333334,
            },
          ],
        },
      ],
      yearSum: [
        {
          year: 2020,
          value: 2400,
          interventionValue: 2000,
        },
        {
          year: 2021,
          value: 2436,
          interventionValue: 2030,
        },
        {
          year: 2022,
          value: 2472.54,
          interventionValue: 2060.45,
        },
        {
          year: 2023,
          value: 2509.6281,
          interventionValue: 2091.35675,
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
      value: 2005.12,
      isProjected: false,
    },
    {
      year: 2021,
      value: 1017.5984,
      isProjected: true,
    },
    {
      year: 2022,
      value: 1017.5984,
      isProjected: true,
    },
    {
      year: 2023,
      value: 1017.5984,
      isProjected: true,
    },
  ],
};
