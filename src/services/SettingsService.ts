import { analysisAPI } from "../config";
import SettingsData from "../models/SettingsData";

class SettingsService {
  public async getSettings(owner: string, repo: string, pull_number: number): Promise<SettingsData> {
    const settings = await fetch(`${analysisAPI}/settings?owner=${owner}&repo=${repo}&pull_number=${pull_number}`)
      .then((response) => response.json())
      .then((data) => new SettingsData(data))
      .catch((error) => console.error(error));

    if (!settings) throw new Error("Settings not found");
    return settings;
  }
}

export default SettingsService;
