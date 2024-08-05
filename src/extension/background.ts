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
 * Inserts the content root element of the tab.
 * @param tabId the id of the tab to insert the content
 */
function insertTabContentRoot(tabId: number) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      files: ["./js/insert-nav-content-root.js"]
    },
    () => console.log("Dependencies tab content root inserted")
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
      files: ["./js/insert-nav-content.js"]
    },
    () => console.log("Dependencies tab content inserted")
  );
}

/**
 * Loads the CSS file.
 * @param tabId the id of the tab to load the CSS
 */
function loadCSS(tabId: number, cssFiles: string[]) {
  cssFiles.forEach((file) => {
    chrome.scripting.insertCSS(
      {
        target: { tabId: tabId },
        files: [`./js/${file}.css`]
      },
      () => console.log("CSS loaded")
    );
  });
}

/**
 * Checks if the url is a github pull request.
 * @param url the url to check
 * @returns true if the url is a github pull request, false otherwise
 */
function isUrlGithubPullRequest(url: string): boolean {
  const urlRegex = /^https:\/\/github.com\/.*\/pull\/\d+.*$/;
  return urlRegex.test(url);
}

// Listen for changes in the Hystory (event happens after DOM is loaded and doesnt fail when the page is loaded dynamically)
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  // Check if the url is a github pull request
  if (!isUrlGithubPullRequest(details.url)) return;

  loadCSS(details.tabId, ["diff2html", "tailwind"]);
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
    // Insert the tab content root
    insertTabContentRoot(tabId);
    sendResponse({ message: "Navigating to dependencies tab" });
  } else if (request.message === "dependencies-root-ready") {
    // Insert the content of the tab
    insertTabContent(tabId);
    sendResponse({ message: "Dependencies content inserted" });
  } else {
    sendResponse({ message: "Invalid message" });
  }
});

export {};
