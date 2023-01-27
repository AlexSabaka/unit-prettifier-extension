import { readSyncStorage, writeSyncStorage } from './chromeUtils';

const settingsKey = 'unit-prettifier-settings';

const defaultSettings = {
  'currentTab': 'Home',
  'convertOnPageLoaded': false,
  'units': {
    'lb': { baseUnit: 'g', actualUnit: 'lb', shortFor: 'pound', plural: true, factor: 432, offset: 0 },
    'oz': { baseUnit: 'g', actualUnit: 'oz', shortFor: 'ounce', plural: true, factor: 28.35, offset: 0 },
    'F': { baseUnit: 'C', actualUnit: 'F', shortFor: 'Fahrenheit', plural: true, factor: '5/9', offset: '-160/9' },
  },
};

export const AppSettings = {
  currentTab: 'currentTab',
  convertOnPageLoaded: 'convertOnPageLoaded',
  units: 'units',
};

export const readAppSettings = async (key) => {
  if (key === undefined) {
    return;
  }

  const currentSettings = await readSyncStorage(settingsKey) || defaultSettings;
  return currentSettings[key];
};

export const writeAppSettings = async (key, value) => {
  if (key === undefined) {
    return;
  }

  const currentSettings = await readSyncStorage(settingsKey) || defaultSettings;
  currentSettings[key] = value;
  await writeSyncStorage(settingsKey, currentSettings);
};