import AnalysisService from "../services/AnalysisService";

const analysisService = new AnalysisService();

async function getAnalysisOutput(owner: string, repository: string, pull_number: number) {
  return await analysisService.getAnalysisOutput(owner, repository, pull_number);
}

async function insertNavTab(context: chrome.webNavigation.WebNavigationFramedCallbackDetails) {
  const { tabId, documentLifecycle: status, url } = context;

  // // Guarantee that the tab is fully loaded
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

// TODO: Implement the content script (move the script to another file)
// async function insertTabContent(context: chrome.webNavigation.WebNavigationFramedCallbackDetails) {
//   // remove the selected class from the current selected tab
//   const curSelected = nav.querySelector(".selected")!;
//   curSelected.removeAttribute("aria-current");
//   curSelected.classList.remove("selected");

//   // add the selected class to the clicked tab
//   tab.setAttribute("aria-current", "page");
//   tab.classList.add("selected");

//   // get the nav parent
//   const navParent = nav.parentElement!;

//   //get and delete the div that follows the nav parent
//   const oldContent = navParent.nextElementSibling!;
//   oldContent.remove();

//   // insert a new div with the content
//   const content = document.createElement("div");
//   content.classList.add("pull-request-tab-content");
//   content.classList.add("is-visible");
//   content.innerHTML = `<h1>New tab works!</h1>`;
//   navParent.insertAdjacentElement("afterend", content);
// }

chrome.webNavigation.onHistoryStateUpdated.addListener(insertNavTab);

export {};
