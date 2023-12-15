import React from "react";
import { createRoot } from "react-dom/client";
import Popup from "../components/PopupCard/popup";

const POPUP_ROOT_ID = "dependency-alert-popup-root";

/**
 * Creates the root element for the popup.
 */
export function createPopupRoot() {
  const popupRoot = document.createElement("div");
  popupRoot.id = POPUP_ROOT_ID;
  popupRoot.style.display = "table-cell";

  return popupRoot;
}

/**
 * Inserts a popup into the specified element with the given content.
 *
 * @param lineElement - The HTML element to insert the popup into.
 * @param popupContent - The content of the popup.
 */
export function insertPopup(
  lineElement: HTMLElement,
  lineNumber: number,
  lineUrl: string,
  fileName: string,
  isSource: boolean = true
) {
  lineElement.querySelector(`#${POPUP_ROOT_ID}`)?.remove();

  const popupRoot = createPopupRoot();
  lineElement.appendChild(popupRoot);

  const root = createRoot(popupRoot);
  root.render(
    <React.StrictMode>
      <span className="pl-2" />
      <Popup lineNumber={lineNumber} lineUrl={lineUrl} filename={fileName} isSource={isSource} />
    </React.StrictMode>
  );
}
