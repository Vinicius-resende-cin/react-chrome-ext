import AnalysisOutput from "../models/AnalysisOutput";
import "./content.css";
import { Dependency } from "./utils/Dependency";

function injectDependencies(analysis: AnalysisOutput) {
  const dependencies = analysis.getDependencies();

  dependencies.forEach((dep) => {
    const nodes = dep.body.interference;
    const dependency = new Dependency(nodes);

    dependency.show(dep.type);
  });
}

chrome.storage.local.get("analysis", (result) => {
  const analysisOutput = new AnalysisOutput(result.analysis);
  injectDependencies(analysisOutput);
});
