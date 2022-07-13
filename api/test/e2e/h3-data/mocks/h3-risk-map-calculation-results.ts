/**
 * Results of Risk Map Calculations for different types of risks (Water risk, Carbon Emissions, Biodiversity Loss, Deforestation).
 * Calculations are based on the example data from h3-fixtures and are provided for two h3 index resolutions - 6 and 3.
 */

export const riskMapCalculationResults = {
  waterRiskRes6Values: [],

  waterRiskRes6Quantiles: {
    quantiles: [0, null, null, null, null, null, null],
    unit: 'tonnes',
    indicatorDataYear: 2005,
    materialsH3DataYears: [
      {
        materialName: 'Fake material',
        materialDataYear: 2010,
        materialDataType: 'harvest',
      },
      {
        materialName: 'Fake material',
        materialDataYear: 2010,
        materialDataType: 'producer',
      },
    ],
  },

  waterRiskRes6Quantiles2020: {
    quantiles: [0, null, null, null, null, null, null],
    unit: 'tonnes',
    indicatorDataYear: 2020,
    materialsH3DataYears: [
      {
        materialName: 'Fake material',
        materialDataYear: 2020,
        materialDataType: 'harvest',
      },
      {
        materialName: 'Fake material',
        materialDataYear: 2020,
        materialDataType: 'producer',
      },
    ],
  },

  waterRiskRes6Quantiles2002: {
    quantiles: [0, null, null, null, null, null, null],
    unit: 'tonnes',
    indicatorDataYear: 2003,
    materialsH3DataYears: [
      {
        materialName: 'Fake material',
        materialDataYear: 2002,
        materialDataType: 'harvest',
      },
      {
        materialName: 'Fake material',
        materialDataYear: 2002,
        materialDataType: 'producer',
      },
    ],
  },

  waterRiskRes3Values: [],

  waterRiskRes3Quantiles: {
    quantiles: [0, null, null, null, null, null, null],
    unit: 'tonnes',
    indicatorDataYear: 2005,
    materialsH3DataYears: [
      {
        materialName: 'Fake material',
        materialDataYear: 2010,
        materialDataType: 'harvest',
      },
      {
        materialName: 'Fake material',
        materialDataYear: 2010,
        materialDataType: 'producer',
      },
    ],
  },

  biodiversityLossRes6Values: [
    { h: '8610b6d97ffffff', v: 23 },
    { h: '861080017ffffff', v: 31 },
    { h: '861080007ffffff', v: 113 },
    { h: '867400017ffffff', v: 119 },
    { h: '867436d97ffffff', v: 20 },
    { h: '868c00007ffffff', v: 169 },
    { h: '867400007ffffff', v: 5 },
    { h: '8610b6d9fffffff', v: 79 },
  ],

  biodiversityLossRes6Quantiles: {
    quantiles: [0, 20.5007, 25.6872, 55, 101.6746, 118.0154, 169],
    unit: 'tonnes',
    indicatorDataYear: 2005,
    materialsH3DataYears: [
      {
        materialName: 'Fake material',
        materialDataYear: 2010,
        materialDataType: 'harvest',
      },
      {
        materialName: 'Fake material',
        materialDataYear: 2010,
        materialDataType: 'producer',
      },
    ],
  },

  biodiversityLossRes3Values: [
    { h: '831080fffffffff', v: 144 },
    { h: '837400fffffffff', v: 125 },
    { h: '837436fffffffff', v: 20 },
    { h: '838c00fffffffff', v: 169 },
    { h: '8310b6fffffffff', v: 102 },
  ],

  biodiversityLossRes3Quantiles: {
    quantiles: [0, +74.6776, +109.7004, +125, +137.6692, +152.37, +169],
    unit: 'tonnes',
    indicatorDataYear: 2005,
    materialsH3DataYears: [
      {
        materialName: 'Fake material',
        materialDataYear: 2010,
        materialDataType: 'harvest',
      },
      {
        materialName: 'Fake material',
        materialDataYear: 2010,
        materialDataType: 'producer',
      },
    ],
  },

  carbonEmissionsRes6Values: [],

  carbonEmissionsRes6Quantiles: {
    quantiles: [0, null, null, null, null, null, null],
    unit: 'tonnes',
    indicatorDataYear: 2005,
    materialsH3DataYears: [
      {
        materialName: 'Fake material',
        materialDataYear: 2010,
        materialDataType: 'harvest',
      },
      {
        materialName: 'Fake material',
        materialDataYear: 2010,
        materialDataType: 'producer',
      },
    ],
  },

  carbonEmissionsRes3Values: [],

  carbonEmissionsRes3Quantiles: {
    quantiles: [0, null, null, null, null, null, null],
    unit: 'tonnes',
    indicatorDataYear: 2005,
    materialsH3DataYears: [
      {
        materialName: 'Fake material',
        materialDataYear: 2010,
        materialDataType: 'harvest',
      },
      {
        materialName: 'Fake material',
        materialDataYear: 2010,
        materialDataType: 'producer',
      },
    ],
  },

  deforestationRes6Values: [
    { h: '862c80007ffffff', v: 3 },
    { h: '862c80017ffffff', v: 25 },
    { h: '862c8000fffffff', v: 11 },
    { h: '862c8001fffffff', v: 1 },
    { h: '862c80027ffffff', v: 6 },
  ],

  deforestationRes3Values: [
    {
      h: '832c80fffffffff',
      v: 46,
    },
  ],

  deforestationRes6Quantiles: {
    quantiles: [0, +2.3335999999999997, +4.0044, +6, +9.334, +15.6872, +25],
    unit: 'tonnes',
    indicatorDataYear: 2005,
    materialsH3DataYears: [
      {
        materialName: 'Fake material',
        materialDataYear: 2010,
        materialDataType: 'harvest',
      },
      {
        materialName: 'Fake material',
        materialDataYear: 2010,
        materialDataType: 'producer',
      },
    ],
  },

  deforestationRes3Quantiles: {
    quantiles: [0, 46, 46, 46, 46, 46, 46],
    unit: 'tonnes',
    indicatorDataYear: 2005,
    materialsH3DataYears: [
      {
        materialName: 'Fake material',
        materialDataYear: 2010,
        materialDataType: 'harvest',
      },
      {
        materialName: 'Fake material',
        materialDataYear: 2010,
        materialDataType: 'producer',
      },
    ],
  },
};
