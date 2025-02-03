import { dependency } from "../../models/AnalysisOutput";
import { updateLocationFromStackTrace } from "./dependencies";

interface ConflictProps {
  index: number;
  dependency: dependency;
  setConflict: (index: number) => void;
}

type locationStrings = {
  from: string;
  to: string;
};

export default function Conflict({ index, dependency, setConflict }: ConflictProps) {
  const getLocationFromStackTrace: (dep: dependency) => locationStrings = (dep: dependency) => {
    const newDep = updateLocationFromStackTrace(dep, { inplace: true });

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
  const maxLength = 28;
  const minimizedString = (str: string) => str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;

  function definingTitle(): string{
    if (locationStrings.to.length > maxLength || locationStrings.from.length > maxLength){
      return `${locationStrings.from} → ${locationStrings.to}`;
    } else{
      return "";
    }
  }
  
  return (
    <div className="tw-mb-3 tw-cursor-pointer tw-w-fit" onClick={() => setConflict(index)}>
      {dependency.type === "CONFLICT" ? (
      <span>
        {"DF CONFLICT"};
      </span>
    ) : (
      <span>
        {dependency.label} ({dependency.type})&nbsp;
      </span>
    )}
      
      <p className="tw-text-gray-400" title={definingTitle()}>
      in {minimizedString(locationStrings.from)} &rarr; {minimizedString(locationStrings.to)}
      </p>
    </div>
  );
}