import { createElement, useEffect, useState } from "react";
import OADependencySection from "./OADependencySection";
import AnalysisService from "../../services/AnalysisService";
import { dependency, eventTypes } from "../../models/AnalysisOutput";
import { Diff2HtmlConfig, html as diffHtml } from "diff2html";
import { ColorSchemeType } from "diff2html/lib/types";
import DFDependencySection from "./DFDependencySection";

const analysisService = new AnalysisService();

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

type modLine = {
  file: string;
  leftAdded: number[];
  leftRemoved: number[];
  rightAdded: number[];
  rightRemoved: number[];
};

export default function DependencyView({ owner, repository, pull_number }: DependencyViewProps) {
  const [dependencies, setDependencies] = useState<dependency[]>([]);
  const [diff, setDiff] = useState<string>("");
  const [modifiedLines, setModifiedLines] = useState<modLine[]>([]);

  useEffect(() => {
    getAnalysisOutput(owner, repository, pull_number).then((response) => {
      setDependencies(response.getDependencies());
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
            console.log("lineNumber", lineNumber);
            console.log("modLine.leftAdded", modLine.leftAdded);
            if (lineNumber && modLine.leftAdded.includes(Number.parseInt(lineNumber))) {
              // Line was added by left
              console.log("Line was added by left");
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
    updateDiffColors();
  }, [modifiedLines]);

  return (
    <>
      {dependencies.length ? (
        <div id="dependency-container">
          <h1>Dependencies</h1>
          <OADependencySection
            dependencies={dependencies.filter(
              (d) => d.type === eventTypes.OA.INTER || d.type === eventTypes.OA.INTRA
            )}
          />
          <DFDependencySection
            dependencies={dependencies.filter(
              (d) =>
                d.type === eventTypes.DF.INTER ||
                d.type === eventTypes.DF.INTRA ||
                d.type === eventTypes.DEFAULT
            )}
          />
        </div>
      ) : diff ? (
        <div id="no-dependencies">
          <p>Não foram encontradas dependências durante as análises.</p>
        </div>
      ) : null}

      {diff ? (
        <div id="diff-container" className="mb-3">
          <h1>Diff</h1>
          {createElement("div", { dangerouslySetInnerHTML: { __html: diffHtml(diff, diffConfig) } })}
        </div>
      ) : (
        <div id="no-analysis" className="mb-3">
          <p>Não foi encontrado nenhum registro de execução das análises...</p>
          <p>É possível que a análise ainda esteja em andamento ou que não tenha sido executada.</p>
        </div>
      )}
    </>
  );
}
