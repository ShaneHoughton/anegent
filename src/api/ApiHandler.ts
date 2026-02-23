import axios from "axios";

/**
 * Handles API requests to external services.
 */
class ApiHandler {
  url: string;
  model: string;
  apiKey: string;

  /**
   * Creates a new API handler instance.
   */
  constructor(url: string, model: string, apiKey: string) {
    this.url = url;
    this.model = model;
    this.apiKey = apiKey;
  }

  /**
   * Makes an HTTP request to the specified endpoint.
   */
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
        timeout: 60000, // 60 seconds timeout
      });
      return response.data;
    } catch (error) {
      console.error("Error making request:", error);
      throw error;
    }
  }
}

export default ApiHandler;
