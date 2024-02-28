import { analysisAPI } from "../config";
import AnalysisOutput from "../models/AnalysisOutput";

class AnalysisService {
  public async getAnalysisOutput(owner: string, repo: string, pull_number: number): Promise<AnalysisOutput> {
    const analysis = await fetch(
      `${analysisAPI}/analysis?owner=${owner}&repo=${repo}&pull_number=${pull_number}`
    )
      .then((response) => response.json())
      .then((data) => new AnalysisOutput(data));
    return analysis;
  }
}
