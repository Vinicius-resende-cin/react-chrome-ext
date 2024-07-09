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

export default function DependencyView({ owner, repository, pull_number }: DependencyViewProps) {
  const [dependencies, setDependencies] = useState<dependency[]>([]);
  const [diff, setDiff] = useState<string>("");

  useEffect(() => {
    getAnalysisOutput(owner, repository, pull_number).then((response) => {
      setDependencies(response.getDependencies());
      setDiff(response.getDiff());
    });
  }, [owner, repository, pull_number]);

  return (
    <>
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
    </>
  );
}
