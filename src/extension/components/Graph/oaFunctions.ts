import { getClassFromJavaFilename } from "@extension/utils";

const NODE_SIZE = 15;
const NODE_COLOR = "#FA4F40";
const EDGE_SIZE = 4;
const EDGE_COLOR_CALL = "#000000";
const EDGE_COLOR_PRECEDES = "#FACC4F";
const EDGE_COLOR_OA = "#4F80FA";

type lineData = {
  file: string;
  line: number;
};

/**
 * The OA conflict format is as follows:
 * @example
 * (L) ------------precedes------------> (R)
 *  |                                     |
 * call                                  call
 *  |                                     |
 *  v                                     v
 * (LC) --------------OA---------------> (RC)
 * @param L - line directly modified by the left side
 * @param R - line directly modified by the right side
 * @param LC - line that derives from the line modified by the left side and directly involved in the conflict
 * @param RC - line that derives from the line modified by the right side and directly involved in the conflict
 * @returns an object with the nodes and edges for the graph that represents the OA conflict format
 */
const generateOAGraphData = (
  L: lineData,
  R: lineData,
  LC: lineData,
  RC: lineData,
  variables?: { left: string; right: string }
) => {
  let graphData;
  if (`${getClassFromJavaFilename(L.file)}:${L.line}` === `${getClassFromJavaFilename(LC.file)}:${LC.line}`) {
    if (`${getClassFromJavaFilename(R.file)}:${R.line}` === `${getClassFromJavaFilename(RC.file)}:${RC.line}`) {
      graphData = oaGraphDataTwoNodes(L, R);
    } else {
      graphData = oaGraphDataThreeNodesRC(L, R, RC);
    }
  } else if (`${getClassFromJavaFilename(R.file)}:${R.line}` === `${getClassFromJavaFilename(RC.file)}:${RC.line}`) {
    graphData = oaGraphDataThreeNodesLC(L, R, LC);
  } else {
    graphData = oaGraphDataFourNodes(L, R, LC, RC);
  }

  return variables ? insertVariableInformation(graphData.nodes, graphData.edges, variables) : graphData;
};

const insertVariableInformation = (nodes: any[], edges: any[], variables: { left: string; right: string }) => {
  const oaEdge = edges.find((edge) => edge.attributes.label === "OA");
  if (!oaEdge) return { nodes, edges };

  const leftNode = nodes.find((node) => node.key === oaEdge.source);
  const rightNode = nodes.find((node) => node.key === oaEdge.target);
  if (!leftNode || !rightNode) return { nodes, edges };

  leftNode.attributes.message = `assigns ${variables.left}`;
  rightNode.attributes.message = `assigns ${variables.right}`;
  return { nodes, edges };
};

const oaGraphDataFourNodes = (L: lineData, R: lineData, LC: lineData, RC: lineData) => {
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
        x: 0,
        y: -1,
        label: `${getClassFromJavaFilename(R.file)}:${R.line}`,
        size: NODE_SIZE,
        color: NODE_COLOR,
        labelPosition: "bottom"
      }
    },
    {
      key: "2",
      attributes: {
        x: 1,
        y: 0,
        label: `${getClassFromJavaFilename(LC.file)}:${LC.line}`,
        size: NODE_SIZE,
        color: NODE_COLOR,
        labelPosition: "right"
      }
    },
    {
      key: "3",
      attributes: {
        x: 1,
        y: -1,
        label: `${getClassFromJavaFilename(RC.file)}:${RC.line}`,
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
        color: EDGE_COLOR_OA,
        size: EDGE_SIZE,
        type: "arrow",
        label: "OA"
      }
    }
  ];

  return { nodes, edges };
};

const oaGraphDataTwoNodes = (L: lineData, R: lineData) => {
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
        color: EDGE_COLOR_OA,
        size: EDGE_SIZE,
        type: "arrow",
        label: "OA"
      }
    }
  ];

  return { nodes, edges };
};

const oaGraphDataThreeNodesRC = (L: lineData, R: lineData, RC: lineData) => {
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
        x: 0,
        y: -1,
        label: `${getClassFromJavaFilename(R.file)}:${R.line}`,
        size: NODE_SIZE,
        color: NODE_COLOR,
        labelPosition: "bottom"
      }
    },
    {
      key: "2",
      attributes: {
        x: 1,
        y: -1,
        label: `${getClassFromJavaFilename(RC.file)}:${RC.line}`,
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
        color: EDGE_COLOR_OA,
        size: EDGE_SIZE,
        type: "arrow",
        label: "OA"
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
    }
  ];

  return { nodes, edges };
};

const oaGraphDataThreeNodesLC = (L: lineData, R: lineData, LC: lineData) => {
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
        x: 0,
        y: -1,
        label: `${getClassFromJavaFilename(R.file)}:${R.line}`,
        size: NODE_SIZE,
        color: NODE_COLOR,
        labelPosition: "bottom"
      }
    },
    {
      key: "2",
      attributes: {
        x: 1,
        y: 0,
        label: `${getClassFromJavaFilename(LC.file)}:${LC.line}`,
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
        color: EDGE_COLOR_OA,
        size: EDGE_SIZE,
        type: "arrow",
        label: "OA"
      }
    }
  ];

  return { nodes, edges };
};

export { generateOAGraphData };
