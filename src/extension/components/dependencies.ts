import { dependency, tracedNode } from "../../models/AnalysisOutput";

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

const getLastValidNode = (stackTrace: tracedNode[]) => {
  // get all the diff file elements
  let diffFiles: NodeListOf<Element> | Element[] | undefined = document
    .getElementById("diff-container")
    ?.querySelectorAll(".d2h-file-wrapper");
  if (!diffFiles) throw new Error("Diff not found");
  diffFiles = Array.from(diffFiles);

  let cur = stackTrace.length - 1;
  while (cur >= 0) {
    const file = stackTrace[cur].class.replaceAll(".", "/") + ".java";

    // get the diff element of the file
    const diffContent = diffFiles.filter((diffFile) => {
      const fileName = diffFile.querySelector(".d2h-file-name")?.textContent;
      return fileName?.endsWith(file);
    })[0];

    // check if is a valid node
    if (!diffContent) {
      cur--;
    } else {
      return stackTrace[cur];
    }
  }
  return stackTrace[0];
};

const updateLocationFromStackTrace = (dep: dependency, options?: { inplace?: boolean; mode?: "default" | "deep" }) => {
  if (!dep.body.interference[0].stackTrace || !dep.body.interference[dep.body.interference.length - 1].stackTrace)
    throw new Error("File not found: Invalid stack trace");

  const inplace: boolean = options?.inplace || false;
  const mode: "default" | "deep" = options?.mode || "default";

  let stackTrace0: tracedNode;
  let stackTraceN: tracedNode;

  if (mode === "deep") {
    stackTrace0 = getLastValidNode(dep.body.interference[0].stackTrace);
    stackTraceN = getLastValidNode(dep.body.interference[dep.body.interference.length - 1].stackTrace!);
  } else {
    stackTrace0 = dep.body.interference[0].stackTrace[0];
    stackTraceN = dep.body.interference[dep.body.interference.length - 1].stackTrace![0];
  }

  const file0 = stackTrace0.class.replaceAll(".", "/") + ".java";
  const fileN = stackTraceN.class.replaceAll(".", "/") + ".java";

  if (inplace) {
    dep.body.interference[0].location.file = file0;
    dep.body.interference[0].location.line = stackTrace0.line;
    dep.body.interference[0].location.class = stackTrace0.class;
    dep.body.interference[dep.body.interference.length - 1].location.file = fileN;
    dep.body.interference[dep.body.interference.length - 1].location.line = stackTraceN.line;
    dep.body.interference[dep.body.interference.length - 1].location.class = stackTraceN.class;

    return dep;
  } else {
    const newDep = structuredClone(dep);

    newDep.body.interference[0].location.file = file0;
    newDep.body.interference[0].location.line = stackTrace0.line;
    newDep.body.interference[0].location.class = stackTrace0.class;
    newDep.body.interference[dep.body.interference.length - 1].location.file = fileN;
    newDep.body.interference[dep.body.interference.length - 1].location.line = stackTraceN.line;
    newDep.body.interference[dep.body.interference.length - 1].location.class = stackTraceN.class;

    return newDep;
  }
};

export { filterDuplicatedDependencies, updateLocationFromStackTrace };
