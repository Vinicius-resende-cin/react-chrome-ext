import { useEffect, useState } from "react";
import AnalysisService from "../../services/AnalysisService";
import { dependency, modLine } from "../../models/AnalysisOutput";
import { filterDuplicatedDependencies, updateLocationFromStackTrace } from "./dependencies";
import Conflict from "./Conflict";
import DiffView from "./Diff/DiffView";
import GraphView from "./Graph/GraphView";
import { SerializedGraph } from "graphology-types";
import { generateGraphData, lineData } from "./Graph/graph";
import { unsetAsConflictLine, gotoDiffConflict } from "./Diff/diff-navigation";

const analysisService = new AnalysisService();

async function getAnalysisOutput(owner: string, repository: string, pull_number: number) {
  return await analysisService.getAnalysisOutput(owner, repository, pull_number);
}

interface DependencyViewProps {
  owner: string;
  repository: string;
  pull_number: number;
}

export default function DependencyView({ owner, repository, pull_number }: DependencyViewProps) {
  /*
   * analysis properties
   */
  const [dependencies, setDependencies] = useState<dependency[]>([]);
  const [modifiedLines, setModifiedLines] = useState<modLine[]>([]);
  const [diff, setDiff] = useState<string>("");
  const [graphData, setGraphData] = useState<Partial<SerializedGraph> | null>(null);

  /*
   * page properties
   */
  const [activeConflict, setActiveConflict] = useState<number | null>(null); // index of the active conflict on dependencies list
  const [activeConflictLines, setActiveConflictLines] = useState<HTMLElement[]>([]); // lines of the active conflict

  /*
   * methods
   */
  const updateGraph = (dep: dependency, L: lineData, R: lineData) => {
    let newGraphData;

    // if the conflict is OA, get the LC and RC
    if (dep.type.startsWith("OA")) {
      // get the LC and RC
      dep = updateLocationFromStackTrace(dep, { inplace: false, mode: "deep" });

      // get the filename and line numbers of the conflict
      let fileFrom = dep.body.interference[0].location.file.replaceAll("\\", "/"); // first filename
      let lineFrom = dep.body.interference[0]; // first line
      let fileTo = dep.body.interference[dep.body.interference.length - 1].location.file.replaceAll("\\", "/"); // last filename
      let lineTo = dep.body.interference[dep.body.interference.length - 1]; // last line

      const LC = { file: fileFrom, line: lineFrom.location.line };
      const RC = { file: fileTo, line: lineTo.location.line };

      newGraphData = generateGraphData("oa", { L, R, LC, RC });
    }

    // set the new graph data
    if (!newGraphData) setGraphData(null);
    else setGraphData(newGraphData);
  };

  const changeActiveConflict = (dep: dependency) => {
    // remove the styles from the previous conflict
    if (activeConflictLines.length) {
      activeConflictLines.forEach((line) => {
        unsetAsConflictLine(line, modifiedLines);
      });
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

    // declare the graph data variables
    let L: lineData = { file: fileFrom, line: lineFrom.location.line };
    let R: lineData = { file: fileTo, line: lineTo.location.line };
    updateGraph(dep, L, R);

    // set the new conflict as active
    const newConflict = gotoDiffConflict(fileFrom, fileTo, lineFrom, lineTo, modifiedLines);
    setActiveConflictLines(newConflict);
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
  }, [activeConflict]);

  return (
    <div id="dependency-plugin">
      <div id="dependency-plugin-content" className="tw-flex tw-flex-row tw-justify-between">
        {dependencies.length ? (
          <div
            id="dependency-container"
            className="tw-min-w-fit tw-max-w-[20%] tw-h-fit tw-mr-5 tw-py-2 tw-px-3 tw-border tw-border-gray-700 tw-rounded">
            <h3 className="tw-mb-5 tw-text-red-600">
              {dependencies.length} possíve{dependencies.length > 1 ? "is" : "l"} conflito
              {dependencies.length > 1 ? "s" : ""} identificado
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
            {graphData && <GraphView data={graphData} />}
            <DiffView diff={diff} modifiedLines={modifiedLines} />
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
