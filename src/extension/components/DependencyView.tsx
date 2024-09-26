import { createElement, useEffect, useState } from "react";
import AnalysisService from "../../services/AnalysisService";
import { dependency, modLine } from "../../models/AnalysisOutput";
import { Diff2HtmlConfig, html as diffHtml } from "diff2html";
import { ColorSchemeType } from "diff2html/lib/types";
import {
  gotoDiffConflict,
  unsetAsConflictLine,
  updateLocationFromStackTrace
} from "../utils/diff-navigation";
import Conflict from "./Conflict";

const analysisService = new AnalysisService();
const linesToExpand = 3;

const diffConfig: Diff2HtmlConfig = {
  outputFormat: "line-by-line",
  drawFileList: true,
  renderNothingWhenEmpty: true,
  matching: "words",
  diffStyle: "word",
  colorScheme: ColorSchemeType.AUTO
};

async function getAnalysisOutput(owner: string, repository: string, pull_number: number) {
  return await analysisService.getAnalysisOutput(owner, repository, pull_number);
}

interface DependencyViewProps {
  owner: string;
  repository: string;
  pull_number: number;
}

export default function DependencyView({ owner, repository, pull_number }: DependencyViewProps) {
  const [dependencies, setDependencies] = useState<dependency[]>([]);
  const [isCollapsed, setIsCollapsed] = useState<{ [key: string]: boolean }>({}); // State to control if the code is collapsed or not
  const [diff, setDiff] = useState<string>("");
  const [modifiedLines, setModifiedLines] = useState<modLine[]>([]);
  const [activeConflict, setActiveConflict] = useState<HTMLElement[]>([]); // lines of the active conflict

  const filterDuplicatedDependencies = (dependencies: dependency[]) => {
    const uniqueDependencies: dependency[] = [];
    dependencies.forEach((dep) => {
      if (
        !uniqueDependencies.some(
          (d) =>
            d.body.interference[0].location.file === dep.body.interference[0].location.file &&
            d.body.interference[0].location.line === dep.body.interference[0].location.line &&
            d.body.interference[d.body.interference.length - 1].location.file ===
              dep.body.interference[dep.body.interference.length - 1].location.file &&
            d.body.interference[d.body.interference.length - 1].location.line ===
              dep.body.interference[dep.body.interference.length - 1].location.line
        )
      ) {
        uniqueDependencies.push(dep);
      }
    });

    return uniqueDependencies;
  };

  const changeActiveConflict = (dep: dependency) => {
    // remove the styles from the previous conflict
    if (activeConflict.length) {
      activeConflict.forEach((line) => {
        unsetAsConflictLine(line);
      });
    }

    // get the filename and line numbers of the conflict
    let file = dep.body.interference[0].location.file.replaceAll("\\", "/"); // filename
    let lineFrom = dep.body.interference[0]; // first line
    let lineTo = dep.body.interference[dep.body.interference.length - 1]; // last line

    if (file === "UNKNOWN") {
      // conflict in an unknown file
      // check if stack trace has a valid file
      if (
        !dep.body.interference[0].stackTrace ||
        !dep.body.interference[dep.body.interference.length - 1].stackTrace
      )
        throw new Error("File not found: Invalid stack trace");

      // get the stack trace file path
      let javaFilePath = dep.body.interference[0].stackTrace[0].class.replaceAll(".", "/");

      // assign the data based on stack trace
      file = `${javaFilePath}.java`;
      lineFrom.location.line = dep.body.interference[0].stackTrace[0].line;
      lineTo.location.line = dep.body.interference[dep.body.interference.length - 1].stackTrace![0].line;
    }

    // set the new conflict as active
    const newConflict = gotoDiffConflict(file, lineFrom, lineTo, modifiedLines);
    setActiveConflict(newConflict);
  };

  useEffect(() => {
    getAnalysisOutput(owner, repository, pull_number).then((response) => {
      let dependencies = response.getDependencies();
      dependencies.forEach((dep) => {
        if (
          dep.body.interference[0].location.file === "UNKNOWN" ||
          dep.body.interference[dep.body.interference.length - 1].location.file === "UNKNOWN"
        )
          updateLocationFromStackTrace(dep);
      });
      dependencies = filterDuplicatedDependencies(dependencies);

      setDependencies(
        dependencies.sort((a, b) => {
          const aStartLine = a.body.interference[0].location.line;
          const bStartLine = b.body.interference[0].location.line;
          const aEndLine = a.body.interference[a.body.interference.length - 1].location.line;
          const bEndLine = b.body.interference[b.body.interference.length - 1].location.line;

          if (aStartLine < bStartLine) return -1;
          if (aStartLine > bStartLine) return 1;
          if (aEndLine < bEndLine) return -1;
          if (aEndLine > bEndLine) return 1;
          return 0;
        })
      );
      setDiff(response.getDiff());
      setModifiedLines(response.data.modifiedLines ?? []);
    });
  }, [owner, repository, pull_number]);

  useEffect(() => {
    const updateDiffColors = () => {
      const diffContainer = document.getElementById("diff-container");
      const diffFiles = diffContainer?.querySelectorAll(".d2h-file-wrapper");

      if (diffContainer && diffFiles) {
        // For each modified line, update the colors of the diff
        for (let modLine of modifiedLines) {
          const modLineFile = modLine.file;

          // get the diff element of the file
          const diffContent = Array.from(diffFiles).filter((diffFile) => {
            const fileName = diffFile.querySelector(".d2h-file-name")?.textContent;
            return fileName?.endsWith(modLineFile);
          })[0];
          if (!diffContent) throw new Error(`Diff not found for file ${modLineFile}`);

          // get the insertions and deletions
          const insertions = diffContent.querySelectorAll("tr:has(td.d2h-ins)");
          const deletions = diffContent.querySelectorAll("tr:has(td.d2h-del)");

          // update the colors of the insertions
          for (let line of insertions) {
            const lineNumber = line.querySelector(".line-num2")?.textContent;
            if (lineNumber && modLine.leftAdded.includes(Number.parseInt(lineNumber))) {
              // Line was added by left
              line.firstElementChild?.classList.remove("d2h-ins");
              line.firstElementChild?.classList.add("d2h-ins-left");
              line.lastElementChild?.classList.remove("d2h-ins");
              line.lastElementChild?.classList.add("d2h-ins-left");
            }
          }

          // update the colors of the deletions
          for (let line of deletions) {
            const lineNumber = line.querySelector(".line-num2")?.textContent;
            if (lineNumber && modLine.leftRemoved.includes(Number.parseInt(lineNumber))) {
              // Line was removed by left
              line.firstElementChild?.classList.remove("d2h-del");
              line.firstElementChild?.classList.add("d2h-del-left");
              line.lastElementChild?.classList.remove("d2h-del");
              line.lastElementChild?.classList.add("d2h-del-left");
            }
          }
        }
      }
    };

    //function to showing only context lines
    const collapsedViewed = () => {
      const diffFiles = document.querySelectorAll<HTMLElement>(".d2h-file-wrapper");

      diffFiles.forEach((diffFile) => {
        const lines = diffFile.querySelectorAll("tr");
        let linesAlreadyShown = new Set<number>();

        //Checking the changed lines
        lines.forEach((line, index) => {
          if (line.querySelector('.d2h-ins') || line.querySelector('.d2h-del')) {
            for (let i = Math.max(0, index - 3); i <= Math.min(lines.length - 1, index + 3); i++) {
              lines[i].classList.remove("d2h-d-none");
              linesAlreadyShown.add(i);
            }
          }else if (!linesAlreadyShown.has(index)) {
            line.classList.add("d2h-d-none");
          }
        })
      })
    }
    updateDiffColors();
    collapsedViewed();
  }, [modifiedLines]);

  // adding the listingEventChange on input viewed
  useEffect(() => {
    const checkboxInputs = document.querySelectorAll<HTMLElement>(".d2h-file-collapse-input");

    const handleChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const fileHeaderDiv = target.closest(".d2h-file-header");
      const fileNameSpan = fileHeaderDiv?.querySelector(".d2h-file-name");
      const fileName = fileNameSpan?.textContent || "";
      setIsCollapsed((prevState) => ({
        ...prevState,
        [fileName]: target.checked
      }));
    };

    checkboxInputs.forEach((checkboxInput) => {
      if (checkboxInput) {
        checkboxInput.addEventListener("change", handleChange);
      }
    });

    // cleaning the event
    return () => {
      checkboxInputs.forEach((checkboxInput) => {
        if (checkboxInput) {
          checkboxInput.removeEventListener("change", handleChange);
        }
      });
    };
  }, [diff]);

  //Collapsing the diff file checked as viewed
  useEffect(() => {
    const diffFiles = document.querySelectorAll<HTMLElement>(".d2h-file-wrapper");

    // Add or remove the class `d2h-d-none` based on state `isCollapsed`
    diffFiles.forEach((diffFile) => {
      const fileName = diffFile.querySelector(".d2h-file-name")?.textContent || "";
      const diffContainer = diffFile.querySelector(".d2h-file-diff");

      if (isCollapsed[fileName]) {
        diffContainer?.classList.add("d2h-d-none");
      } else {
        diffContainer?.classList.remove("d2h-d-none");
      }
    });
  }, [isCollapsed]);

    //function to reveal lines to up
   const expandTop = (diffFile: HTMLElement) => {
    const lines = diffFile.querySelectorAll("tr");
    let firstVisibleIndex = -1;
    let limit = -1;

    lines.forEach((line, index) => {
      if (!line.classList.contains('d2h-d-none') && firstVisibleIndex === -1) {
        firstVisibleIndex = index;
      }
    });

    //checking if the range is safe
    if (firstVisibleIndex - linesToExpand < 0){
      limit = 0;
    }else{
      limit = firstVisibleIndex - linesToExpand;
    }

    for (let i = firstVisibleIndex - 1; i >= limit ; i--) {
      lines[i].classList.remove("d2h-d-none");
    }
  };

  //function to show lines to down
  const expandBottom = (diffFile: HTMLElement) => {
    const lines = diffFile.querySelectorAll("tr");
    let lastVisibleIndex = -1;
    let limit = -1;

    lines.forEach((line, index) => {
      if (!line.classList.contains('d2h-d-none')) {
        lastVisibleIndex = index;
      }
    });

    //checking if the range is safe
    if (lastVisibleIndex + linesToExpand > lines.length){
      limit = lines.length;
    }else{
      limit = lastVisibleIndex + linesToExpand;
    }

    for (let i = lastVisibleIndex + 1; i < limit; i++) {
      lines[i].classList.remove("d2h-d-none");
    }
  };

  useEffect(() => {
    const diffFiles = document.querySelectorAll<HTMLElement>(".d2h-file-wrapper");

    diffFiles.forEach((diffFile) => {
      const topButton = document.createElement("button");
      topButton.textContent = "Expand Top";
      topButton.classList.add("tw-mb-2", "tw-px-4", "tw-bg-blue-500", "tw-text-white");
      topButton.onclick = () => expandTop(diffFile);

      const bottomButton = document.createElement("button");
      bottomButton.textContent = "Expand Bottom";
      bottomButton.classList.add("tw-mt-2", "tw-px-4", "tw-bg-green-500", "tw-text-white");
      bottomButton.onclick = () => expandBottom(diffFile);

      diffFile.insertAdjacentElement("afterbegin", topButton);
      diffFile.insertAdjacentElement("beforeend", bottomButton);
    });
  }, [diff]);

  return (
    <div id="dependency-plugin" className="tw-flex tw-flex-row tw-justify-between">
      {dependencies.length ? (
        <div
          id="dependency-container"
          className="tw-min-w-fit tw-max-w-[20%] tw-h-fit tw-mr-5 tw-py-2 tw-px-3 tw-border tw-border-gray-700 tw-rounded">
          <h3 className="tw-mb-5 tw-text-red-600">
            {dependencies.length} possíveis conflito{dependencies.length > 1 ? "s" : ""} identificado
            {dependencies.length > 1 ? "s" : ""}:
          </h3>
          <ul className="tw-list-none">
            {dependencies.map((d, i) => {
              return (
                <li>
                  <Conflict key={i} dependency={d} setConflict={changeActiveConflict} />
                </li>
              );
            })}
          </ul>
        </div>
      ) : diff ? (
        <div id="no-dependencies">
          <p>Não foram encontradas dependências durante as análises.</p>
        </div>
      ) : null}

      {diff ? (
        <div id="diff-container" className="tw-mb-3 tw-w-full">
          <h1>Diff</h1>
          {createElement("div", { dangerouslySetInnerHTML: { __html: diffHtml(diff, diffConfig) } })}
        </div>
      ) : (
        <div id="no-analysis" className="tw-mb-3">
          <p>Não foi encontrado nenhum registro de execução das análises...</p>
          <p>É possível que a análise ainda esteja em andamento ou que não tenha sido executada.</p>
        </div>
      )}
    </div>
  );
}
