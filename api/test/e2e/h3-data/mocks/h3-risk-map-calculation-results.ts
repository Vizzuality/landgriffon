/**
 * Results of Risk Map Calculations for different types of risks (Water risk, Carbon Emissions, Biodiversity Loss, Deforestation).
 * Calculations are based on the example data from h3-fixtures and are provided for two h3 index resolutions - 6 and 3.
 */

export const riskMapCalculationResults = {
  waterRiskRes6Values: [
    { h: '867400027ffffff', v: 0.000056100982603150696 },
    { h: '86108002fffffff', v: 0.000011220196102645254 },
    { h: '862c80007ffffff', v: 0.028050490883590462 },
    { h: '86108001fffffff', v: 0.000056100982603150696 },
    { h: '86740002fffffff', v: 0.000252454411264556 },
    { h: '868c36db7ffffff', v: 0.000056100982603150696 },
    { h: '862c80017ffffff', v: 0.08415147265077139 },
    { h: '862c8000fffffff', v: 0.056100981767180924 },
    { h: '8610b6d97ffffff', v: 0.000028050491301575348 },
    { h: '861080017ffffff', v: 0.00008415147599465048 },
    { h: '868c0001fffffff', v: 0.00011220196520630139 },
    { h: '862c8001fffffff', v: 0.014025245441795231 },
    { h: '861080007ffffff', v: 0.000056100982603150696 },
    { h: '867400017ffffff', v: 0.00008415147599465048 },
    { h: '867436d97ffffff', v: 0.000056100982603150696 },
    { h: '868c00007ffffff', v: 0.00014025245441795232 },
    { h: '868c00017ffffff', v: 0.00008415147599465048 },
    { h: '867400007ffffff', v: 0.00007012622720897616 },
    { h: '8610b6d9fffffff', v: 0.000056100982603150696 },
    { h: '862c80027ffffff', v: 0.04207573632538569 },
    { h: '868c0000fffffff', v: 0.00006171107960951111 },
    { h: '861080027ffffff', v: 0.000028050491301575348 },
  ],

  waterRiskRes6Quantiles: {
    quantiles: [
      0.000011220196102645254, 0.000056100982603150696, 0.000056100982603150696,
      0.00007713885160181332, 0.0001122216005487495, 0.021145862552594666,
      0.08415147265077139,
    ],
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
    quantiles: [
      0.000011220196102645254, 0.000056100982603150696, 0.000056100982603150696,
      0.00007713885160181332, 0.0001122216005487495, 0.021145862552594666,
      0.08415147265077139,
    ],
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
    quantiles: [
      0.000011220196102645254, 0.000056100982603150696, 0.000056100982603150696,
      0.00007713885160181332, 0.0001122216005487495, 0.021145862552594666,
      0.08415147265077139,
    ],
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

  waterRiskRes3Values: [
    { h: '831080fffffffff', v: 0.0002356241286051725 },
    { h: '837400fffffffff', v: 0.00046283309707133334 },
    { h: '837436fffffffff', v: 0.000056100982603150696 },
    { h: '838c00fffffffff', v: 0.00039831697522841534 },
    { h: '832c80fffffffff', v: 0.2244039270687237 },
    { h: '838c36fffffffff', v: 0.000056100982603150696 },
    { h: '8310b6fffffffff', v: 0.00008415147390472604 },
  ],

  waterRiskRes3Quantiles: {
    quantiles: [
      0.000056100982603150696, 0.00005610659270141101, 0.00008448471374506705,
      0.0002356241286051725, 0.0003983298784527839, 0.0009555035038090137,
      0.2244039270687237,
    ],
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
    {
      h: '8610b6d97ffffff',
      v: 22.598870435340256,
    },
    {
      h: '861080017ffffff',
      v: 30.508474727808377,
    },
    {
      h: '861080007ffffff',
      v: 112.99435217670128,
    },
    {
      h: '867400017ffffff',
      v: 119.49153346783037,
    },
    {
      h: '867436d97ffffff',
      v: 20.33898264674816,
    },
    {
      h: '868c00007ffffff',
      v: 169.49152573943138,
    },
    {
      h: '867400007ffffff',
      v: 5.296610179357231,
    },
    {
      h: '8610b6d9fffffff',
      v: 79.09604279840055,
    },
  ],

  biodiversityLossRes6Quantiles: {
    quantiles: [
      5.296610179357231, 20.71615791866418, 25.2557065171803, 54.80225876310446,
      101.70282532278931, 118.42534601795609, 169.49152573943138,
    ],
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
    {
      h: '8310b6fffffffff',
      v: 101.6949132337408,
    },
    {
      h: '831080fffffffff',
      v: 143.50282690450967,
    },
    {
      h: '837400fffffffff',
      v: 124.7881436471876,
    },
    {
      h: '837436fffffffff',
      v: 20.33898264674816,
    },
    {
      h: '838c00fffffffff',
      v: 169.49152573943138,
    },
  ],

  biodiversityLossRes3Quantiles: {
    quantiles: [
      20.33898264674816, 74.58711716215485, 109.42652677616279,
      124.7881436471876, 137.26709444316995, 152.20384327444145,
      169.49152573943138,
    ],
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

  carbonEmissionsRes6Values: [
    {
      h: '8610b6d97ffffff',
      v: 0.002259887,
    },
    {
      h: '861080017ffffff',
      v: 0.0030508474,
    },
    {
      h: '861080007ffffff',
      v: 0.011299435,
    },
    {
      h: '867400017ffffff',
      v: 0.011949154,
    },
    {
      h: '867436d97ffffff',
      v: 0.0020338984,
    },
    {
      h: '868c00007ffffff',
      v: 0.016949153,
    },
    {
      h: '867400007ffffff',
      v: 0.000529661,
    },
    {
      h: '8610b6d9fffffff',
      v: 0.007909604,
    },
  ],

  carbonEmissionsRes6Quantiles: {
    quantiles: [
      0.000529661, 0.0020716158851515503, 0.0025255706508411097,
      0.005480225896462798, 0.010170282442774623, 0.011842534800060093,
      0.016949152573943138,
    ],
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

  carbonEmissionsRes3Values: [
    { h: '831080fffffffff', v: 0.014350282 },
    { h: '837400fffffffff', v: 0.012478814 },
    { h: '837436fffffffff', v: 0.0020338984 },
    { h: '838c00fffffffff', v: 0.016949153 },
    { h: '8310b6fffffffff', v: 0.010169491 },
  ],

  carbonEmissionsRes3Quantiles: {
    quantiles: [
      0.0020338984, 0.007458711651619523, 0.010942652608826757,
      0.012478814460337162, 0.01372670903466642, 0.015220383886992931,
      0.016949152573943138,
    ],
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
    {
      h: '86108002fffffff',
      v: 0.0011220196,
    },
    {
      h: '86108001fffffff',
      v: 0.0044880784,
    },
    {
      h: '861080017ffffff',
      v: 0.0050490885,
    },
    {
      h: '861080007ffffff',
      v: 0.028050492,
    },
    {
      h: '861080027ffffff',
      v: 0.003366059,
    },

    {
      h: '868c36db7ffffff',
      v: 0.011220196,
    },

    {
      h: '8610b6d97ffffff',
      v: 0.011220196,
    },
    {
      h: '8610b6d9fffffff',
      v: 0.019635344,
    },
    {
      h: '86740002fffffff',
      v: 0.011360449,
    },
    {
      h: '867400017ffffff',
      v: 0.019775596,
    },
    {
      h: '867400007ffffff',
      v: 0.0010518935,
    },
    { h: '867400027ffffff', v: 0.019074334 },
    {
      h: '867436d97ffffff',
      v: 0.0050490885,
    },

    {
      h: '868c0001fffffff',
      v: 0.0022440392,
    },
    {
      h: '868c00007ffffff',
      v: 0.016830295,
    },
    {
      h: '868c00017ffffff',
      v: 0.00084151473,
    },
    {
      h: '868c0000fffffff',
      v: 0.0049368865,
    },
    {
      h: '862c8001fffffff',
      v: 0.7012623,
    },
    {
      h: '862c80027ffffff',
      v: 6.3113604,
    },
    {
      h: '862c80017ffffff',
      v: 25.245441,
    },
    {
      h: '862c8000fffffff',
      v: 11.220197,
    },
    {
      h: '862c80007ffffff',
      v: 2.8050492,
    },
  ],

  deforestationRes3Values: [
    {
      h: '831080fffffffff',
      v: 0.04207574,
    },
    {
      h: '8310b6fffffffff',
      v: 0.03085554,
    },
    {
      h: '837400fffffffff',
      v: 0.051262274,
    },
    {
      h: '837436fffffffff',
      v: 0.0050490885,
    },
    {
      h: '838c00fffffffff',
      v: 0.024852736,
    },
    {
      h: '838c36fffffffff',
      v: 0.011220196,
    },
    {
      h: '832c80fffffffff',
      v: 46.28331,
    },
  ],

  deforestationRes6Quantiles: {
    quantiles: [
      0.00084151473, 0.00280583447930403, 0.005049088504165411,
      0.0112903225235641, 0.019635442100279035, 1.7693548971354958,
      25.245441436767578,
    ],
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
    quantiles: [
      0.0050490885, 0.01122292276993394, 0.02486594209112227,
      0.030855540186166763, 0.042077575618028634, 0.1529727792412136,
      46.28330993652344,
    ],
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
