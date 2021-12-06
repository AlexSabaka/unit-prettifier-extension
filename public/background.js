/*global chrome*/
chrome.runtime.onInstalled.addListener(() => {
  console.log('UnitPrettifier successfully installed!');
  console.log('See, https://github.com/casendler/react-chrome-extension-mv3 repository for details on how to build React based Chrome Extension');
  return;
});
