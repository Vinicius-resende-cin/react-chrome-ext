import { getClassFromJavaFilename, getMethodNameFromJavaMethod } from "@extension/utils";
import { blue } from "@mui/material/colors";

const NODE_SIZE = 15;
const EDGE_SIZE = 4;
const EDGE_COLOR_CALL = "#000000";
const EDGE_COLOR_PRECEDES = "#FACC4F";
const EDGE_COLOR_CF = "#4F80FA";
const TRG_CF_COLOR = "#808080";

type lineData = {
  file: string;
  line: number;
  method: string;
};

/**
 * The DF conflict format is as follows:
 * @example
 * (L) ------------precedes------------> (R)
 *  |                                     |
 * call                                  call
 *  |                                     |
 *  v                                     v
 * (LC) --------------DF---------------> (RC)
 * @param L - line directly modified by the left side
 * @param R - line directly modified by the right side
 * @param LC - line that derives from the line modified by the left side and directly involved in the conflict
 * @param RC - line that derives from the line modified by the right side and directly involved in the conflict
 * @returns an object with the nodes and edges for the graph that represents the DF conflict format
 */
const generateCFGraphData = (
  L: lineData,
  R: lineData,
  LC: lineData,
  RC: lineData,
  TRG: lineData,
  lColor: string,
  rColor: string,
  variables?: { left: string; right: string }
) => {
  let graphData;
  if (`${getClassFromJavaFilename(L.file)}:${L.line}` === `${getClassFromJavaFilename(LC.file)}:${LC.line}`) {
    if (`${getClassFromJavaFilename(R.file)}:${R.line}` === `${getClassFromJavaFilename(RC.file)}:${RC.line}`) {
      graphData = cfGraphDataThreeNodes(L, R, TRG, lColor, rColor);
    } else {
      graphData = cfGraphDataFourNodesRC(L, R, RC, TRG, lColor, rColor);
    }
  } else if (`${getClassFromJavaFilename(R.file)}:${R.line}` === `${getClassFromJavaFilename(RC.file)}:${RC.line}`) {
    graphData = cfGraphDataFourNodesLC(L, R, LC, TRG, lColor, rColor);
  } else {
    graphData = cfGraphDataFiveNodes(L, R, LC, RC, TRG, lColor, rColor);
  }

  return variables ? insertVariableInformation(graphData.nodes, graphData.edges, variables) : graphData;
};

const insertVariableInformation = (nodes: any[], edges: any[], variables: { left: string; right: string }) => {
  const cfEdge = edges.find((edge) => edge.attributes.label === "CF");
  if (!cfEdge) return { nodes, edges };

  const leftNode = nodes.find((node) => node.key === cfEdge.source);
  const rightNode = nodes.find((node) => node.key === cfEdge.target);
  if (!leftNode || !rightNode) return { nodes, edges };

  leftNode.attributes.message = `assigns ${variables.left}`;
  rightNode.attributes.message = `uses ${variables.right !== "unknown" ? variables.right : variables.left}`;
  return { nodes, edges };
};

