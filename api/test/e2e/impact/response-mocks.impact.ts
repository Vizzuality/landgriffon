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
