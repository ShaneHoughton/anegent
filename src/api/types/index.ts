import { IToolDefinition } from "../../tools/types";
import { IAppMessage } from "../../types";

export interface IRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: any;
}

type TAction = "message" | "tool_call" | "error";

export interface IAppAction {
  actionType: TAction;
  message?: string;
  toolCalls?: Array<{
    toolName: string;
    arguments: object;
    callId: string;
  }> | null;
}

export interface IAppRequest {
  messages: IAppMessage[];
  tools: Array<IToolDefinition>;
}

export interface IToolCallData<T> {
  toolCalls: IAppMessage[];
  previousResponse: T;
}