const cfGraphDataFiveNodes = (L: lineData, R: lineData, LC: lineData, RC: lineData, TRG: lineData, lColor: string, rColor: string) => {
  const nodes = [
    {
      key: "0",
      attributes: {
        x: 0,
        y: 0,
        label: `${getClassFromJavaFilename(L.file)}:${L.line}`,
        method: `${getMethodNameFromJavaMethod(L.method)}`,
        size: NODE_SIZE,
        color: lColor,
        labelPosition: "top"
      }
    },
    {
      key: "1",
      attributes: {
        x: 0,
        y: -1,
        label: `${getClassFromJavaFilename(R.file)}:${R.line}`,
        method: `${getMethodNameFromJavaMethod(R.method)}`,
        size: NODE_SIZE,
        color: rColor,
        labelPosition: "bottom"
      }
    },
    {
      key: "2",
      attributes: {
        x: 1,
        y: 0,
        label: `${getClassFromJavaFilename(LC.file)}:${LC.line}`,
        method: `${getMethodNameFromJavaMethod(LC.method)}`,
        size: NODE_SIZE,
        color: lColor,
        labelPosition: "right"
      }
    },
    {
      key: "3",
      attributes: {
        x: 1,
        y: -1,
        label: `${getClassFromJavaFilename(RC.file)}:${RC.line}`,
        method: `${getMethodNameFromJavaMethod(RC.method)}`,
        size: NODE_SIZE,
        color: rColor,
        labelPosition: "right"
      }
    },
    {
      key: "4",
      attributes: {
        x: 2,
        y: -0.5,
        label: `${getClassFromJavaFilename(TRG.file)}:${TRG.line}`,
        method: `${getMethodNameFromJavaMethod(TRG.method)}`,
        size: NODE_SIZE,
        color: TRG_CF_COLOR,
        labelPosition: "right"
      }
    }
  ];

  const edges = [
    {
      source: "0",
      target: "1",
      attributes: {
        color: EDGE_COLOR_PRECEDES,
        size: EDGE_SIZE,
        type: "arrow",
        label: "Precedes"
      }
    },
    {
      source: "0",
      target: "2",
      attributes: {
        color: EDGE_COLOR_CALL,
        size: EDGE_SIZE,
        type: "arrow",
        label: "Call"
      }
    },
    {
      source: "1",
      target: "3",
      attributes: {
        color: EDGE_COLOR_CALL,
        size: EDGE_SIZE,
        type: "arrow",
        label: "Call"
      }
    },
    {
      source: "2",
      target: "3",
      attributes: {
        color: EDGE_COLOR_PRECEDES,
        size: EDGE_SIZE,
        type: "arrow",
        label: "Precedes"
      }
    },
    {
      source: "2",
      target: "4",
      attributes: {
        color: EDGE_COLOR_CF,
        size: EDGE_SIZE,
        type: "arrow",
        label: "CF"
      }
    },
    {
      source: "3",
      target: "4",
      attributes: {
        color: EDGE_COLOR_CF,
        size: EDGE_SIZE,
        type: "arrow",
        label: "CF"
      }
    }
  ];

  return { nodes, edges };
};

const cfGraphDataThreeNodes = (L: lineData, R: lineData, TRG: lineData, lColor: string, rColor: string) => {
  const nodes = [
    {
      key: "0",
      attributes: {
        x: 0,
        y: 0,
        label: `${getClassFromJavaFilename(L.file)}:${L.line}`,
        method: `${getMethodNameFromJavaMethod(L.method)}`,
        size: NODE_SIZE,
        color: lColor,
        labelPosition: "top"
      }
    },
    {
      key: "1",
      attributes: {
        x: 0,
        y: -1,
        label: `${getClassFromJavaFilename(R.file)}:${R.line}`,
        method: `${getMethodNameFromJavaMethod(R.method)}`,
        size: NODE_SIZE,
        color: rColor,
        labelPosition: "right"
      }
    },
    {
      key: "2",
      attributes: {
        x: 1,
        y: -0.5,
        label: `${getClassFromJavaFilename(TRG.file)}:${TRG.line}`,
        method: `${getMethodNameFromJavaMethod(TRG.method)}`,
        size: NODE_SIZE,
        color: TRG_CF_COLOR,
        labelPosition: "right"
      }
    }
  ];

  const edges = [
    {
      source: "0",
      target: "1",
      attributes: {
        color: EDGE_COLOR_PRECEDES,
        size: EDGE_SIZE,
        type: "arrow",
        label: "Precedes"
      }
    },
    {
        source: "1",
        target: "2",
        attributes: {
          color: EDGE_COLOR_CF,
          size: EDGE_SIZE,
          type: "arrow",
          label: "CF"
        }
      }
  ];

  return { nodes, edges };
};

