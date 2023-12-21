import { Dependency, DependencyNode } from "./utils/Dependency";
import "./content.css";

function main() {
  const filename = "src/main/java/br/unb/cic/analysis/AbstractMergeConflictDefinition.java";
  const filename2 = "src/main/java/br/unb/cic/analysis/Main.java";

  const sourceNode: DependencyNode = {
    filepath: filename,
    line: 106
  };

  const sinkNode: DependencyNode = {
    filepath: filename2,
    line: 304
  };

  const dep1: Dependency = new Dependency(sourceNode, sinkNode);
  dep1.show();
}

main();
