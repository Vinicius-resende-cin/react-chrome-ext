import { lineData } from "@extension/components/Graph/graph";
import { modLine } from "models/AnalysisOutput";

const getClassFromJavaFilename = (filename: string): string | undefined => {
  if (!filename.endsWith(".java")) return filename.split("/").pop();
  return filename
    .substring(0, filename.length - 5)
    .split("/")
    .pop();
};

const getMethodNameFromJavaMethod = (methodName: string): string | undefined => {
  const result = methodName.split(" ").pop()?.replace(">", "");
  return result?.endsWith("()") ? result : `${result}()`;
};

const isLineFromLeft = (lines: lineData[], modlines: modLine[]): boolean => {
  return lines.some((line) =>
    modlines.some(
      (modLine) =>
        getClassFromJavaFilename(modLine.file) === getClassFromJavaFilename(line.file) &&
        (modLine.leftAdded.includes(line.line) || modLine.leftRemoved.includes(line.line))
    )
  )   
};

export { getClassFromJavaFilename, getMethodNameFromJavaMethod, isLineFromLeft };
