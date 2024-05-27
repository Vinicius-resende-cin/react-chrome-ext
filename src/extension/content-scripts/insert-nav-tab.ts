const DEPENDENCIES_URL = `#dependencies`;

// add class to html element
const html = document.querySelector("html")!;
html.classList.add("dependencies-analysis-extension");

// get the nav element
const nav = document.querySelector("[aria-label='Pull request tabs']");
if (nav === null) throw new Error("nav not found");

// check if the tab already exists
const existingTab = nav.querySelector(`.tabnav-tab[href='${DEPENDENCIES_URL}']`);
if (existingTab !== null) {
  console.log("Tab already exists");
} else {
  // create a new tab
  const tab = document.createElement("a");
  tab.classList.add("tabnav-tab");
  tab.classList.add("flex-shrink-0");
  tab.href = DEPENDENCIES_URL;
  tab.innerHTML = "Dependencies";

  // sends a message to the extension when clicked
  tab.addEventListener("click", async () => {
    const response = await chrome.runtime.sendMessage({ message: "goto-dependencies" });
    console.log(response);
  });

  nav.appendChild(tab);
}

export {};
