import { IAppMessage } from "../types";
import { AppServiceHandler } from "../api/ApiService";
import { ToolSet } from "../tools/toolHelper";
import { AIResponseConfig, ChatInterface } from "../chat/ChatInterface";

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
   * @returns {Promise<IAppMessage<TServiceMessage>[]>} Processed array of messages
   */
  abstract handleContext(
    context: IAppMessage<TServiceMessage>[],
  ): Promise<IAppMessage<TServiceMessage>[]>;
}

/**
 * Main agent class that orchestrates AI interactions with tool support.
 */
export class Agent<TResponse, TServiceMessage> {
  chatInterface: ChatInterface;
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
    chatInterface: ChatInterface,
    toolset?: ToolSet,
  ) {
    this.systemPrompt = systemPrompt;
    this.job = job;
    this.serviceHandler = serviceHandler;
    this.chatInterface = chatInterface;
    this.toolset = toolset ?? new ToolSet([]);
    this.toolset.chatInterface = chatInterface;
    this.context.push(
      this.serviceHandler.formatSystemPromptMessage(this.systemPrompt),
    );
  }

  /**
   * Displays a message to the user interface.
   * @param {AIResponseConfig} messageConfig - Configuration for the message display
   * @returns {Object} Object with cleanupInterval method to stop animations
   */
  displayMessage(messageConfig: AIResponseConfig) {
    return this.chatInterface.receiveResponse(messageConfig);
  }

  /**
   * Processes a user prompt and executes the agent workflow.
   * @param {string} userPrompt - The user's input prompt
   * @returns {Promise<void>}
   */
  async prompt(userPrompt: string) {
    const userMessage = this.serviceHandler.formatUserPromptMessage(userPrompt);
    this.context = [...this.context, userMessage];
    await this.actAndUpdateContext(this.context);
    const returned = await this.job.handleContext(this.context);
    this.context = returned;
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
   * Executes agent actions including tool calls and message processing and updates the context with the messages.
   * @param {IAppMessage<TServiceMessage>[]} messages - Messages to process
   * @returns {Promise<void>}
   */
  async actAndUpdateContext(
    messages: IAppMessage<TServiceMessage>[],
  ): Promise<void> {
    const cleanup = this.displayMessage({
      type: "thinking",
    });
    const newMessages = await this.makeServiceRequest(messages);
    cleanup();

    let toolCallsReceived = false;
    for (const message of newMessages) {
      switch (message.role) {
        case "tool_call":
          if (message.toolCallInfo && message.apiMessageData) {
            const { toolCallInfo } = message;
            const { toolName, args, isComplete } = toolCallInfo;
            if (isComplete) {
              continue;
            }

            toolCallsReceived = true;
            const { success, result } = await this.toolset.callTool(
              toolName,
              args,
            );

            if (success) {
              this.displayMessage({
                type: "action",
                text: `Called tool ${toolName}...`,
              });
            }

            const toolMessage = this.serviceHandler.formatToolMessage(
              JSON.stringify({ result }),
              toolCallInfo,
            );

            message.toolCallInfo.isComplete = true;
            newMessages.push(toolMessage);
          }
          break;

        case "assistant":
          this.displayMessage({ type: "respond", text: message.content });
          break;
      }
    }
    messages.push(...newMessages)
    if (toolCallsReceived) {
      await this.actAndUpdateContext(messages);
    }
    this.context = messages;
  }
}
