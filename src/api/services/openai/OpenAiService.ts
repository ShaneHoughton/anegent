import ApiHandler from "../../ApiHandler";
import { IOpenAIChatCompletionsResponse, IOpenAIMessage } from "./types/index";
import { Service, IServiceRequest } from "../../ApiService";
import { IAppMessage, IToolCallInfo } from "../../../types";

class OpenAIService
  extends ApiHandler
  implements Service<IOpenAIChatCompletionsResponse, IOpenAIMessage>
{
  constructor(url: string, model: string, apiKey: string) {
    super(url, model, apiKey);
  }

  mapPromptToServiceMessages({
    userPrompt,
    systemPrompt,
  }: {
    userPrompt: string;
    systemPrompt: string;
  }): IAppMessage<IOpenAIMessage>[] {
    return [
      {
        role: "system",
        content: systemPrompt,
        apiMessageData: {
          role: "system",
          content: systemPrompt,
        },
      },
      {
        role: "user",
        content: userPrompt,
        apiMessageData: {
          role: "user",
          content: userPrompt,
        },
      },
    ];
  }

  mapToolCallToServiceMessage({
    content,
    toolCallInfo,
  }: {
    content: string;
    toolCallInfo: IToolCallInfo;
  }): IAppMessage<IOpenAIMessage> {
    return {
      role: "tool",
      content,
      apiMessageData: {
        role: "tool",
        tool_call_id: toolCallInfo.callId,
        content,
      },
    };
  }

  async handleRequest({
    messages,
    toolDefinitions,
  }: IServiceRequest<IOpenAIMessage>): Promise<IOpenAIChatCompletionsResponse> {
    const openAIMessages = messages.map(
      (message) => message.apiMessageData || {},
    );
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
        tools: toolDefinitions,
      },
    });
    return response;
  }

  async handleResponse(
    responseData: IOpenAIChatCompletionsResponse,
  ): Promise<IAppMessage<IOpenAIMessage>[]> {
    const { choices } = responseData;
    const messages: IAppMessage<IOpenAIMessage>[] = [];
    for (const choice of choices) {
      const { finish_reason, message } = choice;
      if (finish_reason === "tool_calls") {
        const { tool_calls = [] } = message;
        for (const toolCall of tool_calls) {
          messages.push({
            role: "tool_call",
            toolCallInfo: {
              callId: toolCall.id,
              isComplete: false,
              toolName: toolCall.function.name,
              // could maybe pass down stringified args and parse them in the tool call handler to avoid issues
              args: JSON.parse(toolCall.function.arguments),
            },
            apiMessageData: message,
          });
        }
      }
      if (finish_reason === "stop") {
        const agentMessage = choice.message.content || "";
        messages.push({
          role: "assistant",
          content: agentMessage,
          apiMessageData: message,
        });
      }
    }
    return messages;
  }
}

export default OpenAIService;