const cfGraphDataFourNodesRC = (L: lineData, R: lineData, RC: lineData, TRG: lineData, lColor: string, rColor: string) => {
  const nodes = [
    {
      key: "0",
      attributes: {
        x: 0,
        y: 0,
        label: `${getClassFromJavaFilename(L.file)}:${L.line}`,
        method: `${getMethodNameFromJavaMethod(L.method)}`,
        size: NODE_SIZE,
        color: lColor,
        labelPosition: "top"
      }
    },
    {
      key: "1",
      attributes: {
        x: 0,
        y: -1,
        label: `${getClassFromJavaFilename(R.file)}:${R.line}`,
        method: `${getMethodNameFromJavaMethod(R.method)}`,
        size: NODE_SIZE,
        color: rColor,
        labelPosition: "bottom"
      }
    },
    {
      key: "2",
      attributes: {
        x: 1,
        y: -1,
        label: `${getClassFromJavaFilename(RC.file)}:${RC.line}`,
        method: `${getMethodNameFromJavaMethod(RC.method)}`,
        size: NODE_SIZE,
        color: rColor,
        labelPosition: "right"
      }
    },
    {
      key: "3",
      attributes: {
        x: 2,
        y: -0.5,
        label: `${getClassFromJavaFilename(TRG.file)}:${TRG.line}`,
        method: `${getMethodNameFromJavaMethod(TRG.method)}`,
        size: NODE_SIZE,
        color: TRG_CF_COLOR,
        labelPosition: "right"
      }
    }
  ];

  const edges = [
    {
      source: "0",
      target: "1",
      attributes: {
        color: EDGE_COLOR_PRECEDES,
        size: EDGE_SIZE,
        type: "arrow",
        label: "Precedes"
      }
    },
    {
      source: "0",
      target: "2",
      attributes: {
        color: EDGE_COLOR_PRECEDES,
        size: EDGE_SIZE,
        type: "arrow",
        label: "Precedes"
      }
    },
    {
      source: "1",
      target: "2",
      attributes: {
        color: EDGE_COLOR_CALL,
        size: EDGE_SIZE,
        type: "arrow",
        label: "Call"
      }
    },
    {
      source: "0",
      target: "3",
      attributes: {
        color: EDGE_COLOR_CF,
        size: EDGE_SIZE,
        type: "arrow",
        label: "CF"
      }
    },
    {
      source: "2",
      target: "3",
      attributes: {
        color: EDGE_COLOR_CF,
        size: EDGE_SIZE,
        type: "arrow",
        label: "CF"
      }
    }
  ];

  return { nodes, edges };
};

const cfGraphDataFourNodesLC = (L: lineData, R: lineData, LC: lineData, TRG: lineData, lColor: string, rColor: string) => {
  const nodes = [
    {
      key: "0",
      attributes: {
        x: 0,
        y: 0,
        label: `${getClassFromJavaFilename(L.file)}:${L.line}`,
        method: `${getMethodNameFromJavaMethod(L.method)}`,
        size: NODE_SIZE,
        color: lColor,
        labelPosition: "top"
      }
    },
    {
      key: "1",
      attributes: {
        x: 0,
        y: -1,
        label: `${getClassFromJavaFilename(R.file)}:${R.line}`,
        method: `${getMethodNameFromJavaMethod(R.method)}`,
        size: NODE_SIZE,
        color: rColor,
        labelPosition: "bottom"
      }
    },
    {
      key: "2",
      attributes: {
        x: 1,
        y: 0,
        label: `${getClassFromJavaFilename(LC.file)}:${LC.line}`,
        method: `${getMethodNameFromJavaMethod(LC.method)}`,
        size: NODE_SIZE,
        color: lColor,
        labelPosition: "right"
      }
    },
    {
      key: "3",
      attributes: {
        x: 2,
        y: -0.5,
        label: `${getClassFromJavaFilename(TRG.file)}:${TRG.line}`,
        method: `${getMethodNameFromJavaMethod(TRG.method)}`,
        size: NODE_SIZE,
        color: TRG_CF_COLOR,
        labelPosition: "right"
      }
    }
  ];

  const edges = [
    {
      source: "0",
      target: "1",
      attributes: {
        color: EDGE_COLOR_PRECEDES,
        size: EDGE_SIZE,
        type: "arrow",
        label: "Precedes"
      }
    },
    {
      source: "0",
      target: "2",
      attributes: {
        color: EDGE_COLOR_CALL,
        size: EDGE_SIZE,
        type: "arrow",
        label: "Call"
      }
    },
    {
      source: "2",
      target: "1",
      attributes: {
        color: EDGE_COLOR_PRECEDES,
        size: EDGE_SIZE,
        type: "arrow",
        label: "Precedes"
      }
    },
    {
      source: "1",
      target: "3",
      attributes: {
        color: EDGE_COLOR_CF,
        size: EDGE_SIZE,
        type: "arrow",
        label: "CF"
      }
    },
    {
      source: "2",
      target: "3",
      attributes: {
        color: EDGE_COLOR_CF,
        size: EDGE_SIZE,
        type: "arrow",
        label: "CF"
      }
    }
  ];

  return { nodes, edges };
};

export { generateCFGraphData };
