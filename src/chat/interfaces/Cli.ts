import readline from "readline";
import { logAIResponse, AIResponseConfig } from "../../ui/CliArt";

import { ChatInterface } from "../ChatInterface";

/**
 * Command-line interface implementation for chat interactions.
 * Handles user input/output through stdin/stdout using Node.js readline.
 *
 * @class Cli
 * @implements {ChatInterface}
 *
 * @method sendMessage - Prompts the user for input with a CLI arrow indicator
 * @method receiveResponse - Logs AI response and returns cleanup callback
 * @method confirm - Asks user for yes/no confirmation
 * @method getUserInput - Base method for reading user input from CLI

 */
export class Cli implements ChatInterface {
  /**
   * Sends a message by prompting the user for input.
   * @returns {Promise<string>} A promise that resolves to the user's input string.
   */
  sendMessage(): Promise<string> {
    return this.getUserInput("\n\x1b[36m--> \x1b[0m");
  }

  /**
   * Processes an AI response configuration and returns a cleanup function.
   *
   * @param response - The AI response configuration object to be logged and processed
   * @returns A cleanup interval function that can be used to clean up resources associated with the logged response
   */
  receiveResponse(response: AIResponseConfig): () => void {
    const { cleanupInterval } = logAIResponse(response);
    return cleanupInterval;
  }

  /**
   * Prompts the user with a confirmation question and returns a boolean based on their response.
   * @param prompt - The confirmation message to display to the user
   * @returns A promise that resolves to `true` if the user confirms `false` otherwise
   */
  async confirm(prompt: string): Promise<boolean> {
    const userResponse = await this.getUserInput(prompt);
    const afirmatives = ["yes", "y", "yup", "yeah"];
    const cleanedResponse = userResponse.trim().toLocaleLowerCase();
    return afirmatives.includes(cleanedResponse);
  }

  /**
   * Prompts the user for input and returns the response.
   * @param {string} prompt - The prompt text to display to the user
   * @returns {Promise<string>} Promise that resolves with the user's input
   */
  private async getUserInput(prompt: string): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise<string>((resolve) => {
      rl.question(prompt, (answer: string) => {
        rl.close();
        resolve(answer);
      });
    });
  }
}
