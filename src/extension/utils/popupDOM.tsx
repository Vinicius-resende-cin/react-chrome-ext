import React from "react";
import { createRoot } from "react-dom/client";
import Popup from "../components/PopupCard/popup";
import { DependencyNode } from "./Dependency";

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
  analysis: string,
  type: string,
  fileName: string,
  relatedNodes: DependencyNode[]
) {
  lineElement.querySelector(`#${POPUP_ROOT_ID}`)?.remove();

  const popupRoot = createPopupRoot();
  lineElement.appendChild(popupRoot);

  const root = createRoot(popupRoot);
  root.render(
    <React.StrictMode>
      <span className="pl-2" />
      <Popup analysis={analysis} type={type} filename={fileName} relatedNodes={relatedNodes} />
    </React.StrictMode>
  );
}
