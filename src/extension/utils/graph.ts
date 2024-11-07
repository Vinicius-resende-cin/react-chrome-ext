const NODE_SIZE = 15;
const NODE_COLOR = "#FA4F40";
const EDGE_SIZE = 4;
const EDGE_COLOR_CALL = "#000000";
const EDGE_COLOR_PRECEDES ="#FACC4F";
const EDGE_COLOR_OA ="#4F80FA";

type lineData = {
  file: string;
  line: number;
};

type OAlineData = {
  L: lineData;
  R: lineData;
  LC: lineData;
  RC: lineData;
};

const generateGraphData = (conflictType: string, data: OAlineData | { [key: string]: lineData }) => {
  if (conflictType === "oa") {
    const L = data["L"];
    const R = data["R"];
    const LC = data["LC"];
    const RC = data["RC"];

    if (`${L.file.split("/").pop()}:${L.line}` === `${LC.file.split("/").pop()}:${LC.line}`){
      if (`${R.file.split("/").pop()}:${R.line}` === `${RC.file.split("/").pop()}:${RC.line}`){
        return generateOAGraphDataTwoNodes(L, R);
      }
    }else{
      return generateOAGraphDataFourNodes(L, R, LC, RC);
    }
  } else {
    throw new Error("Conflict type not supported");
  }
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
const generateOAGraphDataFourNodes = (L: lineData, R: lineData, LC: lineData, RC: lineData) => {
  const nodes = [
    {
      key: "0",
      attributes: {
        x: 0,
        y: 0,
        label: `${L.file.split("/").pop()}:${L.line}`,
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
        label: `${R.file.split("/").pop()}:${R.line}`,
        size: NODE_SIZE,
        color: NODE_COLOR,
        labelPosition: "right"
      }
    },
    {
      key: "2",
      attributes: {
        x: 0,
        y: -1,
        label: `${LC.file.split("/").pop()}:${LC.line}`,
        size: NODE_SIZE,
        color: NODE_COLOR,
        labelPosition: "bottom"
      }
    },
    {
      key: "3",
      attributes: {
        x: 1,
        y: -1,
        label: `${RC.file.split("/").pop()}:${RC.line}`,
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

const generateOAGraphDataTwoNodes = (L: lineData, R: lineData) => {
  const nodes = [
    {
      key: "0",
      attributes: {
        x: 0,
        y: 0,
        label: `${L.file.split("/").pop()}:${L.line}`,
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
        label: `${R.file.split("/").pop()}:${R.line}`,
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


export { generateGraphData, type lineData };
