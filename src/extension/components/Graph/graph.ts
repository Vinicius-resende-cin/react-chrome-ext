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

const generateGraphData = (conflictType: string, data: OAlineData | { [key: string]: lineData }, LBranch: "L" | "R") => {
  const L = data["L"];
  const R = data["R"];
  const LC = data["LC"];
  const RC = data["RC"];
  let LColor = "";
  let RColor = "";


  //check the flow of the conflict
  if (LBranch == "L"){
    LColor = "#1E90FF";
    RColor = "#228B22";
  }else {
    LColor = "#228B22";
    RColor = "#1E90FF";
  }

  if (conflictType === "oa") {
    return generateOAGraphData(L, R, LC, RC, LColor, RColor);
  } else if (conflictType === "df") {
    return generateDFGraphData(L, R, LC, RC, LColor, RColor);
  } else {
    throw new Error("Conflict type not supported");
  }
};

export { generateGraphData, type lineData };
