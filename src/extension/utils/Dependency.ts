import * as githubDOM from "./githubDOM";
import * as popupDOM from "./popupDOM";

export interface DependencyNode {
  filepath: string;
  line: number;
}

export class Dependency {
  sourceNode: DependencyNode;
  sinkNode: DependencyNode;

  constructor(sourceNode: DependencyNode, sinkNode: DependencyNode) {
    this.sourceNode = sourceNode;
    this.sinkNode = sinkNode;
  }

  public show() {
    const { filepath: sourceFile, line: sourceLine } = this.sourceNode;
    const { filepath: sinkFile, line: sinkLine } = this.sinkNode;

    const allDiffs = githubDOM.getAllFileDiffs();

    const sourceDiff = githubDOM.getFileDiff(sourceFile, allDiffs);
    const sinkDiff = githubDOM.getFileDiff(sinkFile, allDiffs);
    if (sourceDiff === null || sinkDiff === null) {
      throw new Error(`[EXT_WARNING] Could not locate the specified diffs`);
    }

    const sourceLines = githubDOM.getDiffVisibleLines(sourceDiff);
    const sinkLines = githubDOM.getDiffVisibleLines(sinkDiff);
    if (sourceLines === null || sinkLines === null) {
      throw new Error(`[EXT_ERROR] Could not find the list of lines`);
    }

    const sourceLineIndex = githubDOM.getLineIndex(sourceLines, sourceLine);
    const sinkLineIndex = githubDOM.getLineIndex(sinkLines, sinkLine);
    if (sourceLineIndex === null || sinkLineIndex === null) {
      throw new Error(`[EXT_ERROR] Could not find the line index`);
    }

    const sourceLineElement = sourceLines[sourceLineIndex];
    const sinkLineElement = sinkLines[sinkLineIndex];

    const sourceLineTextCell = githubDOM.getLineTextCell(sourceLineElement);
    const sinkLineTextCell = githubDOM.getLineTextCell(sinkLineElement);
    if (sourceLineTextCell === null || sinkLineTextCell === null) {
      throw new Error(`[EXT_ERROR] Could not find the line text cell`);
    }

    // TODO: Change the logic to locate the line to use the id search below
    const sourceLineNumberMatch = sourceLineElement.children[1].id.match(`${sourceDiff.id}R\\d+`);
    const sinkLineNumberMatch = sinkLineElement.children[1].id.match(`${sinkDiff.id}R\\d+`);
    if (sourceLineNumberMatch === null || sinkLineNumberMatch === null) {
      throw new Error(`[EXT_ERROR] Could not find the line number`);
    }

    const sourceLineUrl = sourceLineNumberMatch[0];
    const sinkLineUrl = sinkLineNumberMatch[0];

    popupDOM.insertPopup(sourceLineTextCell, sinkLine, sinkLineUrl, sinkFile, true);
    popupDOM.insertPopup(sinkLineTextCell, sourceLine, sourceLineUrl, sourceFile, false);
  }
}
