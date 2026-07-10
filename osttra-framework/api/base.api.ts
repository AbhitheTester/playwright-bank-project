import { APIRequestContext } from '@playwright/test';

export class BaseAPI {
  constructor(
    protected request: APIRequestContext,
    protected baseURL: string = process.env.API_BASE_URL || 'https://reqres.in'
  ) {}

  protected async get(path: string, headers: Record<string,string> = {}) {
    const res = await this.request.get(`${this.baseURL}${path}`, { headers });
    return { status: res.status(), body: await res.json() };
  }

  protected async post(path: string, data: object, headers: Record<string,string> = {}) {
    const res = await this.request.post(`${this.baseURL}${path}`, {
      data, headers: { 'Content-Type': 'application/json', ...headers }
    });
    return { status: res.status(), body: await res.json() };
  }

  protected async put(path: string, data: object, headers: Record<string,string> = {}) {
    const res = await this.request.put(`${this.baseURL}${path}`, { data, headers });
    return { status: res.status(), body: await res.json() };
  }

  protected async delete(path: string, headers: Record<string,string> = {}) {
    const res = await this.request.delete(`${this.baseURL}${path}`, { headers });
    return { status: res.status() };
  }
}