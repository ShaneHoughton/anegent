import ApiHandler from "../../ApiHandler";
import { IOllamaChatResponse, IOllamaMessage } from "./types/index";
import { Service, IServiceRequest } from "../../ApiService";
import { IAppMessage, IToolCallInfo } from "../../../types";

/**
 * Ollama service implementation for chat completions.
 * Ollama provides a local LLM API compatible with OpenAI's format.
 */
class OllamaService
  extends ApiHandler
  implements Service<IOllamaChatResponse, IOllamaMessage>
{
  /**
   * Creates a new Ollama service instance.
   * @param {string} url - The Ollama API endpoint URL (typically http://localhost:11434/api/chat)
   * @param {string} model - The model identifier to use (e.g., "llama2", "mistral", "codellama")
   * @param {string} apiKey - The API key (Ollama doesn't require auth by default, but kept for interface compatibility)
   */
  constructor(url: string, model: string, apiKey: string = "") {
    super(url, model, apiKey);
  }

  /**
   * Maps system prompt to Ollama message format.
   * @param {string} systemPrompt - The system prompt to guide behavior
   * @returns {IAppMessage<IOllamaMessage>} Formatted Ollama message
   */
  mapSystemPromptToServiceMessage(
    systemPrompt: string,
  ): IAppMessage<IOllamaMessage> {
    return {
      role: "system",
      content: systemPrompt,
      apiMessageData: {
        role: "system",
        content: systemPrompt,
      },
    };
  }

  /**
   * Maps user prompt to Ollama message format.
   * @param {string} userPrompt - The user prompt to guide behavior
   * @returns {IAppMessage<IOllamaMessage>} Formatted Ollama message
   */
  mapUserPromptToServiceMessage(
    userPrompt: string,
  ): IAppMessage<IOllamaMessage> {
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
   * Maps tool call results to Ollama message format.
   * @param {Object} params - The tool call data to map
   * @param {string} params.content - The result content from the tool execution
   * @param {IToolCallInfo} params.toolCallInfo - Information about the tool call
   * @returns {IAppMessage<IOllamaMessage>} Formatted tool result message
   */
  mapToolCallToServiceMessage({
    content,
    toolCallInfo,
  }: {
    content: string;
    toolCallInfo: IToolCallInfo;
  }): IAppMessage<IOllamaMessage> {
    return {
      role: "tool",
      content,
      apiMessageData: {
        role: "tool",
        content,
      },
    };
  }

  /**
   * Sends a request to the Ollama API.
   * @param {IServiceRequest<IOllamaMessage>} params - The request data
   * @param {IAppMessage<IOllamaMessage>[]} params.messages - Messages to send
   * @param {IToolDefinition[]} params.toolDefinitions - Available tool definitions
   * @returns {Promise<IOllamaChatResponse>} The API response
   */
  async handleRequest({
    messages,
    toolDefinitions,
  }: IServiceRequest<IOllamaMessage>): Promise<IOllamaChatResponse> {
    const ollamaMessages = messages.map(
      (message) => message.apiMessageData || { role: "user", content: "" },
    );

    const requestBody: any = {
      model: this.model,
      messages: ollamaMessages,
      stream: false, // Disable streaming for simplicity
    };

    // Add tools if provided (note: tool support varies by Ollama model)
    if (toolDefinitions && toolDefinitions.length > 0) {
      requestBody.tools = toolDefinitions;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add auth header only if API key is provided
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const response = await this.makeRequest<IOllamaChatResponse>({
      url: this.url,
      method: "POST",
      headers,
      body: requestBody,
    });

    return response;
  }

  /**
   * Processes the Ollama API response into application messages.
   * @param {IOllamaChatResponse} responseData - The raw Ollama API response
   * @returns {Promise<IAppMessage<IOllamaMessage>[]>} Array of formatted application messages
   */
  async handleResponse(
    responseData: IOllamaChatResponse,
  ): Promise<IAppMessage<IOllamaMessage>[]> {
    const messages: IAppMessage<IOllamaMessage>[] = [];
    const { message } = responseData;

    // Convert response message to IOllamaMessage format
    const ollamaMessage: IOllamaMessage = {
      role: message.role,
      content: message.content,
    };

    // Check for tool calls
    if (message.tool_calls && message.tool_calls.length > 0) {
      for (const toolCall of message.tool_calls) {
        messages.push({
          role: "tool_call",
          toolCallInfo: {
            callId: `ollama_${Date.now()}_${Math.random()}`, // Generate ID since Ollama may not provide one
            isComplete: false,
            toolName: toolCall.function.name,
            args: toolCall.function.arguments,
          },
          apiMessageData: ollamaMessage,
        });
      }
    }

    // Add regular message content
    if (message.content) {
      messages.push({
        role: "assistant",
        content: message.content,
        apiMessageData: ollamaMessage,
      });
    }

    return messages;
  }
}

export default OllamaService;
