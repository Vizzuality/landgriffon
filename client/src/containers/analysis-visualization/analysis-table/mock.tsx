const DATA = [
  {
    id: '1',
    indicator: 'Carbon emissions (tCO2)',
    all: 'Graphic',
    values: [
      { year: 2021, value: 300, calculated: false },
      { year: 2022, value: 230, calculated: true },
      { year: 2023, value: 300, calculated: true },
      { year: 2024, value: 300, calculated: true },
      { year: 2025, value: 50, calculated: true },
    ],
    children: [
      {
        id: 11,
        indicator: 'Rice',
        all: 'Graphic',
        values: [
          { year: 2021, value: 220, calculated: true },
          { year: 2022, value: 30, calculated: true },
          { year: 2023, value: 20, calculated: true },
          { year: 2024, value: 10, calculated: true },
          { year: 2025, value: 50, calculated: true },
        ],
      },
      {
        id: 12,
        indicator: 'Palm Oil',
        all: 'Graphic',
        values: [
          { year: 2021, value: 20, calculated: true },
          { year: 2022, value: 60, calculated: true },
          { year: 2023, value: 20, calculated: true },
          { year: 2024, value: 10, calculated: true },
          { year: 2025, value: 50, calculated: true },
        ],
      },
      {
        id: 13,
        indicator: 'Cocoa',
        all: 'Graphic',
        values: [
          { year: 2021, value: 60, calculated: true },
          { year: 2022, value: 30, calculated: true },
          { year: 2023, value: 20, calculated: true },
          { year: 2024, value: 10, calculated: true },
          { year: 2025, value: 50, calculated: true },
        ],
      },
      {
        id: 14,
        indicator: 'Beef',
        all: 'Graphic',
        values: [
          { year: 2021, value: 100, calculated: true },
          { year: 2022, value: 30, calculated: true },
          { year: 2023, value: 20, calculated: true },
          { year: 2024, value: 10, calculated: true },
          { year: 2025, value: 50, calculated: true },
        ],
      },
      {
        id: 15,
        indicator: 'Carrots',
        all: 'Graphic',
        values: [
          { year: 2021, value: 120, calculated: true },
          { year: 2022, value: 30, calculated: true },
          { year: 2023, value: 20, calculated: true },
          { year: 2024, value: 10, calculated: true },
          { year: 2025, value: 50, calculated: true },
        ],
      },
      {
        id: 16,
        indicator: 'Corn',
        all: 'Graphic',
        values: [
          { year: 2021, value: 220, calculated: true },
          { year: 2022, value: 30, calculated: true },
          { year: 2023, value: 20, calculated: true },
          { year: 2024, value: 10, calculated: true },
          { year: 2025, value: 50, calculated: true },
        ],
      },
      {
        id: 17,
        indicator: 'Melon',
        all: 'Graphic',
        values: [
          { year: 2021, value: 220, calculated: true },
          { year: 2022, value: 30, calculated: true },
          { year: 2023, value: 20, calculated: true },
          { year: 2024, value: 10, calculated: true },
          { year: 2025, value: 50, calculated: true },
        ],
      },
    ],
  },
  {
    id: '2',
    indicator: 'Deforestation (Ha)',
    all: 'Graphic',
    values: [
      { year: 2021, value: 200, calculated: false },
      { year: 2022, value: 130, calculated: true },
      { year: 2023, value: 320, calculated: true },
      { year: 2024, value: 100, calculated: true },
      { year: 2025, value: 150, calculated: true },
    ],
    children: [
      {
        id: 21,
        indicator: 'Rice',
        all: 'Graphic',
        values: [
          { year: 2021, value: 220, calculated: true },
          { year: 2022, value: 30, calculated: true },
          { year: 2023, value: 20, calculated: true },
          { year: 2024, value: 10, calculated: true },
          { year: 2025, value: 50, calculated: true },
        ],
      },
      {
        id: 22,
        indicator: 'Palm Oil',
        all: 'Graphic',
        values: [
          { year: 2021, value: 220, calculated: true },
          { year: 2022, value: 30, calculated: true },
          { year: 2023, value: 20, calculated: true },
          { year: 2024, value: 10, calculated: true },
          { year: 2025, value: 50, calculated: true },
        ],
      },
      {
        id: 23,
        indicator: 'Cocoa',
        all: 'Graphic',
        values: [
          { year: 2021, value: 220, calculated: true },
          { year: 2022, value: 30, calculated: true },
          { year: 2023, value: 20, calculated: true },
          { year: 2024, value: 10, calculated: true },
          { year: 2025, value: 50, calculated: true },
        ],
      },
      {
        id: 24,
        indicator: 'Beef',
        all: 'Graphic',
        values: [
          { year: 2021, value: 220, calculated: true },
          { year: 2022, value: 30, calculated: true },
          { year: 2023, value: 20, calculated: true },
          { year: 2024, value: 10, calculated: true },
          { year: 2025, value: 50, calculated: true },
        ],
      },
      {
        id: 25,
        indicator: 'Carrots',
        all: 'Graphic',
        values: [
          { year: 2021, value: 220, calculated: true },
          { year: 2022, value: 30, calculated: true },
          { year: 2023, value: 20, calculated: true },
          { year: 2024, value: 10, calculated: true },
          { year: 2025, value: 50, calculated: true },
        ],
      },
      {
        id: 26,
        indicator: 'Corn',
        all: 'Graphic',
        values: [
          { year: 2021, value: 220, calculated: true },
          { year: 2022, value: 30, calculated: true },
          { year: 2023, value: 20, calculated: true },
          { year: 2024, value: 10, calculated: true },
          { year: 2025, value: 50, calculated: true },
        ],
      },
      {
        id: 27,
        indicator: 'Melon',
        all: 'Graphic',
        values: [
          { year: 2021, value: 220, calculated: true },
          { year: 2022, value: 30, calculated: true },
          { year: 2023, value: 20, calculated: true },
          { year: 2024, value: 10, calculated: true },
          { year: 2025, value: 50, calculated: true },
        ],
      },
    ],
  },
  {
    id: '3',
    indicator: 'Unsustainable water use (M3)',
    all: 'Graphic',
    values: [
      { year: 2021, value: 20, calculated: true },
      { year: 2022, value: 30, calculated: true },
      { year: 2023, value: 220, calculated: true },
      { year: 2024, value: 10, calculated: true },
      { year: 2025, value: 50, calculated: false },
    ],
    children: [
      {
        id: 31,
        indicator: 'Rice',
        all: 'Graphic',
        values: [
          { year: 2021, value: 220, calculated: true },
          { year: 2022, value: 30, calculated: true },
          { year: 2023, value: 20, calculated: true },
          { year: 2024, value: 10, calculated: true },
          { year: 2025, value: 50, calculated: true },
        ],
      },
      {
        id: 32,
        indicator: 'Palm Oil',
        all: 'Graphic',
        values: [
          { year: 2021, value: 220, calculated: true },
          { year: 2022, value: 30, calculated: true },
          { year: 2023, value: 20, calculated: true },
          { year: 2024, value: 10, calculated: true },
          { year: 2025, value: 50, calculated: true },
        ],
      },
      {
        id: 33,
        indicator: 'Cocoa',
        all: 'Graphic',
        values: [
          { year: 2021, value: 220, calculated: true },
          { year: 2022, value: 30, calculated: true },
          { year: 2023, value: 20, calculated: true },
          { year: 2024, value: 10, calculated: true },
          { year: 2025, value: 50, calculated: true },
        ],
      },
      {
        id: 34,
        indicator: 'Beef',
        all: 'Graphic',
        values: [
          { year: 2021, value: 220, calculated: true },
          { year: 2022, value: 30, calculated: true },
          { year: 2023, value: 20, calculated: true },
          { year: 2024, value: 10, calculated: true },
          { year: 2025, value: 50, calculated: true },
        ],
      },
      {
        id: 35,
        indicator: 'Carrots',
        all: 'Graphic',
        values: [
          { year: 2021, value: 220, calculated: true },
          { year: 2022, value: 30, calculated: true },
          { year: 2023, value: 20, calculated: true },
          { year: 2024, value: 10, calculated: true },
          { year: 2025, value: 50, calculated: true },
        ],
      },
      {
        id: 36,
        indicator: 'Corn',
        all: 'Graphic',
        values: [
          { year: 2021, value: 220, calculated: true },
          { year: 2022, value: 30, calculated: true },
          { year: 2023, value: 20, calculated: true },
          { year: 2024, value: 10, calculated: true },
          { year: 2025, value: 50, calculated: true },
        ],
      },
      {
        id: 37,
        indicator: 'Melon',
        all: 'Graphic',
        values: [
          { year: 2021, value: 220, calculated: true },
          { year: 2022, value: 30, calculated: true },
          { year: 2023, value: 20, calculated: true },
          { year: 2024, value: 10, calculated: true },
          { year: 2025, value: 50, calculated: true },
        ],
      },
    ],
  },
  {
    id: '4',
    indicator: 'Biodiversity (X)',
    all: 'Graphic',
    values: [
      { year: 2021, value: 120, calculated: true },
      { year: 2022, value: 130, calculated: true },
      { year: 2023, value: 120, calculated: true },
      { year: 2024, value: 100, calculated: true },
      { year: 2025, value: 150, calculated: true },
    ],
    children: [
      {
        id: 41,
        indicator: 'Rice',
        all: 'Graphic',
        values: [
          { year: 2021, value: 220, calculated: true },
          { year: 2022, value: 30, calculated: true },
          { year: 2023, value: 20, calculated: true },
          { year: 2024, value: 10, calculated: true },
          { year: 2025, value: 50, calculated: true },
        ],
      },
      {
        id: 42,
        indicator: 'Palm Oil',
        all: 'Graphic',
        values: [
          { year: 2021, value: 220, calculated: true },
          { year: 2022, value: 30, calculated: true },
          { year: 2023, value: 20, calculated: true },
          { year: 2024, value: 10, calculated: true },
          { year: 2025, value: 50, calculated: true },
        ],
      },
      {
        id: 43,
        indicator: 'Cocoa',
        all: 'Graphic',
        values: [
          { year: 2021, value: 220, calculated: true },
          { year: 2022, value: 30, calculated: true },
          { year: 2023, value: 20, calculated: true },
          { year: 2024, value: 10, calculated: true },
          { year: 2025, value: 50, calculated: true },
        ],
      },
      {
        id: 44,
        indicator: 'Beef',
        all: 'Graphic',
        values: [
          { year: 2021, value: 220, calculated: true },
          { year: 2022, value: 30, calculated: true },
          { year: 2023, value: 20, calculated: true },
          { year: 2024, value: 10, calculated: true },
          { year: 2025, value: 50, calculated: true },
        ],
      },
      {
        id: 45,
        indicator: 'Carrots',
        all: 'Graphic',
        values: [
          { year: 2021, value: 220, calculated: true },
          { year: 2022, value: 30, calculated: true },
          { year: 2023, value: 20, calculated: true },
          { year: 2024, value: 10, calculated: true },
          { year: 2025, value: 50, calculated: true },
        ],
      },
      {
        id: 46,
        indicator: 'Corn',
        all: 'Graphic',
        values: [
          { year: 2021, value: 220, calculated: true },
          { year: 2022, value: 30, calculated: true },
          { year: 2023, value: 20, calculated: true },
          { year: 2024, value: 10, calculated: true },
          { year: 2025, value: 50, calculated: true },
        ],
      },
      {
        id: 47,
        indicator: 'Melon',
        all: 'Graphic',
        values: [
          { year: 2021, value: 220, calculated: true },
          { year: 2022, value: 30, calculated: true },
          { year: 2023, value: 20, calculated: true },
          { year: 2024, value: 10, calculated: true },
          { year: 2025, value: 50, calculated: true },
        ],
      },
    ],
  },
];

const PARSED_DATA = DATA.map(({ id: key, ...rest }) => ({
  key,
  ...rest,
}));

export default PARSED_DATA;
