// get url match
const urlMatch = window.location.href.match(/^(https:\/\/github\.com\/.+\/.+\/pull\/\d+).*$/);
if (urlMatch === null) throw new Error("urlMatch is null");
const baseUrl = urlMatch[1];

// add class to html element
const html = document.querySelector("html")!;
html.classList.add("dependencies-analysis-extension");

// get the nav element
const nav = document.querySelector("[aria-label='Pull request tabs']");
if (nav === null) throw new Error("nav not found");

// check if the tab already exists
const existingTab = nav.querySelector(`.tabnav-tab[href='${baseUrl}#dependencies']`);
if (existingTab !== null) {
  console.log("Tab already exists");
} else {
  // create a new tab
  const tab = document.createElement("a");
  tab.classList.add("tabnav-tab");
  tab.classList.add("flex-shrink-0");
  tab.href = `${baseUrl}#dependencies`;
  tab.innerHTML = "Dependencies";

  // toggle selected class on click
  tab.addEventListener("click", () => {
    // remove the selected class from the current selected tab
    const curSelected = nav.querySelector(".selected")!;
    curSelected.removeAttribute("aria-current");
    curSelected.classList.remove("selected");

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
    content.classList.add("pull-request-tab-content");
    content.classList.add("is-visible");
    content.innerHTML = `<h1>New tab works!</h1>`;
    navParent.insertAdjacentElement("afterend", content);
  });

  nav.appendChild(tab);
}

export {};
