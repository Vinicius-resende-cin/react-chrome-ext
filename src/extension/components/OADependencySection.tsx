import { dependency } from "../../models/AnalysisOutput";

interface OADependencySectionProps {
  dependencies: dependency[];
}

export default function OADependencySection({ dependencies }: OADependencySectionProps) {
  return (
    <>
      {dependencies.length && (
        <div id="oa-dependency-container">
          {dependencies.map((d, i) => (
            <div key={i}>
              <h2>{d.label}</h2>
              <p>{d.body.description}</p>
              <ul>
                {d.body.interference.map((i, j) => (
                  <li key={j}>
                    <p>{i.text}</p>
                    <p>
                      {i.location.file}:{i.location.line}
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
      )}
    </>
  );
}
