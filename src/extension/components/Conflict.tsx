import { dependency } from "../../models/AnalysisOutput";

interface ConflictProps {
  dependency: dependency;
  setConflict: (dep: dependency) => void;
}

type locationStrings = {
  from: string;
  to: string;
};

export default function Conflict({ dependency, setConflict }: ConflictProps) {
  const getLocationFromStackTrace: (dep: dependency) => locationStrings = (dep: dependency) => {
    if (
      !dep.body.interference[0].stackTrace ||
      !dep.body.interference[dep.body.interference.length - 1].stackTrace
    )
      throw new Error("File not found: Invalid stack trace");

    const stackTrace0 = dep.body.interference[0].stackTrace[0];
    const location0 = stackTrace0.class.replaceAll(".", "/") + ".java";

    const stackTraceN = dep.body.interference[dep.body.interference.length - 1].stackTrace![0];
    const locationN = stackTraceN.class.replaceAll(".", "/") + ".java";

    return {
      from: `${location0}:${stackTrace0.line}`,
      to: `${locationN}:${stackTraceN.line}`
    };
  };

  const getLocationStrings: (dep: dependency) => locationStrings = (dep: dependency) => {
    const location0 = dep.body.interference[0].location;
    const locationN = dep.body.interference[dep.body.interference.length - 1].location;

    if (location0.file === "UNKNOWN" || locationN.file === "UNKNOWN") {
      return getLocationFromStackTrace(dep);
    } else {
      return {
        from: `${location0.class}:${location0.line}`,
        to: `${locationN.class}:${locationN.line}`
      };
    }
  };

  const locationStrings = getLocationStrings(dependency);

  return (
    <div className="tw-mb-3 tw-cursor-pointer tw-w-fit" onClick={() => setConflict(dependency)}>
      <span>
        {dependency.label} ({dependency.type})&nbsp;
      </span>
      <p className="tw-text-gray-400">
        in {locationStrings.from} &rarr; {locationStrings.to}
      </p>
    </div>
  );
}
