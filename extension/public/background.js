/*global chrome*/
chrome.runtime.onInstalled.addListener(() => {
  console.log('EasyMeasure extension successfully installed!');
  console.log('See, https://github.com/casendler/react-chrome-extension-mv3 repository for details on how to build React based Chrome Extension');
  return;
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.contentScriptQuery != 'processPage') {
    sendResponse(false);
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true, lastFocusedWindow: true }, ([tab]) => {
    if (tab === undefined) {
      console.error('Active tab was not obtained.');
      sendResponse(false);
      return;
    }

    console.log(`Executing script in the tab: ${tab.id}`);
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        function postPageForProcessing(result) {
          const url = `http://localhost:3000/transform`;
          const reqHeaders = {
            Accept: "application/json, application/xml, text/plain, text/html, *.*",
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "localhost",
          };
          const payload = {
            method: "POST",
            headers: reqHeaders,
            body: JSON.stringify({ options: result.options, body: document.body.innerHTML }),
          };
        
          console.log(`POST-ing a request to '${url}', with data: `);
          console.log(payload);
          console.log(document.body.innerHTML)
        
          fetch(url, payload)
            .then((response) => response.json())
            .then((response) => document.body.innerHTML = response.body)
            .catch((error) => console.error(error));
        }

        chrome.storage.sync.get(['options'], postPageForProcessing);
      }
    });

    sendResponse(true);
  });
});
