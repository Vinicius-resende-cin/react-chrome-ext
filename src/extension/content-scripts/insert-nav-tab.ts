const DEPENDENCIES_URL = `#dependencies`;

/**
 * Checks if the url is a github pull request.
 * @param url the url to check
 * @returns true if the url is a github pull request, false otherwise
 */
function isUrlGithubPullRequest(url: string): boolean {
  const urlRegex = /^https:\/\/github.com\/.*\/pull\/\d+.*$/;
  return urlRegex.test(url);
}

/**
 * Inserts the dependencies tab in the pull request page.
 */
const insertNavTab = () => {
  // check if the url is a github pull request
  if (!isUrlGithubPullRequest(window.location.href)) return;

  // get the nav element
  const nav = document.querySelector("[aria-label='Pull request tabs']");
  if (nav === null) return console.warn("nav not found");

  queueTask(() =>
    runSilent(() => {
      // check if the tab already exists
      const existingTab = nav.querySelector(`.tabnav-tab[href='${DEPENDENCIES_URL}']`);
      if (existingTab !== null) {
        return;
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
    })
  );
};

// observer logic (based on https://github.com/Justineo/github-hovercard 's observer logic)
const observer = new MutationObserver(() => {
  insertNavTab();
});

/**
 * Starts observing the DOM.
 */
const startObserve = () => {
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};

/**
 * Stops observing the DOM.
 */
const stopObserve = () => {
  observer.disconnect();
};

// auxiliary functions

/**
 * Run a method in the next browsers's tick.
 * @param fn the method to run
 */
const nextTick = (fn: () => void) => {
  let p = Promise.resolve();
  p.then(fn);
};

/**
 * Runs a method without observer callbacks.
 * @param fn the method to run
 */
const runSilent = (fn: () => void) => {
  stopObserve();
  fn();

  // nextTick will run **after** MutationObserver callbacks
  nextTick(startObserve);
};

// task queue logic (based on https://github.com/Justineo/github-hovercard 's task queue logic)
const taskQueue: Function[] = [];

/**
 * Queues a task to run in the next idle callback.
 * @param fn the task to run
 */
const queueTask = (fn: Function) => {
  if (!taskQueue.length) {
    scheduleRunTaskQueue();
  }

  taskQueue.push(fn);
};

/**
 * Schedules the task queue to run in the next idle callback.
 */
const scheduleRunTaskQueue = () => {
  requestIdleCallback(runTaskQueue);
};

/**
 * Runs the task queue.
 * @param deadline the idle deadline
 */
const runTaskQueue = (deadline: IdleDeadline) => {
  while (deadline.timeRemaining() > 0 && taskQueue.length) {
    let fn = taskQueue.shift();
    if (fn) fn();
  }

  if (taskQueue.length) {
    scheduleRunTaskQueue();
  }
};

// start observing
queueTask(startObserve);

export {};
