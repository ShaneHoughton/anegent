import { IAppMessage } from "../types";
import { AgentJob, Agent } from "./Agent";
import codingTools from "../tools/coding";
import OpenAIServiceHander from "../api/services/openai/handler";
import { IOpenAIChatCompletionsResponse, IOpenAIMessage } from "../api/services/openai/types";

/**
 * Job implementation for the coding agent.
 */
class CodingAgentJob extends AgentJob<IOpenAIMessage> {
  /**
   * Returns the greeting message for the coding agent.
   */
  greet() {
    return "Hello there! I'm your coding assistant. How can I help you today?";
  }

  /**
   * Handles the context for the coding agent.
   */
  handleContext(context: IAppMessage<IOpenAIMessage>[]): IAppMessage<IOpenAIMessage>[] {
    return [...context];
  }

  /**
   * Processes agent responses.
   */
  async onRespond(response: string): Promise<IAppMessage<IOpenAIMessage>[]> {
    const messages: IAppMessage<IOpenAIMessage>[] = [];
    messages.push({ role: "assistant", content: response });
    return messages;
  }
}

/**
 * Agent specialized for coding tasks with file manipulation capabilities.
 */
class CodingAgent extends Agent<IOpenAIChatCompletionsResponse, IOpenAIMessage> {
  /**
   * Creates a new coding agent instance.
   */
  constructor() {
    const systemPrompt = [
      "You are a helpful coding assistant",
      "Always call a tool whenever you can to help the user with coding tasks",
      "Do not call a tool if the user is asking a non-coding related question",
      "Avoid redundant tool calls",
    ].join(".");

    super(systemPrompt, new CodingAgentJob(), OpenAIServiceHander, codingTools);
    this.displayMessage({ type: "respond", text: this.job.greet() });
  }
}

export default CodingAgent;
