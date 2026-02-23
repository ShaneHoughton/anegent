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
   */
  abstract handleRequest(
    requestData: IServiceRequest<TServiceMessage>,
  ): Promise<TResponse>;

  /**
   * Processes the response from the AI service.
   */
  abstract handleResponse(
    responseData: TResponse,
  ): Promise<IAppMessage<TServiceMessage>[]>;

  /**
   * Maps user and system prompts to service-specific message format.
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
   */
  constructor(service: Service<TResponse, TServiceMessage>) {
    this.service = service;
  }

  /**
   * Formats user and system prompts into service messages.
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
