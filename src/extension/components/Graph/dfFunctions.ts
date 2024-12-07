import { getClassFromJavaFilename } from "@extension/utils";

const NODE_SIZE = 15;
const NODE_COLOR = "#FA4F40";
const EDGE_SIZE = 4;
const EDGE_COLOR_DF = "#b3b8c4";

type lineData = {
    file: string;
    line: number;
  };

// The OA conflict format is as follows:
// @example
// (L) ------------DF------------> (R)                                     |
// @param L - line directly modified by the left side
// @param R - line directly modified by the right side
// @returns an object with the nodes and edges for the graph that represents the OA conflict format

const generateDFGraphData = (L: lineData, R: lineData) => {
    const nodes = [
      {
        key: "0",
        attributes: {
          x: 0,
          y: 0,
          label: `${getClassFromJavaFilename(L.file)}:${L.line}`,
          size: NODE_SIZE,
          color: NODE_COLOR,
          labelPosition: "top"
        }
      },
      {
        key: "1",
        attributes: {
          x: 1,
          y: 0,
          label: `${getClassFromJavaFilename(R.file)}:${R.line}`,
          size: NODE_SIZE,
          color: NODE_COLOR,
          labelPosition: "right"
        }
      }
    ];
  
    const edges = [
      {
        source: "0",
        target: "1",
        attributes: {
          color: EDGE_COLOR_DF,
          size: EDGE_SIZE,
          type: "arrow",
          label: "DF"
        }
      }
    ];
  
    return { nodes, edges };
  }

  export { generateDFGraphData };  