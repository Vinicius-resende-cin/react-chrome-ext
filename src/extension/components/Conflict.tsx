import { dependency } from "../../models/AnalysisOutput";

interface ConflictProps {
  dependency: dependency;
  setConflict: Function;
}

export default function Conflict({ dependency, setConflict }: ConflictProps) {
  return (
    <div
      className="tw-mb-3 tw-cursor-pointer tw-w-fit"
      onClick={() =>
        setConflict(
          dependency.body.interference[0].location.file.replaceAll("\\", "/"), // filename
          dependency.body.interference[0].location.line, // first line
          dependency.body.interference[dependency.body.interference.length - 1].location.line // last line
        )
      }>
      <span>
        {dependency.label} ({dependency.type})&nbsp;
      </span>
      {dependency.body.interference[0].location.file !== "UNKNOWN" ? (
        <p className="tw-text-gray-400">
          in {dependency.body.interference[0].location.file}:{dependency.body.interference[0].location.line}
        </p>
      ) : null}
    </div>
  );
}
