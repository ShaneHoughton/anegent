import { IAppMessage, IToolCallInfo } from "../types";
import { AppServiceHandler } from "../api/ApiService";
import { ToolSet } from "../tools/toolHelper";
import { logAIResponse, AIResponseConfig } from "../ui/CliArt";

/**
 * Base class for agent jobs that define agent behavior.
 */
export abstract class AgentJob<TServiceMessage> {
  /**
   * Returns a greeting message for the agent.
   * @returns {string} The greeting message
   */
  abstract greet(): string;
  /**
   * Handles and processes the message context.
   * @param {IAppMessage<TServiceMessage>[]} context - Array of messages to process
   * @returns {IAppMessage<TServiceMessage>[]} Processed array of messages
   */
  abstract handleContext(
    context: IAppMessage<TServiceMessage>[],
  ): IAppMessage<TServiceMessage>[];
}

/**
 * Main agent class that orchestrates AI interactions with tool support.
 */
export class Agent<TResponse, TServiceMessage> {
  systemPrompt: string;
  job: AgentJob<TServiceMessage>;
  serviceHandler: AppServiceHandler<TResponse, TServiceMessage>;
  toolset: ToolSet;
  context: IAppMessage<TServiceMessage>[] = [];

  /**
   * Creates a new agent instance.
   * @param {string} systemPrompt - The system prompt to guide agent behavior
   * @param {AgentJob<TServiceMessage>} job - The job implementation defining agent behavior
   * @param {AppServiceHandler<TResponse, TServiceMessage>} serviceHandler - Handler for AI service interactions
   * @param {ToolSet} [toolset] - Optional set of tools available to the agent
   */
  constructor(
    systemPrompt: string,
    job: AgentJob<TServiceMessage>,
    serviceHandler: AppServiceHandler<TResponse, TServiceMessage>,
    toolset?: ToolSet,
  ) {
    this.systemPrompt = systemPrompt;
    this.job = job;
    this.serviceHandler = serviceHandler;
    this.toolset = toolset ?? new ToolSet([]);
  }

  /**
   * Displays a message to the user interface.
   * @param {AIResponseConfig} messageConfig - Configuration for the message display
   * @returns {Object} Object with cleanupInterval method to stop animations
   */
  displayMessage(messageConfig: AIResponseConfig) {
    return logAIResponse({ ...messageConfig });
  }

  /**
   * Processes a user prompt and executes the agent workflow.
   * @param {string} userPrompt - The user's input prompt
   * @returns {Promise<void>}
   */
  async prompt(userPrompt: string) {
    const initialMessages = this.serviceHandler.formatPromptMessages(
      userPrompt,
      this.systemPrompt,
    );
    await this.act(initialMessages);
    this.context = [];
  }

  /**
   * Makes a request to the AI service with the current messages.
   * @param {IAppMessage<TServiceMessage>[]} messages - Messages to send to the AI service
   * @returns {Promise<IAppMessage<TServiceMessage>[]>} Response messages from the AI service
   */
  async makeServiceRequest(messages: IAppMessage<TServiceMessage>[]) {
    return await this.serviceHandler.request({
      messages,
      toolDefinitions: this.toolset.toolDefinitions,
    });
  }

  /**
   * Executes agent actions including tool calls and message processing.
   * @param {IAppMessage<TServiceMessage>[]} messages - Messages to process
   * @returns {Promise<void>}
   */
  async act(messages: IAppMessage<TServiceMessage>[]) {
    const cleanup = this.displayMessage({
      type: "thinking",
    });
    const response = await this.makeServiceRequest(messages);
    cleanup.cleanupInterval();

    messages.push(...response);
    let toolCallsReceived = false;
    for (const message of messages) {
      switch (message.role) {
        case "tool_call":
          if (message.toolCallInfo && message.apiMessageData) {
            const { toolCallInfo } = message;
            const { toolName, args, isComplete } = toolCallInfo;
            if (isComplete) {
              continue;
            }

            toolCallsReceived = true;
            const toolCallResult = await this.toolset.callTool(toolName, args);

            this.displayMessage({
              type: "action",
              text: `Called tool ${toolName}...`,
            });

            const toolMessage = this.serviceHandler.formatToolMessage(
              JSON.stringify({ result: toolCallResult }),
              toolCallInfo,
            );

            message.toolCallInfo.isComplete = true;
            messages.push(toolMessage);
          }
          break;

        case "assistant":
          this.displayMessage({ type: "respond", text: message.content });
          break;
      }
    }

    if (toolCallsReceived) {
      await this.act(messages);
    }
  }
}
