import React from "react";
import { createRoot } from "react-dom/client";
import Popup from "./PopupCard/popup";
import * as githubDOM from "./utils/githubDOMUtils";
import "./content.css";

const POPUP_ROOT_ID = "dependency-alert-popup-root";

/**
 * Creates the root element for the popup.
 */
function createPopupRoot() {
  const popupRoot = document.createElement("div");
  popupRoot.id = POPUP_ROOT_ID;
  popupRoot.style.display = "table-cell";

  return popupRoot;
}

/**
 * Inserts a popup into the specified element with the given content.
 *
 * @param element - The HTML element to insert the popup into.
 * @param popupContent - The content of the popup.
 */
function insertPopup(
  element: HTMLElement,
  lineNumber: number,
  lineUrl: string,
  isSource: boolean = true
) {
  element.querySelector(`#${POPUP_ROOT_ID}`)?.remove();

  const popupRoot = createPopupRoot();
  element.appendChild(popupRoot);

  const root = createRoot(popupRoot);
  root.render(
    <React.StrictMode>
      <span className="pl-2" />
      <Popup lineNumber={lineNumber} lineUrl={lineUrl} isSource={isSource} />
    </React.StrictMode>
  );
}

function main() {
  const fileDiff = githubDOM.getFileDiff("src/main/java/Text.java");
  if (fileDiff === null) {
    throw new Error("[EXT_WARNING] No diff found in this page");
  }

  const lineList = githubDOM.getDiffVisibleLines(fileDiff);
  if (lineList === null) {
    throw new Error(
      `[EXT_ERROR] Could not find the list of lines in the diff ${fileDiff.getAttribute(
        "data-tagsearch-path"
      )}`
    );
  }

  const fromLineIndex = githubDOM.getLineIndex(lineList, 34);
  const toLineIndex = githubDOM.getLineIndex(lineList, 35);
  if (fromLineIndex === null || toLineIndex === null) {
    throw new Error(
      `[EXT_ERROR] Could not find the line index of the modified line in the diff ${fileDiff.getAttribute(
        "data-tagsearch-path"
      )}`
    );
  }

  const fromLine = lineList[fromLineIndex];
  const toLine = lineList[toLineIndex];

  const fromLineText = fromLine.querySelector("td.js-file-line") as HTMLTableCellElement;
  const toLineText = toLine.querySelector("td.js-file-line") as HTMLTableCellElement;
  if (fromLineText === null || toLineText === null) {
    throw new Error(
      `[EXT_ERROR] Could not find the line text in the diff ${fileDiff.getAttribute(
        "data-tagsearch-path"
      )}`
    );
  }

  const fromLineNumberMatch = fromLine.children[1].id.match(`${fileDiff.id}R(\\d+)`);
  const toLineNumberMatch = toLine.children[1].id.match(`${fileDiff.id}R(\\d+)`);
  if (fromLineNumberMatch === null || toLineNumberMatch === null) {
    throw new Error(
      `[EXT_ERROR] Could not find the line number in the diff ${fileDiff.getAttribute(
        "data-tagsearch-path"
      )}`
    );
  }

  const fromLineNumber = parseInt(fromLineNumberMatch[1]);
  const toLineNumber = parseInt(toLineNumberMatch[1]);

  insertPopup(fromLineText, toLineNumber, toLineNumberMatch[0], true);
  insertPopup(toLineText, fromLineNumber, fromLineNumberMatch[0], false);
}

main();
