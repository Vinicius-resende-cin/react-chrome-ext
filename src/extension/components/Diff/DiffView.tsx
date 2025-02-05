import { createElement, useState, useEffect } from "react";
import { Diff2HtmlConfig, html as diffHtml } from "diff2html";
import { ColorSchemeType } from "diff2html/lib/types";
import { modLine } from "../../../models/AnalysisOutput";
import { insertButtons } from "./InsertButtons";
import { getClassFromJavaFilename } from "@extension/utils";

const isDarkMode = () => {
  return document.documentElement.getAttribute("data-color-mode") === "dark";
};

const diffConfig: Diff2HtmlConfig = {
  outputFormat: "line-by-line",
  drawFileList: true,
  renderNothingWhenEmpty: true,
  matching: "words",
  diffStyle: "word",
  colorScheme: isDarkMode() ? ColorSchemeType.DARK : ColorSchemeType.LIGHT
};

interface DiffViewProps {
  diff: string;
  modifiedLines: modLine[];
}

export default function DiffView({ diff, modifiedLines }: DiffViewProps) {
  const [isCollapsed, setIsCollapsed] = useState<{ [key: string]: boolean }>({}); // State to control if the code is collapsed or not

  // update the colors of the diff and collapse the context lines
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

    const addFileNameAsClass = () => {
      const diffContainer = document.getElementById("diff-container");
      const diffFiles = diffContainer?.querySelectorAll(".d2h-file-wrapper");
  
      if (diffFiles) {
        diffFiles.forEach((diffFile) => {
          let fileName = diffFile.querySelector(".d2h-file-name")?.textContent?.trim();
          
          if (fileName) {
            fileName = getClassFromJavaFilename(fileName);  
            diffFile.classList.add(`${fileName}`);
          }
        });
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
          if (line.querySelector(".d2h-ins") || line.querySelector(".d2h-del")) {
            for (let i = Math.max(0, index - 3); i <= Math.min(lines.length - 1, index + 3); i++) {
              lines[i].classList.remove("d2h-d-none");
              linesAlreadyShown.add(i);
            }
          } else if (!linesAlreadyShown.has(index)) {
            line.classList.add("d2h-d-none");
          }
        });

        const fileName = diffFile.querySelector(".d2h-file-name")?.textContent;
        if (fileName) {
          insertButtons(diffFile, fileName);
        }
      });
    };

    updateDiffColors();
    addFileNameAsClass();
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

  return (
    <div id="diff-container" className="tw-mb-3 tw-w-full">
      <h1>Diff</h1>
      {createElement("div", { dangerouslySetInnerHTML: { __html: diffHtml(diff, diffConfig) } })}
    </div>
  );
}
