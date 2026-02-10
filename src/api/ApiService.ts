import { IAppAction, IAppRequest, IToolCallData } from "./types";
import { IAppMessage } from "../types";
import { IToolDefinition } from "../tools/types";

export interface IServiceRequest<T> {
  tools: IToolDefinition[];
  messages: IAppMessage[];
  toolCallMessages?: IAppMessage[];
  previousResponseData?: T;
}

export interface IServiceResponse<T> {
  appActions: IAppAction[];
  responseData: T;
}
export abstract class Service<T> {
  abstract RequestHandler(requestData: IServiceRequest<T>): Promise<T>;

  abstract ResponseHandler(responseData: T): Promise<IServiceResponse<T>>;
}

export class AppServiceHandler<T> {
  service?: Service<T>;

  constructor(service: Service<T>) {
    this.service = service;
  }

  async handleRequest(
    request: IServiceRequest<T>
  ): Promise<IServiceResponse<T>> {
    if (!this.service) {
      throw new Error("Service not initialized");
    }
    const response = await this.service.RequestHandler(request);
    return await this.service.ResponseHandler(response);
  }
}
