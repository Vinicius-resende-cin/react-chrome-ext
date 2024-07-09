import { dependency } from "../../models/AnalysisOutput";

interface DFDependencySectionProps {
  dependencies: dependency[];
}

export default function DFDependencySection({ dependencies }: DFDependencySectionProps) {
  return dependencies.length ? (
    <div id="df-dependency-container">
      {dependencies.map((d, i) => (
        <div key={i} className="mb-3">
          <h2>{d.label}</h2>
          <p>{d.body.description}</p>
          <ul>
            {[d.body.interference[0], d.body.interference[d.body.interference.length - 1]].map((i, j) => (
              <li key={j} className={j % 2 === 1 ? "text-gray-200" : "text-orange-500"}>
                <p>{i.text}</p>
                <p>
                  {i.location.file !== "UNKNOWN" ? i.location.file : i.location.class}:{i.location.line}
                </p>
                <p>
                  {i.location.class}:{i.location.method.replace("()", "")}
                  {"()"}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  ) : (
    <></>
  );
}
