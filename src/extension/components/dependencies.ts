import { dependency, tracedNode } from "../../models/AnalysisOutput";

const filterDuplicatedDependencies = (dependencies: dependency[]) => {
  const uniqueDependencies: dependency[] = [];
  dependencies.forEach((dep) => {
    if (
      !uniqueDependencies.some(
        (d) =>
          d.type === dep.type &&
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

const filterCFDependencies = (dependencies: dependency[]) => {
  const cfDependencies: dependency[] = [];
  dependencies.forEach((dep) => {
    if (
        dep.body.interference[2].location.class !== "java.lang.Integer" 
      ) {
      cfDependencies.push(dep);
    }
  });

  return cfDependencies;
};

const getLastValidNode = (stackTrace: tracedNode[], maxDepth: number) => {
  // get all the diff file elements
  let diffFiles: NodeListOf<Element> | Element[] | undefined = document
    .getElementById("diff-container")
    ?.querySelectorAll(".d2h-file-wrapper");
  if (!diffFiles) throw new Error("Diff not found");
  diffFiles = Array.from(diffFiles);

  let cur = maxDepth;
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
  console.log("Updating location from stack trace");
  if (
    !dep.body.interference[0].stackTrace ||
    (dep.type.startsWith("CONFLUENCE") && !dep.body.interference[1].stackTrace) ||
    (!dep.type.startsWith("CONFLUENCE") && !dep.body.interference[dep.body.interference.length - 1].stackTrace)
  )
    throw new Error("File not found: Invalid stack trace");

  const inplace: boolean = options?.inplace || false;
  const mode: "default" | "deep" = options?.mode || "default";

  let stackTrace0: tracedNode;
  let stackTraceN: tracedNode;
  let stackTraceCF: tracedNode | null = null;

  if (mode === "deep") {
    const maxDepth0 = dep.type.startsWith("CONFLUENCE")
      ? dep.body.interference[0].stackTrace.length - 2
      : dep.body.interference[0].stackTrace.length - 1;
    const maxDepthN = dep.type.startsWith("CONFLUENCE")
      ? dep.body.interference[1].stackTrace!.length - 2
      : dep.body.interference[dep.body.interference.length - 1].stackTrace!.length - 1;

    stackTrace0 = getLastValidNode(dep.body.interference[0].stackTrace, maxDepth0);
    stackTraceN = getLastValidNode(
      dep.type.startsWith("CONFLUENCE")
        ? dep.body.interference[1].stackTrace!
        : dep.body.interference[dep.body.interference.length - 1].stackTrace!,
      maxDepthN
    );
  } else if (dep.type.startsWith("CONFLUENCE")) {
    stackTrace0 = dep.body.interference[0].stackTrace[0];
    stackTraceN = dep.body.interference[1].stackTrace![0];
    stackTraceCF = {
      class: dep.body.interference[dep.body.interference.length - 1].location.class,
      method: dep.body.interference[dep.body.interference.length - 1].location.method,
      line: dep.body.interference[dep.body.interference.length - 1].location.line
    };
  } else {
    stackTrace0 = dep.body.interference[0].stackTrace[0];
    stackTraceN = dep.body.interference[dep.body.interference.length - 1].stackTrace![0];
  }

  const file0 = stackTrace0.class.replaceAll(".", "/") + ".java";
  const fileN = stackTraceN.class.replaceAll(".", "/") + ".java";
  const fileCF = stackTraceCF ? stackTraceCF.class.replaceAll(".", "/") + ".java" : "";

  if (inplace) {
    let firstNode = dep.body.interference[0];
    let lastNode = dep.type.startsWith("CONFLUENCE")
      ? dep.body.interference[1]
      : dep.body.interference[dep.body.interference.length - 1];
    let cfNode = dep.type.startsWith("CONFLUENCE") ? dep.body.interference[dep.body.interference.length - 1] : null;

    firstNode.location.file = file0;
    firstNode.location.line = stackTrace0.line;
    firstNode.location.class = stackTrace0.class;
    lastNode.location.file = fileN;
    lastNode.location.line = stackTraceN.line;
    lastNode.location.class = stackTraceN.class;
    if (cfNode && stackTraceCF) {
      cfNode.location.file = fileCF;
      cfNode.location.line = stackTraceCF.line;
      cfNode.location.class = stackTraceCF.class;
    }

    return dep;
  } else {
    const newDep = structuredClone(dep);

    let firstNode = newDep.body.interference[0];
    let lastNode = newDep.type.startsWith("CONFLUENCE")
      ? newDep.body.interference[1]
      : newDep.body.interference[dep.body.interference.length - 1];
    let cfNode = newDep.type.startsWith("CONFLUENCE") ? newDep.body.interference[dep.body.interference.length - 1] : null;

    firstNode.location.file = file0;
    firstNode.location.line = stackTrace0.line;
    firstNode.location.class = stackTrace0.class;
    lastNode.location.file = fileN;
    lastNode.location.line = stackTraceN.line;
    lastNode.location.class = stackTraceN.class;
    if (cfNode && stackTraceCF) {
      cfNode.location.file = fileCF;
      cfNode.location.line = stackTraceCF.line;
      cfNode.location.class = stackTraceCF.class;
    }

    return newDep;
  }
};

export { filterDuplicatedDependencies, updateLocationFromStackTrace, filterCFDependencies };
