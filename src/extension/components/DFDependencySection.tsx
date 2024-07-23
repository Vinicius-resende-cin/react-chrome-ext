/* eslint-disable jsx-a11y/anchor-is-valid */
import { dependency } from "../../models/AnalysisOutput";

interface DFDependencySectionProps {
  dependencies: dependency[];
}

export default function DFDependencySection({ dependencies }: DFDependencySectionProps) {
  const gotoDiff = (file: string, line: number) => {
    // try to get the line element by id
    const lineElement = document.getElementById(`${file}:${line}`);
    if (lineElement) {
      lineElement.scrollIntoView({ block: "center" });
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
      lineElement.scrollIntoView({ block: "center" });
    }
  };

  return dependencies.length ? (
    <div id="df-dependency-container">
      {dependencies.map((d, i) => (
        <div key={i} className="mb-3">
          <h2>{d.label}</h2>
          <p>{d.body.description}</p>
          <ul>
            {[d.body.interference[0], d.body.interference[d.body.interference.length - 1]].map((i, j) => (
              <li key={j} className={j % 2 === 1 ? "text-gray-200" : "text-orange-500"}>
                <p>{i.text}</p>
                <p
                  onClick={() => gotoDiff(i.location.file.replaceAll("\\", "/"), i.location.line)}
                  className="cursor-pointer">
                  {i.location.file !== "UNKNOWN" ? i.location.file : i.location.class}:{i.location.line}
                </p>
                <p>
                  {i.location.class}:{i.location.method.replace("()", "")}
                  {"()"}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  ) : (
    <></>
  );
}
