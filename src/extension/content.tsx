import { Dependency, DependencyNode } from "./utils/Dependency";
import AnalysisOutput from "../models/AnalysisOutput";
import "./content.css";

function injectDependencies(analysis: AnalysisOutput) {
  const dependencies = analysis.getDependencies();

  dependencies.forEach((dep) => {
    const filenamePrefix = "src/main/java/";
    const fromClassFile = filenamePrefix + dep.from.className.replaceAll(".", "/") + ".java";
    const toClassFile = filenamePrefix + dep.to.className.replaceAll(".", "/") + ".java";

    const fromLine = dep.from.lineNumber;
    const toLine = dep.to.lineNumber;

    const fromNode: DependencyNode = {
      filepath: fromClassFile,
      line: fromLine
    };

    const toNode: DependencyNode = {
      filepath: toClassFile,
      line: toLine
    };

    const dep1: Dependency = new Dependency(fromNode, toNode);
    dep1.show();
  });
}

chrome.storage.local.get("analysis", (result) => {
  const analysisOutput = new AnalysisOutput(result.analysis);
  injectDependencies(analysisOutput);
});
