export interface IAppMessage {
  role: string;
  content: string;
  tool_call_id?: string;
}
