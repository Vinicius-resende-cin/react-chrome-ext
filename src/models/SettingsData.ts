interface IASettingsData {
  uuid: string;
  repository: string;
  owner: string;
  pull_number: number;
  baseClass: string;
  mainMethod: string;
}

export default class SettingsData implements IASettingsData {
  uuid: string;
  repository: string;
  owner: string;
  pull_number: number;
  baseClass: string;
  mainMethod: string;

  constructor(settings: IASettingsData) {
    this.uuid = settings.uuid;
    this.repository = settings.repository;
    this.owner = settings.owner;
    this.pull_number = settings.pull_number;
    this.baseClass = settings.baseClass;
    this.mainMethod = settings.mainMethod;
  }
}
