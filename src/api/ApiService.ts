import { IAppRequest, IAppResponse } from "./types";

export abstract class Service<T> {
  abstract RequestHandler(request: IAppRequest): Promise<T>;
  abstract ResponseMapper(response: T): Promise<IAppResponse>;
}

export class AppServiceHandler<T> {
  service?: Service<T>;

  constructor(service: Service<T>) {
    this.service = service;
  }

  async handleService(request: IAppRequest): Promise<IAppResponse> {
    if (!this.service) {
      throw new Error("Service not initialized");
    }
    const response = await this.service.RequestHandler(request);
    return await this.service.ResponseMapper(response);
  }
}
