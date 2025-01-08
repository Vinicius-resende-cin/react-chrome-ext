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
}

export { getClassFromJavaFilename, getMethodNameFromJavaMethod };
