export interface IClaudeContentBlock {
  type: "text" | "tool_use" | "tool_result";
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  content?: string;
}

export interface IClaudeMessage {
  role: "user" | "assistant";
  content: string | IClaudeContentBlock[];
}

export interface IClaudeToolUseBlock {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface IClaudeToolResultBlock {
  type: "tool_result";
  tool_use_id: string;
  content: string;
}

export interface IClaudeMessagesResponse {
  id: string;
  type: "message";
  role: "assistant";
  content: IClaudeContentBlock[];
  model: string;
  stop_reason: "end_turn" | "max_tokens" | "stop_sequence" | "tool_use" | null;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}
