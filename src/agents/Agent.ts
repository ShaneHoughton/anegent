import { IAppMessage } from "../types";
import { AppServiceHandler } from "../api/ApiService";
import { ToolSet } from "../tools/toolHelper";
import { logAIResponse, AIResponseConfig } from "../ui/CliArt";

export abstract class AgentJob<TServiceMessage> {
  abstract greet(): string;
  abstract handleContext(
    context: IAppMessage<TServiceMessage>[],
  ): IAppMessage<TServiceMessage>[];
}

export class Agent<TResponse, TServiceMessage> {
  systemPrompt: string;
  job: AgentJob<TServiceMessage>;
  serviceHandler: AppServiceHandler<TResponse, TServiceMessage>;
  toolset: ToolSet;
  context: IAppMessage<TServiceMessage>[] = [];

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

  displayMessage(messageConfig: AIResponseConfig) {
    return logAIResponse({ ...messageConfig });
  }

  async prompt(userPrompt: string) {
    const initialMessages = this.serviceHandler.formatPromptMessages(
      userPrompt,
      this.systemPrompt,
    );
    await this.act(initialMessages);
    this.context = [];
  }

  async makeServiceRequest(messages: IAppMessage<TServiceMessage>[]) {
    return await this.serviceHandler.request({
      messages,
      toolDefinitions: this.toolset.toolDefinitions,
    });
  }

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
            const { toolName, args, isComplete } = message.toolCallInfo;
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
              message.apiMessageData,
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
