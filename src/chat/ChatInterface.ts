export interface AIResponseConfig {
  type: "respond" | "thinking" | "action" | "error";
  text?: string;
  shouldAnimate?: boolean;
}


export abstract class ChatInterface {
  abstract sendMessage(): Promise<string>;
  abstract receiveResponse(response: AIResponseConfig): () => void;
  abstract confirm(prompt: string): Promise<boolean>;
}
