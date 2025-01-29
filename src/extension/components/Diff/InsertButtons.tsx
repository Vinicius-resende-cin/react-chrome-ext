import { getClassFromJavaFilename } from "@extension/utils";

const linesToExpand = 3;
const buttonLines: { [fileName: string]: { [index: number]: HTMLTableRowElement } } = {};
const cachedLinesByFile: { [fileName: string]: NodeListOf<HTMLTableRowElement> } = {};

export const firstVisibleLine = (classFileName: string): number => {
  const lines = cachedLinesByFile[classFileName];
  for (let index = 0; index < lines.length; index++) {
    if (!lines[index].classList.contains("d2h-d-none")) {
      return index; 
    }
  }

  return -1;
};

export const lastVisibleLine = (classFileName: string): number => {
  const lines = cachedLinesByFile[classFileName];
  for (let index = lines.length-1; index > 0; index--) {
    if (!lines[index].classList.contains("d2h-d-none")) {
      return index; 
    }
  }

  return -1;
};

//function to reveal lines to up
export const expandTop = (diffFile: HTMLElement, lineButtonIndex: number, classFileName: string) => {
  const lines = cachedLinesByFile[classFileName];
  let lastLineBeforeButton = 0;
  let limit = -1;
  let linesExpandeds = lineButtonIndex - 2 * linesToExpand;

  lines.forEach((line, index) => {
    if (!line.classList.contains("d2h-d-none") && index < lineButtonIndex) {
      lastLineBeforeButton = index;
    }
  });

  if (linesExpandeds <= lastLineBeforeButton + 1) {
    limit = lastLineBeforeButton;
    buttonLines[classFileName][lineButtonIndex].remove();

    //checking button-down to remove
    if (lastLineBeforeButton != 0) {
      buttonLines[classFileName][limit].remove();
    }
  } else {
    limit = linesExpandeds;

    //Making a new button
    buttonLines[classFileName][lineButtonIndex].remove();

    const newTopButton = createButton("top", diffFile, limit, classFileName);
    insertButtonInCell(lines[limit], newTopButton, "top", limit, classFileName);
  }

  for (let i = lineButtonIndex - 1; i >= limit; i--) {
    lines[i].classList.remove("d2h-d-none");
  }
};

//function to show lines to down
export const expandBottom = (diffFile: HTMLElement, lineButtonIndex: number, classFileName: string) => {
  const lines = cachedLinesByFile[classFileName];
  let firstLineAfterButton = -1;
  let limit = -1;
  let linesExpandeds = lineButtonIndex + 2 * linesToExpand;

  lines.forEach((line, index) => {
    if (
      !line.classList.contains("d2h-d-none") &&
      index > lineButtonIndex &&
      firstLineAfterButton == -1 &&
      !line.classList.contains("button-container")
    ) {
      firstLineAfterButton = index;
    }
  });

  if (firstLineAfterButton == -1) {
    if (linesExpandeds >= lines.length) {
      limit = lines.length;
      buttonLines[classFileName][lineButtonIndex].remove();
    } else {
      limit = linesExpandeds;
      buttonLines[classFileName][lineButtonIndex].remove();

      const newBottomButton = createButton("down", diffFile, limit, classFileName);
      insertButtonInCell(lines[limit], newBottomButton, "bottom", limit, classFileName);
    }
  } else if (firstLineAfterButton != -1 && linesExpandeds >= firstLineAfterButton - 1) {
    limit = firstLineAfterButton;
    buttonLines[classFileName][lineButtonIndex].remove();
    buttonLines[classFileName][firstLineAfterButton].remove();
  } else if ((firstLineAfterButton != -1 && linesExpandeds < firstLineAfterButton) || linesExpandeds < lines.length) {
    limit = linesExpandeds;

    //Making a new button
    buttonLines[classFileName][lineButtonIndex].remove();

    const newBottomButton = createButton("down", diffFile, limit, classFileName);
    insertButtonInCell(lines[limit], newBottomButton, "bottom", limit, classFileName);
  }

  for (let i = lineButtonIndex + 1; i <= limit; i++) {
    lines[i].classList.remove("d2h-d-none");
  }
};

