/*global chrome*/
/*global processPage*/
export function processCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true, lastFocusedWindow: true }, ([tab]) => {
    if (tab === undefined) {
      console.error('Active tab was not obtained.');
      return;
    }

    chrome.storage.sync.get(['options'], function (result) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: [ "pageProcessorInjectionScript.js" ]
      }, () => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          args: [result.options],
          func: args => processPage(args),
        });
      });
    });
  });
}
