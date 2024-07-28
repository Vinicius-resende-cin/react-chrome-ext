import { dependency } from "../../models/AnalysisOutput";

interface ConflictProps {
  dependency: dependency;
}

export default function Conflict({ dependency }: ConflictProps) {
  return (
    <div className="mb-3">
      <span>
        {dependency.label} ({dependency.type})&nbsp;
      </span>
      {dependency.body.interference[0].location.file !== "UNKNOWN" ? (
        <p className="text-gray-400">in {dependency.body.interference[0].location.file}</p>
      ) : null}
    </div>
  );
}
