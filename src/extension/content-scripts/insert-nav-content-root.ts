const DEPENDENCIES_URL = `#dependencies`;

// get the turbo-frame element
const turboFrame = document.querySelector("turbo-frame#repo-content-turbo-frame");
if (turboFrame === null) throw new Error("turbo-frame not found");

// get the content container
const contentContainer = turboFrame.querySelector("div.clearfix");
if (contentContainer) {
  // make the container the right size
  contentContainer.className = "clearfix mt-4 px-3 px-md-4 px-lg-5";
}

// get the nav element
const nav = document.querySelector("[aria-label='Pull request tabs']");
if (nav === null) throw new Error("nav not found");

// remove the selected class from the current selected tab
const curSelected = nav.querySelector(".selected")!;
curSelected.removeAttribute("aria-current");
curSelected.classList.remove("selected");

// get the tab that was clicked
const tab = nav.querySelector(`.tabnav-tab[href='${DEPENDENCIES_URL}']`);
if (tab === null) throw new Error("tab not found");

// add the selected class to the clicked tab
tab.setAttribute("aria-current", "page");
tab.classList.add("selected");

// get the nav parent
const navParent = nav.parentElement!;

//get and delete the div that follows the nav parent
const oldContent = navParent.nextElementSibling!;
oldContent.remove();

// insert a new div with the content
const content = document.createElement("div");
content.id = "dependencies-content-root";
content.classList.add("pull-request-tab-content");
content.classList.add("is-visible");
content.innerHTML = `<h1>New tab works!</h1>`;
navParent.insertAdjacentElement("afterend", content);

// send a message to the background script to
(async () => {
  const response = await chrome.runtime.sendMessage({ message: "dependencies-root-ready" });
  console.log(response);
})();

export {};
