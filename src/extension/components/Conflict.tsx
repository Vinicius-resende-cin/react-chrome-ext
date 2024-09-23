import { dependency } from "../../models/AnalysisOutput";
import { updateLocationFromStackTrace } from "../utils/diff-navigation";

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
    const newDep = updateLocationFromStackTrace(dep);

    const class0 = newDep.body.interference[0].location.class;
    const line0 = newDep.body.interference[0].location.line;
    const classN = newDep.body.interference[newDep.body.interference.length - 1].location.class;
    const lineN = newDep.body.interference[newDep.body.interference.length - 1].location.line;

    return {
      from: `${class0}:${line0}`,
      to: `${classN}:${lineN}`
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
