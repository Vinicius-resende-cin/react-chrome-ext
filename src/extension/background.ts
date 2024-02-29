import AnalysisService from "../services/AnalysisService";

const analysisService = new AnalysisService();

async function getAnalysisOutput(owner: string, repository: string, pull_number: number) {
  return await analysisService.getAnalysisOutput(owner, repository, pull_number);
}

chrome.tabs.onUpdated.addListener(async (tabId, changeinfo, tab) => {
  // Guarantee that the tab is fully loaded
  if (changeinfo.status !== "complete") return;

  // Filter the url to only run on PR files page
  if (tab.url === undefined) throw new Error("tab.url is undefined");
  const urlMatch = tab.url.match(/^https:\/\/github\.com\/(.+)\/(.+)\/pull\/(\d+)\/files.*$/);
  if (urlMatch === null) return;

  console.log("Listener called at: " + tab.url);

  const owner = urlMatch[1];
  const repository = urlMatch[2];
  const pull_number = parseInt(urlMatch[3]);
  console.log("Owner: " + owner);
  console.log("Repository: " + repository);
  console.log("Pull number: " + pull_number);

  // Execute the content script
  await getAnalysisOutput(owner, repository, pull_number).then((analysis) => {
    chrome.storage.local.set({ analysis: analysis }, () => {
      // Execute the content script
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["./js/content.js"]
      });
    });
  });
});

export {};
