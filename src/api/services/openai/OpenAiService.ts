import ApiHandler from "../../ApiHandler";
import { IAppRequest, IAppAction, IToolCallData } from "../../types";
import { IOpenAIChatCompletionsResponse, IOpenAIMessage } from "./types/index";
import { Service, IServiceRequest, IServiceResponse } from "../../ApiService";

class OpenAIService
  extends ApiHandler
  implements Service<IOpenAIChatCompletionsResponse>
{
  constructor(url: string, model: string, apiKey: string) {
    super(url, model, apiKey);
  }
  async RequestHandler({
    tools,
    messages,
    toolCallMessages,
    previousResponseData,
  }: IServiceRequest<IOpenAIChatCompletionsResponse>): Promise<IOpenAIChatCompletionsResponse> {
    const openAIMessages: IOpenAIMessage[] = [];
    openAIMessages.push(
      ...messages.map((message) => ({
        content: message.content,
        role: message.role,
      }))
    );
    if (previousResponseData && toolCallMessages) {
      const { choices } = previousResponseData;
      for (const choice of choices) {
        const { finish_reason } = choice;
        if (finish_reason === "tool_calls") {
          const { message } = choice;
          openAIMessages.push(message);
        }
      }
      openAIMessages.push(...toolCallMessages);
    }
    const response = await this.makeRequest<IOpenAIChatCompletionsResponse>({
      url: this.url,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: {
        model: this.model,
        messages: openAIMessages,
        tools: tools,
      },
    });
    return response;
  }

  async ResponseHandler(responseData: IOpenAIChatCompletionsResponse): Promise<{
    appActions: IAppAction[];
    responseData: IOpenAIChatCompletionsResponse;
  }> {
    const { choices } = responseData;
    const appActions: IAppAction[] = [];
    for (const choice of choices) {
      const { finish_reason } = choice;
      if (finish_reason === "tool_calls") {
        const { tool_calls = [] } = choice.message;
        for (const toolCall of tool_calls) {
          appActions.push({
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
        appActions.push({
          actionType: "message",
          message: agentMessage,
        });
      }
    }
    return { appActions, responseData };
  }
}

export default OpenAIService;