export const insertButtons = (diffFile: HTMLElement, fileName: string) => {
  const lines = diffFile.querySelectorAll("tr");
  let classFileName = getClassFromJavaFilename(fileName) || "null";
  cachedLinesByFile[classFileName] = lines;

  let firstVisibleIndex = -1;
  let lastVisibleIndex = -1;
  let previousLineNumber = -1;
  let lastVisibleLine: HTMLTableRowElement;

  // Loop through lines and find visible lines
  lines.forEach((line, index) => {
    const lineNumberElementOne = line.querySelector(".line-num1");
    const lineNumberOne = lineNumberElementOne ? parseInt(lineNumberElementOne.textContent || "", 10) : null;

    const lineNumberElementTwo = line.querySelector(".line-num2");
    const lineNumberTwo = lineNumberElementTwo ? parseInt(lineNumberElementTwo.textContent || "", 10) : null;

    if ((lineNumberOne !== null || lineNumberTwo !== null) && !line.classList.contains("d2h-d-none")) {
      // Detect the first visible line
      if (firstVisibleIndex === -1) {
        firstVisibleIndex = index;

        if (firstVisibleIndex > 1) {
          // Insert "expand up" button before the first visible line
          const topButton = createButton("top", diffFile, index, classFileName);
          insertButtonInCell(line, topButton, "top", index, classFileName);
        }
      }

      // Detect out of order lines and insert "expand bottom" and "expand up" accordingly
      if (previousLineNumber !== -1) {
        const outOfOrder =
          (lineNumberOne !== null && lineNumberOne > previousLineNumber + 1) ||
          (lineNumberTwo !== null && lineNumberTwo > previousLineNumber + 1);

        if (outOfOrder) {
          const currentLastVisibleIndex = lastVisibleIndex;

          // Insert "expand bottom" after previous line
          const bottomButton = createButton("down", diffFile, currentLastVisibleIndex, classFileName);
          insertButtonInCell(lastVisibleLine, bottomButton, "bottom", lastVisibleIndex, classFileName);

          // Insert "expand up" before current out-of-order line
          const newTopButton = createButton("top", diffFile, index, classFileName);
          insertButtonInCell(line, newTopButton, "top", index, classFileName);
        }
      }

      previousLineNumber = Math.max(lineNumberOne ?? -1, lineNumberTwo ?? -1);
      lastVisibleIndex = index;
      lastVisibleLine = line;
    }
  });

  // Insert "expand bottom" after the last visible line
  if (lastVisibleIndex !== -1 && lastVisibleIndex != lines.length - 1) {
    const bottomButton = createButton("down", diffFile, lastVisibleIndex, classFileName);
    insertButtonInCell(lines[lastVisibleIndex], bottomButton, "bottom", lastVisibleIndex, classFileName);
  }
};

const insertButtonInCell = (
  line: HTMLElement,
  button: HTMLElement,
  position: "top" | "bottom",
  index: number,
  classFileName: string
) => {
  const newTr = document.createElement("tr");
  newTr.classList.add("button-container");

  const newTd = document.createElement("td");
  newTd.colSpan = line.querySelectorAll("td").length;
  newTd.classList.add("button-cell", `button-${position}`);

  newTd.appendChild(button);

  newTr.appendChild(newTd);
  if (!buttonLines[classFileName]) {
    buttonLines[classFileName] = {};
  }

  buttonLines[classFileName][index] = newTr;

  if (position == "top") {
    line.parentNode?.insertBefore(newTr, line);
  } else {
    if (line.nextSibling) {
      line.parentNode?.insertBefore(newTr, line.nextSibling);
    } else {
      line.parentNode?.appendChild(newTr);
    }
  }
};

function createButton(position: "top" | "down", diffFile: HTMLElement, index: number, classFileName: string) {
  const button = document.createElement("button");
  button.classList.add("button-style");

  if (position == "top") {
    button.innerHTML = "&#x25B2;";
    button.onclick = () => expandTop(diffFile, index, classFileName);
    button.title = "Expand Up";
  } else {
    button.innerHTML = "&#x25BC;";
    button.onclick = () => expandBottom(diffFile, index, classFileName);
    button.title = "Expand Down";
  }

  return button;
}
