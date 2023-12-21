/**
 * Utility functions for working with GitHub DOM elements.
 */

/**
 * Returns all the DOM elements of the file diffs in the page.
 * Works in the revision page.
 * @returns A NodeList of DOM elements representing the file diffs.
 */
export function getAllFileDiffs() {
  return document.querySelectorAll("div[id^=diff-]");
}

/**
 * Returns the DOM element of the file diff that matches the given file path.
 * @param filePath The path of the file.
 * @param diffList The list of file diffs to search in (defaults to all the file diffs in the page).
 * @returns The DOM element of the file diff, or null if not found.
 */
export function getFileDiff(filePath: string, diffList: NodeListOf<Element> = getAllFileDiffs()) {
  for (let fileDiff of diffList) {
    if (fileDiff.getAttribute("data-tagsearch-path") === filePath) {
      return fileDiff;
    }
  }
  return null;
}

/**
 * Returns the DOM element of the table containing all the lines inside a file diff.
 * @param fileDiff The file diff to search in.
 * @returns The DOM element of the table containing the lines.
 */
export function getDiffVisibleLines(fileDiff: Element) {
  return fileDiff.querySelectorAll("tbody tr:not(.js-expandable-line)");
}

/**
 * Returns the DOM element of the line in the file diff that matches the given line number.
 * @param lineList The file diff or list of lines to search in.
 * @param lineNumber The number of the line.
 * @returns The DOM element of the line, or null if not found.
 */
export function getDiffLine(lineList: Element | NodeListOf<Element>, lineNumber: number) {
  if (lineList instanceof Element) {
    return lineList.querySelector(`tr:has(:nth-child(2):is(td[data-line-number="${lineNumber}"]))`);
  }

  for (let line of lineList) {
    if (line.querySelector(`:nth-child(2):is(td[data-line-number="${lineNumber}"])`) !== null) {
      return line;
    }
  }
  return null;
}

/**
 * Returns the index of the line in the line list that matches the given line number.
 * @param lineList The list of lines to search in.
 * @param lineNumber The number of the line.
 * @returns The index of the line, or null if not found.
 */
export function getLineIndex(lineList: NodeListOf<Element>, lineNumber: number) {
  for (let i = 0; i < lineList.length; i++) {
    if (lineList[i].querySelector(`td[data-line-number="${lineNumber}"]`) !== null) {
      return i;
    }
  }
  return null;
}

/**
 * Retrieves the HTML table cell element containing the text of a line in a GitHub file.
 *
 * @param line - The HTML element representing a line in the file.
 * @returns The HTML table cell element containing the text of the line.
 */
export function getLineTextCell(line: Element) {
  return line.querySelector("td.js-file-line") as HTMLTableCellElement;
}
