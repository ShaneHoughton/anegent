export interface IAppMessage<T> {
  role: string;
  content?: string;
  toolCallInfo?: IToolCallInfo;
  apiMessageData?: T;
}

export interface IToolCallInfo {
  callId: string;
  isComplete: boolean;
  toolName: string;
  args: Record<string, unknown>;
}
