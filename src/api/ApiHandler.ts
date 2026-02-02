import axios from "axios";

export interface IRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: any;
}

class ApiHandler {
  url: string;
  model: string;
  apiKey: string;

  constructor(url: string, model: string, apiKey: string) {
    this.url = url;
    this.model = model;
    this.apiKey = apiKey;
  }

  async makeRequest<T>(
    request: {
      url: string;
      method: string;
      headers: Record<string, string>;
      body: any;
    },
    params?: object
  ): Promise<T> {
    try {
      const response = await axios.request<T>({
        url: request.url,
        method: request.method,
        headers: request.headers,
        data: request.body,
        params: params,
      });
      return response.data;
    } catch (error) {
      console.error("Error making request:", error);
      throw error;
    }
  }
}

export default ApiHandler;
