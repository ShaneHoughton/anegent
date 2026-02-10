import { IAppMessage } from "../types";
import { AppServiceHandler } from "../api/ApiService";
import { ToolSet } from "../tools/toolHelper";
import { logAIResponse, AIResponseConfig } from "../ui/CliArt";
export abstract class AgentJob {
  abstract greet(): string;
  abstract handleContext(context: IAppMessage[]): IAppMessage[];
  abstract onRespond(response: string): Promise<IAppMessage[]>;
}

export class Agent {
  systemPrompt: string;
  job: AgentJob;
  serviceHandler: AppServiceHandler<any>;
  toolset: ToolSet;
  context: IAppMessage[] = [];

  constructor(
    systemPrompt: string,
    job: AgentJob,
    serviceHandler: AppServiceHandler<any>,
    toolset?: ToolSet
  ) {
    this.systemPrompt = systemPrompt;
    this.job = job;
    this.serviceHandler = serviceHandler;
    this.toolset = toolset ?? new ToolSet([]);
  }

  logMessage(logConfig: AIResponseConfig) {
    logAIResponse(logConfig);
  }

  async prompt(input: string) {
    this.context.push({ role: "system", content: this.systemPrompt });
    this.context.push({ role: "user", content: input });
    const response = await this.Act(this.context);
    // clear context
    this.context = [];
    return response;
  }

  async Act(
    messages: IAppMessage[],
    toolCallMessages: IAppMessage[] = [],
    previousResponseData?: any
  ): Promise<IAppMessage[]> {
    const animateThink: AIResponseConfig = {
      type: "thinking",
      text: "Let's see...",
      shouldAnimate: true,
    };
    this.logMessage(animateThink);
    const serviceResponse = await this.serviceHandler.handleRequest({
      tools: this.toolset.toolDefinitions,
      messages,
      toolCallMessages: toolCallMessages,
      previousResponseData,
    });
    animateThink.shouldAnimate = false;
    const { appActions, responseData } = serviceResponse;

    let toolMessages: IAppMessage[] = [];
    for (const action of appActions) {
      const { actionType } = action;
      if (actionType === "message") {
        const message = action.message || "";
        this.logMessage({ text: message, type: "respond" });
        await this.job.onRespond(message);
        continue;
      }
      if (actionType === "tool_call") {
        const toolCalls = action.toolCalls || [];
        for (const toolCall of toolCalls) {
          const { toolName, arguments: args, callId } = toolCall;
          try {
            const result = await this.toolset.callTool(toolName, args);
            this.logMessage({
              text: `I called ${toolName}!`,
              type: "action",
            });
            const toolMessage = {
              role: "tool",
              tool_call_id: callId,
              content: JSON.stringify({ output: result }),
            };
            toolMessages.push(toolMessage);
          } catch (error) {
            this.logMessage({ text: JSON.stringify(error), type: "error" });
          }
        }
        continue;
      }
    }
    // needs to take further action
    if (toolMessages.length > 0) {
      return await this.Act(messages, toolMessages, responseData);
    }
    // done
    return this.job.handleContext(messages);
  }
}
