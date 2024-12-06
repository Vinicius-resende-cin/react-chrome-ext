import { generateDFGraphData } from "./dfFunctions";
import { generateOAGraphData } from "./oaFunctions";

const NODE_SIZE = 15;
const NODE_COLOR = "#FA4F40";
const EDGE_SIZE = 4;
const EDGE_COLOR_CALL = "#000000";
const EDGE_COLOR_PRECEDES = "#FACC4F";
const EDGE_COLOR_OA = "#4F80FA";
const EDGE_COLOR_DF = "#b3b8c4";

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

    return generateOAGraphData(L, R, LC, RC);
  } else if (conflictType === "df") {
    const L = data["L"];
    const R = data["R"];
    console.log("generateGraphData me reconheceu como df");
    return generateDFGraphData(L, R);
  } else {
    throw new Error("Conflict type not supported");
  }
};

export { generateGraphData, type lineData };