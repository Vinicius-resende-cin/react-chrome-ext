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
import { insertButtons } from "./InsertButtons";
import { DisplayGraph } from "./GraphVisualization";
import { SerializedGraph } from "graphology-types";

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
  // analysis properties
  const [dependencies, setDependencies] = useState<dependency[]>([]);
  const [modifiedLines, setModifiedLines] = useState<modLine[]>([]);
  const [diff, setDiff] = useState<string>("");

  // page properties
  const [activeConflict, setActiveConflict] = useState<number | null>(null); // index of the active conflict on dependencies list
  const [activeConflictLines, setActiveConflictLines] = useState<HTMLElement[]>([]); // lines of the active conflict
  const [isCollapsed, setIsCollapsed] = useState<{ [key: string]: boolean }>({}); // State to control if the code is collapsed or not
  /*
   * conflictViewMode: This state is used to control the view mode of the conflicts.
   * The default mode shows the conflicts with the first valid nodes from the analysis.
   * The deep mode ensures that the last valid nodes in the stack trace are shown.
   */
  const [conflictViewMode, setConflictViewMode] = useState<"default" | "deep">("default"); // conflict view mode
  const [graphData, setGraphData] = useState<Partial<SerializedGraph> | null>(null);

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

  const generateGraphData = (fileFrom: string, fileTo: string, lineFrom: number, lineTo: number) => {
    const nodes = [
      {
        key: "0",
        attributes: {
          x: 0,
          y: 0,
          label: `${fileFrom}:${lineFrom}`,
          size: 15,
          color: "#FA4F40",
          labelPosition: "top"
        }
      },
      {
        key: "1",
        attributes: {
          x: 1,
          y: 0,
          label: `${fileTo}:${lineTo}`,
          size: 15,
          color: "#FA4F40",
          labelPosition: "right"
        }
      }
    ];

    const edges = [
      {
        source: "0",
        target: "1",
        attributes: {
          color: "#000000",
          size: 4,
          type: "arrow"
        }
      }
    ];

    return { nodes, edges };
  };

  const changeActiveConflict = (dep: dependency) => {
    // remove the styles from the previous conflict
    if (activeConflictLines.length) {
      activeConflictLines.forEach((line) => {
        unsetAsConflictLine(line, modifiedLines);
      });
    }

    // update the location if the deep mode is active
    if (conflictViewMode === "deep") {
      dep = updateLocationFromStackTrace(dep, { inplace: false, mode: "deep" });
    }

    // get the filename and line numbers of the conflict
    let fileFrom = dep.body.interference[0].location.file.replaceAll("\\", "/"); // first filename
    let lineFrom = dep.body.interference[0]; // first line
    let fileTo = dep.body.interference[dep.body.interference.length - 1].location.file.replaceAll("\\", "/"); // last filename
    let lineTo = dep.body.interference[dep.body.interference.length - 1]; // last line

    // if the filename is unknown, try to get the first valid one from the stack trace
    if (fileFrom === "UNKNOWN" || fileTo === "UNKNOWN") {
      updateLocationFromStackTrace(dep, { inplace: true });
      fileFrom = dep.body.interference[0].location.file.replaceAll("\\", "/");
      fileTo = dep.body.interference[dep.body.interference.length - 1].location.file.replaceAll("\\", "/");
    }

    // create the graph data
    const newGraphData = generateGraphData(fileFrom, fileTo, lineFrom.location.line, lineTo.location.line);
    setGraphData(newGraphData);

    // set the new conflict as active
    const newConflict = gotoDiffConflict(fileFrom, fileTo, lineFrom, lineTo, modifiedLines);
    setActiveConflictLines(newConflict);
  };

  const handleChangeConflictViewMode = (toDeepMode: boolean) => {
    setConflictViewMode(toDeepMode ? "deep" : "default");
  };

  // get the analysis output
  useEffect(() => {
    getAnalysisOutput(owner, repository, pull_number).then((response) => {
      let dependencies = response.getDependencies();
      dependencies.forEach((dep) => {
        if (
          dep.body.interference[0].location.file === "UNKNOWN" ||
          dep.body.interference[dep.body.interference.length - 1].location.file === "UNKNOWN"
        )
          updateLocationFromStackTrace(dep, { inplace: true });
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

  // update the active conflict
  useEffect(() => {
    if (activeConflict !== null) {
      const conflict = dependencies[activeConflict];
      changeActiveConflict(conflict);
    }
  }, [activeConflict, conflictViewMode]);

  // update the colors of the diff
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
        
        insertButtons(diffFile, expandTop, expandBottom);
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
      const buttonTop = diffFile.querySelector(".button-top");
      const buttonDown = diffFile.querySelector(".button-down");

      if (isCollapsed[fileName]) {
        diffContainer?.classList.add("d2h-d-none");
        buttonTop?.classList.add("d2h-d-none");
        buttonDown?.classList.add("d2h-d-none");
      } else {
        diffContainer?.classList.remove("d2h-d-none");
        buttonTop?.classList.remove("d2h-d-none");
        buttonDown?.classList.remove("d2h-d-none");
      }
    });
  }, [isCollapsed]);

    //function to reveal lines to up
   const expandTop = (diffFile: HTMLElement, lineIndex: number) => {
    const lines = diffFile.querySelectorAll("tr");
    const buttonContainer = lines[lineIndex].previousElementSibling as HTMLElement;
    let lastLineBeforeButton = 0;
    let limit = -1;
    let linesExpandeds = lineIndex - (2 * linesToExpand);

    lines.forEach((line, index) => {
      if (!line.classList.contains('d2h-d-none') && index < lineIndex) {
        lastLineBeforeButton = index;
      }
    });


    if (linesExpandeds <= lastLineBeforeButton + 1){
      limit = lastLineBeforeButton;
      buttonContainer?.classList.add("d2h-d-none");
      
      //checking button-down to remove
      if (lastLineBeforeButton != 0){
        lines[limit].nextElementSibling?.classList.add("d2h-d-none");
      }

    }else{
      limit = linesExpandeds;
      
      //Making a new button
      buttonContainer?.remove(); 

      const newTopButtonContainer = document.createElement("div");
      newTopButtonContainer.classList.add("button-container", "button-top");
      const newTopButton = document.createElement("button");
      newTopButton.innerHTML = "&#x25B2;";
      newTopButton.classList.add("button-style");

      newTopButton.onclick = () => expandTop(diffFile, limit);
      newTopButton.title = "Expand Up";

      newTopButtonContainer.appendChild(newTopButton);

      lines[limit].insertAdjacentElement("beforebegin", newTopButtonContainer);
    }

    for (let i = lineIndex - 1; i >= limit ; i--) {
      lines[i].classList.remove("d2h-d-none");
    }
  };

  //function to show lines to down
  const expandBottom = (diffFile: HTMLElement, lineIndex: number) => {
    const lines = diffFile.querySelectorAll("tr");
    const buttonContainer = lines[lineIndex].nextElementSibling as HTMLElement;
    let firstLineAfterButton = -1;
    let limit = -1;
    let linesExpandeds = lineIndex + (2 * linesToExpand);
    
    lines.forEach((line, index) => {
      if (!line.classList.contains('d2h-d-none') && (index > lineIndex) && firstLineAfterButton == -1) {
        firstLineAfterButton = index;
      }
    });
     
    if (firstLineAfterButton == -1 && linesExpandeds >= lines.length){
      limit = lines.length;
      buttonContainer?.remove();

    }else if (firstLineAfterButton != -1 && (linesExpandeds >= firstLineAfterButton)){
      limit = firstLineAfterButton;
      buttonContainer?.remove();
      lines[limit].previousElementSibling?.classList.add("d2h-d-none");
    }else if ((firstLineAfterButton != -1 && linesExpandeds < firstLineAfterButton) || linesExpandeds < lines.length){
      limit = linesExpandeds;

      //Making a new button
      buttonContainer?.remove(); 

      const newBottomButtonContainer = document.createElement("div");
      newBottomButtonContainer.classList.add("button-container", "button-down");
      const newBottomButton = document.createElement("button");
      newBottomButton.innerHTML = "&#x25BC;";
      newBottomButton.classList.add("button-style");

      newBottomButton.onclick = () => expandBottom(diffFile, limit);
      newBottomButton.title = "Expand Down";

      newBottomButtonContainer.appendChild(newBottomButton);

      lines[limit].insertAdjacentElement("afterend", newBottomButtonContainer);
    }

    for (let i = lineIndex + 1; i < limit; i++) {
      lines[i].classList.remove("d2h-d-none");
    }
  };

  return (
    <div id="dependency-plugin">
      <div id="dependency-plugin-options" className="tw-mb-3 tw-flex tw-flex-row">
        <input
          type="checkbox"
          name="conflict-view-mode-checkbox"
          id="conflict-view-mode"
          onChange={(e) => handleChangeConflictViewMode(e.target.checked)}
        />
        <label htmlFor="conflict-view-mode" className="tw-ml-3">
          Deep mode
        </label>
      </div>
      <div id="dependency-plugin-content" className="tw-flex tw-flex-row tw-justify-between">
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
                    <Conflict key={i} index={i} dependency={d} setConflict={setActiveConflict} />
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
          <div id="content-container" className="tw-w-full">
            {graphData && (
          <div id="graph-container" className="tw-w-full tw-mb-3">
                <DisplayGraph data={graphData} />
          </div>
            )}
          <div id="diff-container" className="tw-mb-3 tw-w-full">
            <h1>Diff</h1>
            {createElement("div", { dangerouslySetInnerHTML: { __html: diffHtml(diff, diffConfig) } })}
            </div>
          </div>
        ) : (
          <div id="no-analysis" className="tw-mb-3">
            <p>Não foi encontrado nenhum registro de execução das análises...</p>
            <p>É possível que a análise ainda esteja em andamento ou que não tenha sido executada.</p>
          </div>
        )}
      </div>
    </div>
  );
}
