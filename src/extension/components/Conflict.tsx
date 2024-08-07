import { dependency } from "../../models/AnalysisOutput";

interface ConflictProps {
  dependency: dependency;
}

export default function Conflict({ dependency }: ConflictProps) {
  const highlight = (diffLine: HTMLElement) => {
    diffLine.classList.add("tw-border");
    diffLine.classList.add("tw-border-yellow-400");
  };

  const scrollAndHighlight = (diffLine: HTMLElement) => {
    highlight(diffLine);
    diffLine.scrollIntoView({ block: "center" });
  };

  const gotoDiff = (file: string, line: number) => {
    // try to get the line element by id
    const lineElement = document.getElementById(`${file}:${line}`);
    if (lineElement) {
      scrollAndHighlight(lineElement);
      return;
    }

    // if not found, search for the line in the diff
    const diffContainer = document.getElementById("diff-container");
    const diffFiles = diffContainer?.querySelectorAll(".d2h-file-wrapper");

    if (diffContainer && diffFiles) {
      // get the diff element of the file
      const diffContent = Array.from(diffFiles).filter((diffFile) => {
        const fileName = diffFile.querySelector(".d2h-file-name")?.textContent;
        return fileName?.endsWith(file);
      })[0];
      if (!diffContent) throw new Error(`Diff not found for file ${file}`);

      // get the line element
      const allLines = diffContent.querySelectorAll(`tr`);
      const lineElement = Array.from(allLines).filter((l) => {
        const lineNumber = l.querySelector(".line-num2")?.textContent;
        return lineNumber === line.toString();
      })[0];
      if (!lineElement) throw new Error(`Line ${line} not found in file ${file}`);

      // scroll to the line (and set its id)
      lineElement.id = `${file}:${line}`;
      scrollAndHighlight(lineElement);
    }
  };

  return (
    <div
      className="tw-mb-3 tw-cursor-pointer tw-w-fit"
      onClick={() =>
        gotoDiff(
          dependency.body.interference[0].location.file.replaceAll("\\", "/"),
          dependency.body.interference[0].location.line
        )
      }>
      <span>
        {dependency.label} ({dependency.type})&nbsp;
      </span>
      {dependency.body.interference[0].location.file !== "UNKNOWN" ? (
        <p className="tw-text-gray-400">
          in {dependency.body.interference[0].location.file}:{dependency.body.interference[0].location.line}
        </p>
      ) : null}
    </div>
  );
}
