import AnalysisService from "../services/AnalysisService";

const analysisService = new AnalysisService();

async function getAnalysisOutput(owner: string, repository: string, pull_number: number) {
  return await analysisService.getAnalysisOutput(owner, repository, pull_number);
}

/**
 * Inserts the new tab button.
 * @param tabId the id of the tab to insert the button
 */
function insertNavTab(tabId: number) {
  // add the new tab button
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      files: ["./js/insert-nav-tab.js"]
    },
    () => console.log("Dependencies tab inserted")
  );
}

/**
 * Inserts the content of the tab.
 * @param tabId the id of the tab to insert the content
 */
function insertTabContent(tabId: number) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      files: ["./js/insert-nav-content-root.js"]
    },
    () => console.log("Dependencies tab content root inserted")
  );
}

// Listen for changes in the Hystory (event happens after DOM is loaded and doesnt fail when the page is loaded dynamically)
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  insertNavTab(details.tabId);
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Get the tabId
  const tabId = sender.tab?.id;
  if (tabId === undefined) {
    sendResponse({ message: "tabId not found" });
    throw new Error("tabId not found");
  }

  // Check if the message is valid
  if (request.message === "goto-dependencies") {
    // Insert the tab content
    insertTabContent(tabId);
    sendResponse({ message: "Navigating to dependencies tab" });
  } else {
    sendResponse({ message: "Invalid message" });
  }
});

export {};
