import ApiHandler from "../../ApiHandler";
import { IOpenAIChatCompletionsResponse, IOpenAIMessage } from "./types/index";
import { Service, IServiceRequest } from "../../ApiService";
import { IAppMessage, IToolCallInfo } from "../../../types";

/**
 * OpenAI service implementation for chat completions.
 */
class OpenAIService
  extends ApiHandler
  implements Service<IOpenAIChatCompletionsResponse, IOpenAIMessage>
{
  /**
   * Creates a new OpenAI service instance.
   * @param {string} url - The OpenAI API endpoint URL
   * @param {string} model - The model identifier to use (e.g., "gpt-4")
   * @param {string} apiKey - The OpenAI API authentication key
   */
  constructor(url: string, model: string, apiKey: string) {
    super(url, model, apiKey);
  }

  /**
   * Maps user and system prompts to OpenAI message format.
   * @param {Object} params - The prompts to map
   * @param {string} params.userPrompt - The user's input prompt
   * @param {string} params.systemPrompt - The system prompt to guide behavior
   * @returns {IAppMessage<IOpenAIMessage>[]} Array of formatted OpenAI messages
   */
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

  /**
   * Maps tool call results to OpenAI message format.
   * @param {Object} params - The tool call data to map
   * @param {string} params.content - The result content from the tool execution
   * @param {IToolCallInfo} params.toolCallInfo - Information about the tool call
   * @returns {IAppMessage<IOpenAIMessage>} Formatted tool result message
   */
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

  /**
   * Sends a request to the OpenAI API.
   * @param {IServiceRequest<IOpenAIMessage>} params - The request data
   * @param {IAppMessage<IOpenAIMessage>[]} params.messages - Messages to send
   * @param {IToolDefinition[]} params.toolDefinitions - Available tool definitions
   * @returns {Promise<IOpenAIChatCompletionsResponse>} The API response
   */
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

  /**
   * Processes the OpenAI API response into application messages.
   * @param {IOpenAIChatCompletionsResponse} responseData - The raw OpenAI API response
   * @returns {Promise<IAppMessage<IOpenAIMessage>[]>} Array of formatted application messages
   */
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
