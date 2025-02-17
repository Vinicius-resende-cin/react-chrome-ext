import { analysisAPI } from "../config";
import SettingsData from "../models/SettingsData";

class SettingsService {
  public async getSettings(owner: string, repo: string, pull_number: number): Promise<SettingsData> {
    console.log(`Getting settings for ${owner}/${repo}#${pull_number}`);
    const settings = await fetch(
      `${analysisAPI}/settings?owner=${owner}&repo=${repo}&pull_number=${pull_number}`
    )
      .then((response) => response.json())
      .then((data) => new SettingsData(data))
      .catch((error) => console.error(error));

    if (!settings) throw new Error("Settings not found");
    return settings;
  }

  public async saveSettings(
    owner: string,
    repo: string,
    pull_number: number,
    settings: SettingsData
  ): Promise<boolean> {
    const settingsExist = await this.getSettings(owner, repo, pull_number)
      .then((settings) => settings !== null)
      .catch(() => false);

    if (settingsExist) return this.updateSettings(owner, repo, pull_number, settings);

    const response = await fetch(
      `${analysisAPI}/settings?owner=${owner}&repo=${repo}&pull_number=${pull_number}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ settings })
      }
    );

    return response.ok;
  }

  public async updateSettings(
    owner: string,
    repo: string,
    pull_number: number,
    settings: SettingsData
  ): Promise<boolean> {
    const response = await fetch(
      `${analysisAPI}/settings?owner=${owner}&repo=${repo}&pull_number=${pull_number}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ settings })
      }
    );

    return response.ok;
  }
}

export default SettingsService;
