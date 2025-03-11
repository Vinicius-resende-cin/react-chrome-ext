import { generateDFGraphData } from "./dfFunctions";
import { generateOAGraphData } from "./oaFunctions";
import { generateCFGraphData } from "./cfFunctions";

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
  CF?: lineData;
};

type OAoptions = {
  variables?: { left: string; right: string };
};

const generateGraphData = (
  conflictType: string,
  data: OAlineData | { [key: string]: lineData },
  lColor: string,
  rColor: string,
  options?: OAoptions
) => {
  const L = data["L"];
  const R = data["R"];
  const LC = data["LC"];
  const RC = data["RC"];
  const CF = "CF" in data ? data["CF"] : undefined; 

  if (conflictType === "oa") {
    return generateOAGraphData(L, R, LC, RC, lColor, rColor, options?.variables ?? undefined);
  } else if (conflictType === "df") {
    return generateDFGraphData(L, R, LC, RC, lColor, rColor, options?.variables ?? undefined);
  } else if (conflictType === "cf" && CF) { 
    return generateCFGraphData(L, R, LC, RC, CF, lColor, rColor);
  } else {
    throw new Error("Conflict type not supported");
  }
};

export { generateGraphData, type lineData };
