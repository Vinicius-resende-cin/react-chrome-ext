import AnalysisService from "../services/AnalysisService";

const analysisService = new AnalysisService();

async function getAnalysisOutput(owner: string, repository: string, pull_number: number) {
  return await analysisService.getAnalysisOutput(owner, repository, pull_number);
}

/**
 * Inserts the new tab button. Fail if the tab is not fully loaded or the url is not a PR page.
 * @param context the context of the navigation event
 */
function insertNavTab(context: chrome.webNavigation.WebNavigationFramedCallbackDetails) {
  const { tabId, documentLifecycle: status, url } = context;

  // Guarantee that the tab is fully loaded
  if (status !== "active") return;

  // Filter the url to only run on PR files page
  if (url === undefined) throw new Error("url not found");
  const urlMatch = url.match(/^https:\/\/github\.com\/.+\/.+\/pull\/\d+.*$/);
  if (urlMatch === null) return;

  console.log("NavTab Listener called at: " + url);

  // add the new tab button
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ["./js/navtab.js"]
  });
}

/**
 * Inserts the content of the tab.
 * @param tabId the id of the tab to insert the content
 */
function insertTabContent(tabId: number) {
  console.log("TabContent inserted");

  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ["./js/navcontent.js"]
  });
}

// Listen for changes in the Hystory (event happens after DOM is loaded and doesnt fail when the page is loaded dynamically)
chrome.webNavigation.onHistoryStateUpdated.addListener(insertNavTab);

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Check if the message is valid
  if (request.message === "goto-dependencies") {
    // Get the tabId
    const tabId = sender.tab?.id;
    if (tabId === undefined) {
      sendResponse({ message: "tabId not found" });
      throw new Error("tabId not found");
    }

    // Insert the tab content
    insertTabContent(tabId);
    sendResponse({ message: "Navigating to dependencies tab" });
  } else {
    sendResponse({ message: "Invalid message" });
  }
});

export {};
