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
   * @param {string} url - The API endpoint URL
   * @param {string} model - The model identifier to use
   * @param {string} apiKey - The API authentication key
   */
  constructor(url: string, model: string, apiKey: string) {
    this.url = url;
    this.model = model;
    this.apiKey = apiKey;
  }

  /**
   * Makes an HTTP request to the specified endpoint.
   * @param {Object} request - The request configuration
   * @param {string} request.url - The request URL
   * @param {string} request.method - The HTTP method
   * @param {Record<string, string>} request.headers - The request headers
   * @param {any} request.body - The request body
   * @param {object} [params] - Optional query parameters
   * @returns {Promise<T>} The response data
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
