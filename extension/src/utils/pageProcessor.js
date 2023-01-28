/*global chrome*/

export function processCurrentTab() {
  console.log("Posting a message 'processPage' to the chrome.runtime");
  chrome.runtime.sendMessage({ contentScriptQuery: 'processPage' });
}
