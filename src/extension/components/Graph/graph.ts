import { generateDFGraphData } from "./dfFunctions";
import { generateOAGraphData } from "./oaFunctions";

type lineData = {
  file: string;
  line: number;
  method: string;
};

type OAlineData = {
  L: lineData;
  R: lineData;
  LC: lineData;
  RC: lineData;
};

const generateGraphData = (conflictType: string, data: OAlineData | { [key: string]: lineData }, lColor: string, rColor: string) => {
  const L = data["L"];
  const R = data["R"];
  const LC = data["LC"];
  const RC = data["RC"];

  if (conflictType === "oa") {
    return generateOAGraphData(L, R, LC, RC, lColor, rColor);
  } else if (conflictType === "df") {
    return generateDFGraphData(L, R, LC, RC, lColor, rColor);
  } else {
    throw new Error("Conflict type not supported");
  }
};

export { generateGraphData, type lineData };
