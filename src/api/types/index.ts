import { IToolDefinition } from "../../tools/types";
import { IMessage } from "../../types";

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

export interface IAppResponse {
  actions: IAppAction[];
}

export interface IAppRequest {
  messages: IMessage[];
  tools: Array<IToolDefinition>;
}
