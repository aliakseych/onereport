export class ApiClient {
  constructor(private readonly baseUrl: string) {}

  private buildUrl(pathname: string) {
    const normalizedBase = this.baseUrl.endsWith("/")
      ? this.baseUrl
      : `${this.baseUrl}/`;

    return new URL(pathname.replace(/^\//, ""), normalizedBase).toString();
  }

  async get<TResponse>(pathname: string) {
    const response = await fetch(this.buildUrl(pathname), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`GET ${pathname} failed with ${response.status}`);
    }

    return (await response.json()) as TResponse;
  }

  async post<TResponse, TPayload>(pathname: string, payload: TPayload) {
    const response = await fetch(this.buildUrl(pathname), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`POST ${pathname} failed with ${response.status}`);
    }

    return (await response.json()) as TResponse;
  }
}
