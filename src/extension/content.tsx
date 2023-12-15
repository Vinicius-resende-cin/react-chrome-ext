import * as popupDOM from "./utils/popupDOM";
import * as githubDOM from "./utils/githubDOM";
import "./content.css";

function main() {
  const filename = "src/main/java/br/unb/cic/analysis/AbstractMergeConflictDefinition.java";
  const filename2 = "src/main/java/br/unb/cic/analysis/Main.java";

  const allDiffs = githubDOM.getAllFileDiffs();

  const fileDiff = githubDOM.getFileDiff(filename, allDiffs);
  if (fileDiff === null) {
    throw new Error(`[EXT_WARNING] No diff found in this page for file ${filename}`);
  }

  const fileDiff2 = githubDOM.getFileDiff(filename2, allDiffs);
  if (fileDiff2 === null) {
    throw new Error(`[EXT_WARNING] No diff found in this page for file ${filename2}`);
  }

  const lineList = githubDOM.getDiffVisibleLines(fileDiff);
  if (lineList === null) {
    throw new Error(
      `[EXT_ERROR] Could not find the list of lines in the diff ${fileDiff.getAttribute(
        "data-tagsearch-path"
      )}`
    );
  }

  const lineList2 = githubDOM.getDiffVisibleLines(fileDiff2);
  if (lineList2 === null) {
    throw new Error(
      `[EXT_ERROR] Could not find the list of lines in the diff ${fileDiff2.getAttribute(
        "data-tagsearch-path"
      )}`
    );
  }

  const fromLineIndex = githubDOM.getLineIndex(lineList, 106);
  const toLineIndex = githubDOM.getLineIndex(lineList2, 304);
  if (fromLineIndex === null || toLineIndex === null) {
    throw new Error(`[EXT_ERROR] Could not find the line index of the line!`);
  }

  const fromLine = lineList[fromLineIndex];
  const toLine = lineList2[toLineIndex];

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
  const toLineNumberMatch = toLine.children[1].id.match(`${fileDiff2.id}R(\\d+)`);
  if (fromLineNumberMatch === null || toLineNumberMatch === null) {
    throw new Error(
      `[EXT_ERROR] Could not find the line number in the diff ${fileDiff.getAttribute(
        "data-tagsearch-path"
      )}`
    );
  }

  const fromLineNumber = parseInt(fromLineNumberMatch[1]);
  const toLineNumber = parseInt(toLineNumberMatch[1]);

  popupDOM.insertPopup(fromLineText, toLineNumber, toLineNumberMatch[0], filename2, true);
  popupDOM.insertPopup(toLineText, fromLineNumber, fromLineNumberMatch[0], filename, false);
}

main();
