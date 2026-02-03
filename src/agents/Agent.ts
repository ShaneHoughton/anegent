import { IMessage } from "../types";
import { AppServiceHandler } from "../api/ApiService";
import { IAppRequest } from "../api/types";
import { ITool, IToolDefinition } from "../tools/types";
import { createToolset } from "../tools/toolHelper";

export abstract class AgentJob {
  abstract handleContext(context: IMessage[]): IMessage[];
}

export class Agent {
  systemPrompt: string;
  job: AgentJob;
  serviceHandler: AppServiceHandler<any>;
  tools: IToolDefinition[];
  toolHander: (toolName: string, args: any) => Promise<any>;
  context: IMessage[] = [];

  constructor(
    systemPrompt: string,
    job: AgentJob,
    tools: ITool[],
    serviceHandler: AppServiceHandler<any>
  ) {
    this.systemPrompt = systemPrompt;
    this.job = job;
    this.serviceHandler = serviceHandler;
    const toolset = createToolset(...tools);
    this.tools = toolset.tools;
    this.toolHander = toolset.callTool;
  }

  async Act(prompt: string) {
    const contextMessages = this.job.handleContext(this.context);
    contextMessages.unshift({ role: "system", content: this.systemPrompt });
    contextMessages.push({ role: "user", content: prompt });

    const request: IAppRequest = {
      messages: contextMessages,
      tools: this.tools,
    };
    const { actions } = await this.serviceHandler.handleService(request);

    for (const action of actions) {
      const { actionType } = action;
      if (actionType === "message") {
        const message = action.message || "";
        console.log({ role: "assistant", content: message });
        continue;
      }
      if (actionType === "tool_call") {
        const toolCalls = action.toolCalls || [];
        for (const toolCall of toolCalls) {
          const { toolName, arguments: args, callId } = toolCall;
          console.log(`Calling tool: ${toolName} with args:`, args);
          try {
            const result = await this.toolHander(toolName, args);
            console.log(
              `Tool ${toolName} (callId: ${callId}) returned:`,
              result
            );
          } catch (error) {
            console.error(
              `Error calling tool ${toolName} (callId: ${callId}):`,
              error
            );
          }
        }
        continue;
      }
    }
  }
}
