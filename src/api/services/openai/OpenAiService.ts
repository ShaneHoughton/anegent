import ApiHandler from "../../ApiHandler";
import { IOpenAIChatCompletionsResponse } from "./types";
import {
  Service,
  IAppRequest,
  IAppResponse,
  IAppAction,
} from "../../ApiService";

class OpenAIService
  extends ApiHandler
  implements Service<IOpenAIChatCompletionsResponse>
{
  constructor(url: string, model: string, apiKey: string) {
    super(url, model, apiKey);
  }

  async ResponseMapper(
    response: IOpenAIChatCompletionsResponse
  ): Promise<IAppResponse> {
    const { choices } = response;
    const actions: IAppAction[] = [];
    for (const choice of choices) {
      const { finish_reason } = choice;
      if (finish_reason === "tool_calls") {
        const { tool_calls = [] } = choice.message;
        for (const toolCall of tool_calls) {
          actions.push({
            actionType: "tool_call",
            toolCalls: [
              {
                toolName: toolCall.function.name,
                arguments: JSON.parse(toolCall.function.arguments),
                callId: toolCall.id,
              },
            ],
          });
        }
      }
      if (finish_reason === "stop") {
        const agentMessage = choice.message.content || "";
        actions.push({
          actionType: "message",
          message: agentMessage,
        });
      }
    }
    return { actions };
  }

  async RequestHandler(
    appRequest: IAppRequest
  ): Promise<IOpenAIChatCompletionsResponse> {
    const response = await this.makeRequest<IOpenAIChatCompletionsResponse>({
      url: this.url,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: {
        model: this.model,
        messages: appRequest.messages,
        tools: appRequest.tools,
      },
    });
    return response;
  }
}

export default OpenAIService;
