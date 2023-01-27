/*global chrome*/
import { readSyncStorage } from './chromeUtils';

export async function ApplyProcessorOnCurrentTab () {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const options = await readSyncStorage('opts');

  console.log(tab, options);
  console.log("Got to the chrome.scripting.executeScript part.");

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => processLoadedPage(options), // TODO: Get the DOM with the options and POST them to backend, and then update page source
  });
};