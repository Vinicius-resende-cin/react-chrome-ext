import { useEffect, useState } from "react";
import AnalysisService from "../../services/AnalysisService";
import { dependency, modLine } from "../../models/AnalysisOutput";
import { filterDuplicatedDependencies, updateLocationFromStackTrace } from "./dependencies";
import Conflict from "./Conflict";
import DiffView from "./Diff/DiffView";
import GraphView from "./Graph/GraphView";
import { SerializedGraph } from "graphology-types";
import { generateGraphData, lineData } from "./Graph/graph";
import "../styles/dependency-plugin.css";
import SettingsButton from "./Settings/Settings-button";
import SettingsService from "../../services/SettingsService";
import { getClassFromJavaFilename, isLineFromLeft } from "@extension/utils";

const analysisService = new AnalysisService();
const settingsService = new SettingsService();

async function getAnalysisOutput(owner: string, repository: string, pull_number: number) {
  return await analysisService.getAnalysisOutput(owner, repository, pull_number);
}

async function getSettings(owner: string, repository: string, pull_number: number) {
  return await settingsService.getSettings(owner, repository, pull_number);
}

interface DependencyViewProps {
  owner: string;
  repository: string;
  pull_number: number;
}

let dependencyViewConfig: { owner: string; repository: string; pull_number: number } | null = null;

export function getDependencyViewConfig() {
  if (!dependencyViewConfig) {
    throw new Error("DependencyViewConfig is not set. Ensure DependencyView is rendered.");
  }
  return dependencyViewConfig;
}

export default function DependencyView({ owner, repository, pull_number }: DependencyViewProps) {
  /*
   * analysis properties
   */
  const [dependencies, setDependencies] = useState<dependency[]>([]);
  const [modifiedLines, setModifiedLines] = useState<modLine[]>([]);
  const [diff, setDiff] = useState<string>("");
  const [graphData, setGraphData] = useState<Partial<SerializedGraph> | null>(null);
  const [mainClass, setMainClass] = useState("");
  const [baseClass, setBaseClass] = useState("");
  const [mainMethod, setMainMethod] = useState("");

  /*
   * page properties
   */
  const [activeConflict, setActiveConflict] = useState<number | null>(null); // index of the active conflict on dependencies list

  /*
   * methods
   */
  const updateGraph = (dep: dependency, L: lineData, R: lineData) => {
    let newGraphData;

    // get the LC and RC
    dep = updateLocationFromStackTrace(dep, { inplace: false, mode: "deep" });

    // get the filename and line numbers of the conflict
    let fileFrom = dep.body.interference[0].location.file.replaceAll("\\", "/"); // first filename
    let lineFrom = dep.body.interference[0]; // first line
    let fileTo = dep.body.interference[dep.body.interference.length - 1].location.file.replaceAll("\\", "/"); // last filename
    let lineTo = dep.body.interference[dep.body.interference.length - 1]; // last line

    const LC = {
      file: fileFrom,
      line: lineFrom.location.line,
      method: lineFrom.stackTrace?.at(1)?.method ?? lineFrom.location.method
    };
    const RC = {
      file: fileTo,
      line: lineTo.location.line,
      method: lineTo.stackTrace?.at(1)?.method ?? lineTo.location.method
    };

    // If the nodes are equal, update from the stack trace
    if (getClassFromJavaFilename(L.file) === getClassFromJavaFilename(LC.file) && L.line === LC.line) {
      L.file = dep.body.interference[0].stackTrace?.at(0)?.class.replaceAll(".", "/") ?? L.file;
      L.line = dep.body.interference[0].stackTrace?.at(0)?.line ?? L.line;
    }

    if (getClassFromJavaFilename(R.file) === getClassFromJavaFilename(RC.file) && R.line === RC.line) {
      R.file =
        dep.body.interference[dep.body.interference.length - 1].stackTrace
          ?.at(0)
          ?.class.replaceAll(".", "/") ?? R.file;
      R.line = dep.body.interference[dep.body.interference.length - 1].stackTrace?.at(0)?.line ?? R.line;
    }

    //Sending the correct colors to the nodes
    let lColor = "";
    let rColor = "";

    const leftLines = [L, LC];

    if (isLineFromLeft(leftLines, modifiedLines)) {
      lColor = "#1E90FF"; //azul
      rColor = "#228B22"; //verde
    } else {
      lColor = "#228B22"; //verde
      rColor = "#1E90FF"; //azul
    }

    if (dep.type.startsWith("OA")) {
      const descriptionRegex = /<(.+:.+)> - .*<(.+:.+)>/;
      const variables = descriptionRegex.exec(dep.body.description);

      newGraphData = generateGraphData(
        "oa",
        { L, R, LC, RC },
        lColor,
        rColor,
        variables ? { variables: { left: variables[1], right: variables[2] } } : undefined
      );
    } else if (dep.type.startsWith("CONFLICT")) {
      const variables = dep.body.description.split(" - ").map((v) => /<(.+:.+)>/.exec(v)?.[1] ?? v);

      // If the conflict is DF
      newGraphData = generateGraphData("df", { L, R, LC, RC }, lColor, rColor, {
        variables: { left: variables[0], right: variables[1] }
      });
    }

    // set the new graph data
    if (!newGraphData) setGraphData(null);
    else setGraphData(newGraphData);
  };

  const changeActiveConflict = (dep: dependency) => {
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
    let L: lineData = {
      file: fileFrom,
      line: lineFrom.location.line,
      method: dep.body.interference[0].stackTrace?.at(0)?.method ?? lineFrom.location.method
    };
    let R: lineData = {
      file: fileTo,
      line: lineTo.location.line,
      method:
        dep.body.interference[dep.body.interference.length - 1].stackTrace?.at(0)?.method ??
        lineTo.location.method
    };
    updateGraph(dep, L, R);
  };

  // get the analysis output
  useEffect(() => {
    getAnalysisOutput(owner, repository, pull_number).then((response) => {
      dependencyViewConfig = { owner, repository, pull_number };
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

    // get the settings
    getSettings(owner, repository, pull_number).then((response) => {
      setMainClass(response.mainClass);
      setMainMethod(response.mainMethod);
      setBaseClass(response.baseClass ?? "");
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
      {diff ? (
        <SettingsButton
          baseClass={baseClass}
          setBaseClass={setBaseClass}
          mainClass={mainClass}
          setMainClass={setMainClass}
          mainMethod={mainMethod}
          setMainMethod={setMainMethod}
        />
      ) : null}
      <div id="dependency-plugin-content" className="tw-flex tw-flex-row tw-justify-between">
        {dependencies.length ? (
          <div
            id="dependency-container"
            className="tw-min-w-fit tw-max-w-[20%] tw-h-fit tw-mr-5 tw-py-2 tw-px-3 tw-border tw-border-gray-700 tw-rounded">
            <h3 className="tw-mb-5 tw-text-red-600">
              {dependencies.length} possible conflict
              {dependencies.length > 1 ? "s" : ""} reported:
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
            <p>No conflicts were found during the analysis</p>
          </div>
        ) : null}

        {diff ? (
          <div id="content-container" className="tw-w-full">
            {graphData && <GraphView data={graphData} />}
            <DiffView diff={diff} modifiedLines={modifiedLines} />
          </div>
        ) : (
          <div id="no-analysis" className="tw-mb-3">
            <p>The analysis results were not found...</p>
            <p>Please try again soon. If the problem persists, please contact support.</p>
          </div>
        )}
      </div>
    </div>
  );
}
