/**
 * Basic abstract dataset h3index: value used for tests that do not involved complex calculations
 */

export const h3BasicFixture = {
  '861203a4fffffff': 1000,
};

export const h3BasicFixtureForScaler = {
  '861203a4fffffff': 1000,
  '861203a6fffffff': 1000,
  '861203a5fffffff': 1000,
};

/**
 * Dataset of h3 indexes in resolution 6 and it's value, mocking a part of 'real-life' h3 table contents with production or harvest volumes.
 * Each 10 indexes of resolution 6 have same resolution 1 parent, each 5 within those 10 have same resolution 3 parent
 */

export const h3MaterialExampleDataFixture = {
  //parent resolution 1 - 8110bffffffffff

  // parent resolution 3 - 831080fffffffff
  '861080007ffffff': 500,
  '861080017ffffff': 60,
  '86108001fffffff': 80,
  '861080027ffffff': 120,
  '86108002fffffff': 100,
  // parent resolution 3 - 8310b6fffffffff
  '8610b6d97ffffff': 400,
  '8610b6d9fffffff': 350,
  '8610b6da7ffffff': 0,
  '8610b6dafffffff': 0,
  '8610b6db7ffffff': null,

  // parent resolution 1 - 81743ffffffffff

  // parent resolution 3 - 837400fffffffff
  '867400007ffffff': 15,
  '867400017ffffff': 235,
  '86740001fffffff': 100,
  '867400027ffffff': 340,
  '86740002fffffff': 45,
  // parent resolution 3 - 837436fffffffff
  '867436d97ffffff': 90,
  '867436d9fffffff': null,
  '867436da7ffffff': null,
  '867436dafffffff': 0,
  '867436db7ffffff': 0,

  // parent resolution 1 - 818c3ffffffffff

  // parent resolution 3 - 838c00fffffffff
  '868c00007ffffff': 120,
  '868c0000fffffff': 80,
  '868c00017ffffff': 10,
  '868c0001fffffff': 20,
  '868c00027ffffff': 0,
  // parent resolution 3 - 838c36fffffffff
  '868c36d97ffffff': 0,
  '868c36d9fffffff': null,
  '868c36da7ffffff': null,
  '868c36dafffffff': null,
  '868c36db7ffffff': 200,

  // parent resolution 1 - 812cbffffffffff

  // parent resolution 3 - 832c80fffffffff
  '862c80007ffffff': 100,
  '862c8000fffffff': 200,
  '862c80017ffffff': 300,
  '862c8001fffffff': 50,
  '862c80027ffffff': 150,
  // parent resolution 3 - 832cb6fffffffff
  '862cb6d97ffffff': 0,
  '862cb6d9fffffff': 0,
  '862cb6da7ffffff': 0,
  '862cb6dafffffff': null,
  '862cb6db7ffffff': null,
};

/**
 * Dataset of h3 indexes in resolution 6 and their values, mocking a part of 'real-life' h3 table contents with data on risk indicator levels, such as water risk, carbon emissions, etc.
 * Each 10 indexes of resolution 6 have same resolution 1 parent, each 5 within those 10 have same resolution 3 parent
 */

export const h3IndicatorExampleDataFixture = {
  // parent resolution 1 - 8110bffffffffff

  // parent resolution 3 - 831080fffffffff
  '861080007ffffff': 0.2,
  '861080017ffffff': 0.3,
  '86108001fffffff': 0.2,
  '861080027ffffff': 0.1,
  '86108002fffffff': 0.04,
  // parent resolution 3 - 8310b6fffffffff
  '8610b6d97ffffff': 0.1,
  '8610b6d9fffffff': 0.2,
  '8610b6da7ffffff': 0.3,
  '8610b6dafffffff': 0.1,
  '8610b6db7ffffff': null,

  // parent resolution 1 - 81743ffffffffff

  // parent resolution 3 - 837400fffffffff
  '867400007ffffff': 0.25,
  '867400017ffffff': 0.3,
  '86740001fffffff': 0,
  '867400027ffffff': 0.2,
  '86740002fffffff': 0.9,
  // parent resolution 3 - 837436fffffffff
  '867436d97ffffff': 0.2,
  '867436d9fffffff': 0.2,
  '867436da7ffffff': 0.15,
  '867436dafffffff': 0,
  '867436db7ffffff': 0,

  // parent resolution 1 - 818c3ffffffffff

  // parent resolution 3 - 838c00fffffffff
  '868c00007ffffff': 0.5,
  '868c0000fffffff': 0.22,
  '868c00017ffffff': 0.3,
  '868c0001fffffff': 0.4,
  '868c00027ffffff': 0.1,
  // parent resolution 3 - 838c36fffffffff
  '868c36d97ffffff': 0,
  '868c36d9fffffff': null,
  '868c36da7ffffff': null,
  '868c36dafffffff': null,
  '868c36db7ffffff': 0.2,

  // parent resolution 1 - 812cbffffffffff

  // parent resolution 3 - 832c80fffffffff
  '862c80007ffffff': 100,
  '862c8000fffffff': 200,
  '862c80017ffffff': 300,
  '862c8001fffffff': 50,
  '862c80027ffffff': 150,
  // parent resolution 3 - 832cb6fffffffff
  '862cb6d97ffffff': 0,
  '862cb6d9fffffff': 0,
  '862cb6da7ffffff': 0,
  '862cb6dafffffff': null,
  '862cb6db7ffffff': null,
};

/**
 * Dataset of h3 indexes in resolution 6 and their values, mocking a part of 'real-life' h3 table contents with data on Deforestation indicator levels
 * Each 10 indexes of resolution 6 have same resolution 1 parent, each 5 within those 10 have same resolution 3 parent
 */

export const h3DeforestationExampleDataFixture = {
  /**
   * parent resolution 1 - 8110bffffffffff
   */
  // parent resolution 3 - 831080fffffffff
  '861080007ffffff': 0.2,
  '861080017ffffff': 0.3,
  // parent resolution 3 - 8310b6fffffffff
  '8610b6d97ffffff': 0.1,
  '8610b6d9fffffff': 0.2,
  /**
   * parent resolution 1 - 81743ffffffffff
   */
  // parent resolution 3 - 837400fffffffff
  '867400007ffffff': 0.25,
  '867400017ffffff': 0.3,
  // parent resolution 3 - 837436fffffffff
  '867436d97ffffff': 0.2,
  '867436d9fffffff': 0.2,
  '867436da7ffffff': 0.15,
  '867436dafffffff': 0,
  '867436db7ffffff': 0,
  /**
   * parent resolution 1 - 818c3ffffffffff
   */
  // parent resolution 3 - 838c00fffffffff
  '868c00007ffffff': 0.5,
  // parent resolution 3 - 838c36fffffffff
  '868c36d97ffffff': 0,
  '868c36d9fffffff': null,
};

export const h3ContextualLayerExampleDataFixture = {
  // parent resolution 1 - 8110bffffffffff

  // parent resolution 3 - 821087fffffffff
  '861080007ffffff': 0.2,
  '86108002fffffff': 0.04,
  '86108001fffffff': 0.2,
  '861080027ffffff': 1,
  '861080017ffffff': 0.5,
  // parent resolution 3 - 8210b7fffffffff
  '8610b6d97ffffff': 0.5,
  '8610b6db7ffffff': null,
  '8610b6d9fffffff': 5,
  '8610b6da7ffffff': 0.5,
  '8610b6dafffffff': 0,
};
