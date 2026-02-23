import { IAppMessage, IToolCallInfo } from "../types";
import { IToolDefinition } from "../tools/types";

export interface IServiceRequest<TServiceMessage> {
  messages: IAppMessage<TServiceMessage>[];
  toolDefinitions: IToolDefinition[];
}

export interface IServiceResponse<TServiceMessage> {
  messages: IAppMessage<TServiceMessage>[];
}

/**
 * Base service class for handling AI service requests and responses.
 */
export abstract class Service<TResponse, TServiceMessage> {
  /**
   * Handles a request to the AI service.
   * @param {IServiceRequest<TServiceMessage>} requestData - The request data including messages and tool definitions
   * @returns {Promise<TResponse>} The response from the AI service
   */
  abstract handleRequest(
    requestData: IServiceRequest<TServiceMessage>,
  ): Promise<TResponse>;

  /**
   * Processes the response from the AI service.
   * @param {TResponse} responseData - The raw response from the AI service
   * @returns {Promise<IAppMessage<TServiceMessage>[]>} Array of formatted application messages
   */
  abstract handleResponse(
    responseData: TResponse,
  ): Promise<IAppMessage<TServiceMessage>[]>;

  /**
   * Maps user and system prompts to service-specific message format.
   * @param {Object} params - The prompts to map
   * @param {string} params.userPrompt - The user's input prompt
   * @param {string} params.systemPrompt - The system prompt to guide behavior
   * @returns {IAppMessage<TServiceMessage>[]} Array of formatted messages
   */
  abstract mapPromptToServiceMessages({
    userPrompt,
    systemPrompt,
  }: {
    userPrompt: string;
    systemPrompt: string;
  }): IAppMessage<TServiceMessage>[];

  /**
   * Maps tool call results to service-specific message format.
   * @param {Object} params - The tool call data to map
   * @param {string} params.content - The result content from the tool execution
   * @param {IToolCallInfo} params.toolCallInfo - Information about the tool call
   * @returns {IAppMessage<TServiceMessage>} Formatted tool result message
   */
  abstract mapToolCallToServiceMessage({
    content,
    toolCallInfo,
  }: {
    content: string;
    toolCallInfo: IToolCallInfo;
  }): IAppMessage<TServiceMessage>;
}

/**
 * Handler class that manages service interactions.
 */
export class AppServiceHandler<TResponse, TServiceMessage> {
  service?: Service<TResponse, TServiceMessage>;

  /**
   * Creates a new service handler instance.
   * @param {Service<TResponse, TServiceMessage>} service - The service implementation to use
   */
  constructor(service: Service<TResponse, TServiceMessage>) {
    this.service = service;
  }

  /**
   * Formats user and system prompts into service messages.
   * @param {string} userPrompt - The user's input prompt
   * @param {string} systemPrompt - The system prompt to guide behavior
   * @returns {IAppMessage<TServiceMessage>[]} Array of formatted messages
   */
  formatPromptMessages(
    userPrompt: string,
    systemPrompt: string,
  ): IAppMessage<TServiceMessage>[] {
    if (!this.service) {
      throw new Error("Service not initialized");
    }
    return this.service?.mapPromptToServiceMessages({
      userPrompt,
      systemPrompt,
    });
  }

  /**
   * Formats tool call results into service messages.
   * @param {string} content - The result content from the tool execution
   * @param {IToolCallInfo} toolCallInfo - Information about the tool call
   * @returns {IAppMessage<TServiceMessage>} Formatted tool result message
   */
  formatToolMessage(content: string, toolCallInfo: IToolCallInfo) {
    if (!this.service) {
      throw new Error("Service not initialized");
    }
    return this.service?.mapToolCallToServiceMessage({
      content,
      toolCallInfo,
    });
  }

  /**
   * Makes a request to the AI service.
   * @param {IServiceRequest<TServiceMessage>} serviceRequest - The request data including messages and tools
   * @returns {Promise<IAppMessage<TServiceMessage>[]>} Array of response messages
   */
  async request(
    serviceRequest: IServiceRequest<TServiceMessage>,
  ): Promise<IAppMessage<TServiceMessage>[]> {
    if (!this.service) {
      throw new Error("Service not initialized");
    }
    const response = await this.service.handleRequest(serviceRequest);
    return await this.service.handleResponse(response);
  }
}
