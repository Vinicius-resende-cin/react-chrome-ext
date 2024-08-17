const highlight = (diffLine: HTMLElement) => {
  diffLine.classList.add("pl-line-highlight");
};

const removeHighlight = (diffLine: HTMLElement) => {
  diffLine.classList.remove("pl-line-highlight");
};

const scrollAndHighlight = (diffLine: HTMLElement) => {
  highlight(diffLine);
  diffLine.scrollIntoView({ block: "center" });
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

const gotoDiffConflict = (file: string, l1: number, l2: number) => {
  // get the first and last lines of the conflict
  const lineFrom = getDiffLine(file, l1);
  const lineTo = getDiffLine(file, l2);

  // highlight both lines
  highlight(lineFrom);
  highlight(lineTo);

  // set navigation between both lines
  lineFrom.onclick = () => scrollAndHighlight(lineTo);
  lineTo.onclick = () => scrollAndHighlight(lineFrom);

  scrollAndHighlight(lineFrom);

  return [lineFrom, lineTo];
};

export { gotoDiffConflict, highlight, removeHighlight, scrollAndHighlight, getDiffLine };
