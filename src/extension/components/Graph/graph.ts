import { generateDFGraphData } from "./dfFunctions";
import { generateOAGraphData } from "./oaFunctions";

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
  const L = data["L"];
  const R = data["R"];
  const LC = data["LC"];
  const RC = data["RC"];

  if (conflictType === "oa") {
    return generateOAGraphData(L, R, LC, RC);
  } else if (conflictType === "df") {
    return generateDFGraphData(L, R, LC, RC);
  } else {
    throw new Error("Conflict type not supported");
  }
};

export { generateGraphData, type lineData };
