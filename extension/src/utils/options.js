const defaultUnits = [
  {
    baseUnit: "g",
    actualUnit: "lb",
    shortFor: "pound",
    plural: true,
    rescale: true,
    factor: 432,
    offset: 0.0,
  },
  {
    baseUnit: "g",
    actualUnit: "oz",
    shortFor: "ounce",
    plural: true,
    rescale: true,
    factor: 28.3495,
    offset: 0.0,
  },
  {
    baseUnit: "C",
    actualUnit: "F",
    shortFor: "Fahrenheit",
    plural: true,
    rescale: false,
    factor: 0.5555555555555556,
    offset: -17.777,
  },
  {
    baseUnit: "ml",
    shortFor: "cup",
    plural: true,
    rescale: false,
    factor: 200,
    offset: 0,
  },
  {
    baseUnit: "ml",
    shortFor: "tablespoon",
    plural: true,
    rescale: false,
    factor: 12,
    offset: 0,
  },
  {
    baseUnit: "ml",
    shortFor: "teaspoon",
    plural: true,
    rescale: false,
    factor: 2.5,
    offset: 0,
  },
];

export const insertionsOptions = [
  "tooltip",
  "replace",
  "brackets",
  "brackets_strong"
];

export const defaultOptions = {
    insertionOptions: 'tooltip',
    processOnLoaded: false,
    units: defaultUnits,
};
