import { interferenceNode, modLine } from "../../models/AnalysisOutput";

const highlight = (diffLine: HTMLElement) => {
  diffLine.classList.add("pl-line-highlight");
  setTimeout(() => diffLine.classList.remove("pl-line-highlight"), 5000);
};

const removeHighlight = (diffLine: HTMLElement) => {
  diffLine.classList.remove("pl-line-highlight");
};

const scrollAndHighlight = (diffLine: HTMLElement) => {
  highlight(diffLine);
  diffLine.scrollIntoView({ block: "center" });
};

const setColorFromBranch = (diffLine: HTMLElement, branch: "L" | "R", colorType: "ins" | "del") => {
  // set the color for all childs
  diffLine.querySelectorAll("td").forEach((td) => {
    td.classList.add(`d2h-${colorType}${branch === "L" ? "-left" : ""}`);
  });
};

const checkLineModificationType = (file: string, line: number) => {
  // get the diffLine element
  let diffLine = getDiffLine(file, line);

  // get child element (that contains the line style)
  diffLine = diffLine.querySelector("td") as HTMLElement;

  // check if the line was added, removed or modified
  if (diffLine.classList.contains("d2h-ins") || diffLine.classList.contains("d2h-ins-left")) return "ins";
  else if (diffLine.classList.contains("d2h-del") || diffLine.classList.contains("d2h-del-left"))
    return "del";
  else if (diffLine.classList.contains("d2h-change")) return "change";
  else return null;
};

const findSourceBranch = (node: interferenceNode, modifiedLines: modLine[]) => {
  // get the filename of the first node in the stack trace
  const firstNodeFromFile = node.stackTrace?.[0].class.split(".").pop() + ".java";
  if (!firstNodeFromFile) return null;

  // get the line number of the first node in the stack trace
  const firstNodeFromLine = node.stackTrace?.[0].line;
  if (!firstNodeFromLine) return null;

  // check if the line is in the modified lines
  const fileModifiedLines = modifiedLines.find((ml) => ml.file.endsWith(firstNodeFromFile));
  if (!fileModifiedLines) return null;

  let branch: "L" | "R" | null = null;
  if (
    fileModifiedLines.leftAdded.includes(firstNodeFromLine) ||
    fileModifiedLines.leftRemoved.includes(firstNodeFromLine)
  )
    branch = "L";
  else if (
    fileModifiedLines.rightAdded.includes(firstNodeFromLine) ||
    fileModifiedLines.rightRemoved.includes(firstNodeFromLine)
  )
    branch = "R";
  else return null;

  // check if the line was added or removed
  const lineType: "ins" | "del" | "change" | null = checkLineModificationType(
    firstNodeFromFile,
    firstNodeFromLine
  );
  if (!lineType) return null;

  return { branch, lineType: lineType === "change" ? "ins" : lineType };
};

const getDiffLine = (file: string, line: number) => {
  // try to get the line element by id
  let lineElement = document.getElementById(`${file}:${line}`);
  if (lineElement) return lineElement;

  // if not found, search for the line in the diff
  const diffContainer = document.getElementById("diff-container");
  const diffFiles = diffContainer?.querySelectorAll(".d2h-file-wrapper");
  if (!diffContainer || !diffFiles) throw new Error("Diff not found");

  // get the diff element of the file
  const diffContent = Array.from(diffFiles).filter((diffFile) => {
    const fileName = diffFile.querySelector(".d2h-file-name")?.textContent;
    return fileName?.endsWith(file);
  })[0];
  if (!diffContent) throw new Error(`Diff not found for file ${file}`);

  // get the line element
  const allLines = diffContent.querySelectorAll(`tr`);
  lineElement = Array.from(allLines).filter((l) => {
    const lineNumber = l.querySelector(".line-num2")?.textContent;
    return lineNumber === line.toString();
  })[0];
  if (!lineElement) throw new Error(`Line ${line} not found in file ${file}`);

  // set the id and return
  lineElement.id = `${file}:${line}`;
  return lineElement;
};

const gotoDiffConflict = (
  file: string,
  l1: interferenceNode,
  l2: interferenceNode,
  modifiedLines: modLine[]
) => {
  // get the first and last lines of the conflict
  const lineFrom = getDiffLine(file, l1.location.line);
  const lineTo = getDiffLine(file, l2.location.line);

  // get the source branch for each line
  const sourceBranchFrom = findSourceBranch(l1, modifiedLines);
  const sourceBranchTo = findSourceBranch(l2, modifiedLines);

  // set the colors of the lines
  if (sourceBranchFrom) setColorFromBranch(lineFrom, sourceBranchFrom.branch, sourceBranchFrom.lineType);
  else highlight(lineFrom);

  if (sourceBranchTo) setColorFromBranch(lineTo, sourceBranchTo.branch, sourceBranchTo.lineType);
  else highlight(lineTo);

  // set navigation between both lines
  lineFrom.onclick = () => {
    removeHighlight(lineFrom);
    scrollAndHighlight(lineTo);
  };
  lineTo.onclick = () => {
    removeHighlight(lineTo);
    scrollAndHighlight(lineFrom);
  };

  scrollAndHighlight(lineFrom);

  return [lineFrom, lineTo];
};

export { gotoDiffConflict, highlight, removeHighlight, scrollAndHighlight, getDiffLine };
