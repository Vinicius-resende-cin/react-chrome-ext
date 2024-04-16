import * as githubDOM from "./githubDOM";
import * as popupDOM from "./popupDOM";
import { interferenceNode } from "../../models/AnalysisOutput";

export class DependencyNode {
  type: string;
  filepath: string;
  line: number;

  private fileDiff: Element | null = null;

  constructor(node: interferenceNode) {
    this.type = node.type;
    this.filepath = node.location.file;
    this.line = node.location.line;
  }

  private getFileDiff(allDiffs?: NodeListOf<Element>) {
    if (this.fileDiff) return this.fileDiff;
    const fileDiff = githubDOM.getFileDiff(this.filepath, allDiffs);
    if (!fileDiff) {
      throw new Error(`[EXT_WARNING] Could not locate the file diff for file: ${this.filepath}`);
    }
    this.fileDiff = fileDiff;
    return fileDiff;
  }

  private getLineElement(fileDiff: Element) {
    const lineElement = githubDOM.getLineElement(this.line, fileDiff);
    if (!lineElement) {
      throw new Error(
        `[EXT_WARNING] Could not locate the line number: ${this.line} in the file diff: ${this.filepath}`
      );
    }
    return lineElement;
  }

  private getLineTextCell(lineElement: Element) {
    const lineTextCell = githubDOM.getLineTextCell(lineElement);
    if (!lineTextCell) {
      throw new Error(
        `[EXT_WARNING] Could not locate the line text cell for line: ${this.line} of file diff: ${this.filepath}`
      );
    }
    return lineTextCell;
  }

  public getLineUrl() {
    if (!this.fileDiff) this.getFileDiff();
    return this.fileDiff ? `#${this.fileDiff.id}R${this.line}` : null;
  }

  public show(allDiffs: NodeListOf<Element>, relatedNodes: DependencyNode[], analysisType: string) {
    const fileDiff = this.getFileDiff(allDiffs);
    const lineElement = this.getLineElement(fileDiff);
    const lineTextCell = this.getLineTextCell(lineElement);

    popupDOM.insertPopup(lineTextCell, analysisType, this.type, this.filepath, relatedNodes);
  }
}

export class Dependency {
  nodeList: DependencyNode[];

  constructor(nodeList: interferenceNode[]) {
    this.nodeList = nodeList.map((node) => new DependencyNode(node));
  }

  public show(analysisType: string) {
    const allDiffs = githubDOM.getAllFileDiffs();
    this.nodeList.forEach((node) => {
      const relatedNodes = this.nodeList.filter((n) => n.type !== node.type);
      try {
        node.show(allDiffs, relatedNodes, analysisType);
      } catch (error) {
        console.log(error);
      }
    });
  }
}
