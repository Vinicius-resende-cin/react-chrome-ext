import { getClassFromJavaFilename } from "@extension/utils";

const NODE_SIZE = 15;
const NODE_COLOR = "#FA4F40";
const EDGE_SIZE = 4;
const EDGE_COLOR_CALL = "#000000";
const EDGE_COLOR_PRECEDES = "#FACC4F";
const EDGE_COLOR_DF = "#4F80FA";

type lineData = {
  file: string;
  line: number;
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
const generateDFGraphData = (L: lineData, R: lineData, LC: lineData, RC: lineData) => {
  if (`${getClassFromJavaFilename(L.file)}:${L.line}` === `${getClassFromJavaFilename(LC.file)}:${LC.line}`) {
    if (`${getClassFromJavaFilename(R.file)}:${R.line}` === `${getClassFromJavaFilename(RC.file)}:${RC.line}`) {
      return dfGraphDataTwoNodes(L, R);
    } else {
      return dfGraphDataThreeNodesRC(L, R, RC);
    }
  } else if (`${getClassFromJavaFilename(R.file)}:${R.line}` === `${getClassFromJavaFilename(RC.file)}:${RC.line}`) {
    return dfGraphDataThreeNodesLC(L, R, LC);
  } else {
    return dfGraphDataFourNodes(L, R, LC, RC);
  }
};

const dfGraphDataFourNodes = (L: lineData, R: lineData, LC: lineData, RC: lineData) => {
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
        color: EDGE_COLOR_DF,
        size: EDGE_SIZE,
        type: "arrow",
        label: "DF"
      }
    }
  ];

  return { nodes, edges };
};

const dfGraphDataTwoNodes = (L: lineData, R: lineData) => {
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
};

const dfGraphDataThreeNodesRC = (L: lineData, R: lineData, RC: lineData) => {
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
        color: EDGE_COLOR_DF,
        size: EDGE_SIZE,
        type: "arrow",
        label: "DF"
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

const dfGraphDataThreeNodesLC = (L: lineData, R: lineData, LC: lineData) => {
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
        color: EDGE_COLOR_DF,
        size: EDGE_SIZE,
        type: "arrow",
        label: "DF"
      }
    }
  ];

  return { nodes, edges };
};

export { generateDFGraphData };
