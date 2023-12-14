chrome.tabs.onUpdated.addListener((tabId, changeinfo, tab) => {
  // Guarantee that the tab is fully loaded
  if (changeinfo.status !== "complete") return;

  // Filter the url to only run on PR files page
  if (tab.url === undefined) throw new Error("tab.url is undefined");
  const urlMatch = tab.url.match(/^https:\/\/github\.com\/.+\/.+\/pull\/\d+\/files.*$/);
  if (urlMatch === null) return;

  console.log("Listener called at: " + tab.url);

  // Execute the content script
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ["./js/content.js"]
  });
});

export {};
