import ApiHandler from "../../ApiHandler";
import {
  IClaudeMessagesResponse,
  IClaudeMessage,
  IClaudeContentBlock,
  IClaudeToolResultBlock,
} from "./types/index";
import { Service, IServiceRequest } from "../../ApiService";
import { IAppMessage, IToolCallInfo } from "../../../types";

/**
 * Claude (Anthropic) service implementation for chat completions.
 */
class ClaudeService
  extends ApiHandler
  implements Service<IClaudeMessagesResponse, IClaudeMessage>
{
  /**
   * Creates a new Claude service instance.
   * @param {string} url - The Claude API endpoint URL
   * @param {string} model - The model identifier to use (e.g., "claude-3-5-sonnet-20241022")
   * @param {string} apiKey - The Claude API authentication key
   */
  constructor(url: string, model: string, apiKey: string) {
    super(url, model, apiKey);
  }

  /**
   * Maps system prompt to Claude message format.
   * Note: Claude uses a separate system parameter, not a message
   * @param {string} systemPrompt - The system prompt to guide behavior
   * @returns {IAppMessage<IClaudeMessage>} Formatted Claude message
   */
  mapSystemPromptToServiceMessage(
    systemPrompt: string,
  ): IAppMessage<IClaudeMessage> {
    // Claude stores system prompt separately, we'll handle this in handleRequest
    return {
      role: "system",
      content: systemPrompt,
      apiMessageData: {
        role: "user", // Placeholder, actual system is sent as parameter
        content: systemPrompt,
      },
    };
  }

  /**
   * Maps user prompt to Claude message format.
   * @param {string} userPrompt - The user prompt to guide behavior
   * @returns {IAppMessage<IClaudeMessage>} Formatted Claude message
   */
  mapUserPromptToServiceMessage(
    userPrompt: string,
  ): IAppMessage<IClaudeMessage> {
    return {
      role: "user",
      content: userPrompt,
      apiMessageData: {
        role: "user",
        content: userPrompt,
      },
    };
  }

  /**
   * Maps tool call results to Claude message format.
   * @param {Object} params - The tool call data to map
   * @param {string} params.content - The result content from the tool execution
   * @param {IToolCallInfo} params.toolCallInfo - Information about the tool call
   * @returns {IAppMessage<IClaudeMessage>} Formatted tool result message
   */
  mapToolCallToServiceMessage({
    content,
    toolCallInfo,
  }: {
    content: string;
    toolCallInfo: IToolCallInfo;
  }): IAppMessage<IClaudeMessage> {
    const toolResultBlock: IClaudeToolResultBlock = {
      type: "tool_result",
      tool_use_id: toolCallInfo.callId,
      content,
    };

    return {
      role: "tool",
      content,
      apiMessageData: {
        role: "user", // Tool results are sent as user messages in Claude API
        content: [toolResultBlock],
      },
    };
  }

  /**
   * Sends a request to the Claude API.
   * @param {IServiceRequest<IClaudeMessage>} params - The request data
   * @param {IAppMessage<IClaudeMessage>[]} params.messages - Messages to send
   * @param {IToolDefinition[]} params.toolDefinitions - Available tool definitions
   * @returns {Promise<IClaudeMessagesResponse>} The API response
   */
  async handleRequest({
    messages,
    toolDefinitions,
  }: IServiceRequest<IClaudeMessage>): Promise<IClaudeMessagesResponse> {
    // Extract system message if present
    const systemMessage = messages.find((msg) => msg.role === "system");
    const systemPrompt = systemMessage?.content || "";

    // Filter out system messages and convert to Claude format
    const claudeMessages = messages
      .filter((msg) => msg.role !== "system")
      .map((message) => message.apiMessageData || { role: "user", content: "" });

    // Convert tool definitions to Claude format
    const claudeTools = toolDefinitions.map((tool) => ({
      name: tool.function.name,
      description: tool.function.description,
      input_schema: {
        type: tool.function.parameters.type,
        properties: tool.function.parameters.properties,
        required: tool.function.parameters.required,
      },
    }));

    const requestBody: any = {
      model: this.model,
      max_tokens: 4096,
      messages: claudeMessages,
    };

    if (systemPrompt) {
      requestBody.system = systemPrompt;
    }

    if (claudeTools.length > 0) {
      requestBody.tools = claudeTools;
    }

    const response = await this.makeRequest<IClaudeMessagesResponse>({
      url: this.url,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: requestBody,
    });

    return response;
  }

  /**
   * Processes the Claude API response into application messages.
   * @param {IClaudeMessagesResponse} responseData - The raw Claude API response
   * @returns {Promise<IAppMessage<IClaudeMessage>[]>} Array of formatted application messages
   */
  async handleResponse(
    responseData: IClaudeMessagesResponse,
  ): Promise<IAppMessage<IClaudeMessage>[]> {
    const { content, stop_reason } = responseData;
    const messages: IAppMessage<IClaudeMessage>[] = [];

    // Process content blocks
    for (const block of content) {
      if (block.type === "text" && block.text) {
        messages.push({
          role: "assistant",
          content: block.text,
          apiMessageData: {
            role: "assistant",
            content: block.text,
          },
        });
      } else if (block.type === "tool_use" && block.id && block.name) {
        messages.push({
          role: "tool_call",
          toolCallInfo: {
            callId: block.id,
            isComplete: false,
            toolName: block.name,
            args: (block.input as Record<string, unknown>) || {},
          },
          apiMessageData: {
            role: "assistant",
            content: [block],
          },
        });
      }
    }

    return messages;
  }
}

export default ClaudeService;
