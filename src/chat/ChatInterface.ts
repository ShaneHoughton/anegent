export interface AIResponseConfig {
  type: "respond" | "thinking" | "action" | "error";
  text?: string;
  shouldAnimate?: boolean;
}

/**
 * Abstract base class for chat interface implementations.
 * Defines the contract for sending messages, receiving responses, and confirming prompts.
 */
export abstract class ChatInterface {
  /**
   * Sends a message through the chat interface.
   * @returns A promise that resolves to the response string from the chat service.
   */
  abstract sendMessage(): Promise<string>;

  /**
   * Receives and processes a response from the AI service.
   * @param response - The AI response configuration object containing response data and settings.
   * @returns A function that can be called to handle the response.
   */
  abstract receiveResponse(response: AIResponseConfig): () => void;

  /**
   * Prompts the user for confirmation on a given message.
   * @param prompt - The confirmation prompt message to display to the user.
   * @returns A promise that resolves to true if the user confirms, false otherwise.
   */
  abstract confirm(prompt: string): Promise<boolean>;
}
