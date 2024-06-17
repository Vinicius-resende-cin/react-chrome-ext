import { useEffect, useState } from "react";
import OADependencySection from "./OADependencySection";
import AnalysisService from "../../services/AnalysisService";
import { dependency, eventTypes } from "../../models/AnalysisOutput";

const analysisService = new AnalysisService();

async function getAnalysisOutput(owner: string, repository: string, pull_number: number) {
  return await analysisService.getAnalysisOutput(owner, repository, pull_number);
}

interface DependencyViewProps {
  owner: string;
  repository: string;
  pull_number: number;
}

export default function DependencyView({ owner, repository, pull_number }: DependencyViewProps) {
  const [dependencies, setDependencies] = useState<dependency[]>([]);
  const [diff, setDiff] = useState<string>("");

  useEffect(() => {
    getAnalysisOutput(owner, repository, pull_number).then((response) => {
      setDependencies(response.getDependencies());
      setDiff(response.getDiff());
    });
  }, [owner, repository, pull_number]);

  return (
    <>
      {diff ? (
        <div id="diff-container" className="mb-3">
          <h1>Diff</h1>
          <pre>{diff}</pre>
        </div>
      ) : (
        <div id="no-analysis" className="mb-3">
          <p>Não foi encontrado nenhum registro de execução das análises...</p>
          <p>É possível que a análise ainda esteja em andamento ou que não tenha sido executada.</p>
        </div>
      )}

      {dependencies.length ? (
        <div id="dependency-container">
          <h1>Dependencies</h1>
          <OADependencySection
            dependencies={dependencies.filter(
              (d) => d.type === eventTypes.OA.INTER || d.type === eventTypes.OA.INTRA
            )}
          />
        </div>
      ) : diff ? (
        <div id="no-dependencies">
          <p>Não foram encontradas dependências durante as análises.</p>
        </div>
      ) : null}
    </>
  );
}
