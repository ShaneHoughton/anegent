import readline from "readline";
import { logAIResponse, AIResponseConfig } from "../../ui/CliArt";

import { ChatInterface } from "../ChatInterface";

export class Cli implements ChatInterface {
  sendMessage(): Promise<string> {
    return this.getUserInput("\n\x1b[36m--> \x1b[0m");
  }
  receiveResponse(response: AIResponseConfig): () => void {
    const { cleanupInterval } = logAIResponse(response);
    return cleanupInterval;
  }
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
  async getUserInput(prompt: string): Promise<string> {
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
