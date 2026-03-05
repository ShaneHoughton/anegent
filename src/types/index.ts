type TRoles = "user" | "assistant" | "system" | "tool" | "tool_call";
export interface IAppMessage<T> {
  role: TRoles;
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
export interface AIResponseConfig {
  type: "respond" | "thinking" | "action" | "error";
  text?: string;
  shouldAnimate?: boolean;
}
