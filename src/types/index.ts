export interface IAppMessage<T> {
  role: string;
  content?: string;
  toolCallInfo?: {
    isComplete: boolean;
    toolName: string;
    args: Record<string, object>;
  };
  apiMessageData?: T;
}
