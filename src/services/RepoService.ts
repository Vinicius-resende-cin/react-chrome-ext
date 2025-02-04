interface IRepoService {
  apiUrl: string;
  isRepoRegistered(owner: string, repo: string): Promise<boolean>;
}

export default class RepoService implements IRepoService {
  apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async isRepoRegistered(owner: string, repo: string): Promise<boolean> {
    const response = await fetch(`${this.apiUrl}/repos?owner=${owner}&repo=${repo}`);
    return response.ok;
  }
}
