import { IAppMessage } from "../types";
import { IToolDefinition } from "../tools/types";

export interface IServiceRequest<TServiceMessage> {
  messages: IAppMessage<TServiceMessage>[];
  toolDefinitions: IToolDefinition[];
}

export interface IServiceResponse<TServiceMessage> {
  messages: IAppMessage<TServiceMessage>[];
}

export abstract class Service<TResponse, TServiceMessage> {
  abstract handleRequest(
    requestData: IServiceRequest<TServiceMessage>,
  ): Promise<TResponse>;

  abstract handleResponse(
    responseData: TResponse,
  ): Promise<IAppMessage<TServiceMessage>[]>;

  abstract mapPromptToServiceMessages({
    userPrompt,
    systemPrompt,
  }: {
    userPrompt: string;
    systemPrompt: string;
  }): IAppMessage<TServiceMessage>[];

  abstract mapToolCallToServiceMessage({
    content,
    apiMessageData,
  }: {
    content: string;
    apiMessageData: TServiceMessage;
  }): IAppMessage<TServiceMessage>;
}

export class AppServiceHandler<TResponse, TServiceMessage> {
  service?: Service<TResponse, TServiceMessage>;

  constructor(service: Service<TResponse, TServiceMessage>) {
    this.service = service;
  }

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

  formatToolMessage(content: string, apiMessageData: TServiceMessage) {
    if (!this.service) {
      throw new Error("Service not initialized");
    }
    return this.service?.mapToolCallToServiceMessage({
      content,
      apiMessageData,
    });
  }

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
