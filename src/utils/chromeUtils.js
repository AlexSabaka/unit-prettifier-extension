/*global chrome*/

export const readSyncStorage = async (key) => {
  return new Promise((resolve, reject) => {
    if (!(chrome?.storage?.sync)) {
      reject();
    } else {
      chrome.storage.sync.get([key], function (result) {
        if (result[key] === undefined) {
          reject();
        } else {
          resolve(result[key]);
        }
      });
    }
  });
};

export const writeSyncStorage = async (key, value) => {
  return new Promise((resolve, reject) => {
    if (!(chrome?.storage?.sync)) {
      reject();
    } else {
      chrome.storage.sync.set({ [key]: value }, function () {
        resolve();
      });
    }
  });
};
