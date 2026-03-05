# API Handlers Documentation

This project supports multiple AI model API handlers following a consistent interface pattern. Each handler extends the base `Service` class and implements the same methods for handling chat completions.

## Available Services

### 1. OpenAI Service

**Location:** `src/api/services/openai/`

**API Endpoint:** `https://api.openai.com/v1/chat/completions`

**Models:** GPT-4, GPT-3.5-turbo, etc.

**Environment Variables:**
```bash
OPENAI_API_KEY=your_api_key_here
```

**Usage:**
```typescript
import OpenAIServiceHandler from './api/services/openai/handler';

// The handler is pre-configured with:
// - Model: gpt-5-nano-2025-08-07
// - URL: https://api.openai.com/v1/chat/completions
// - API Key: from OPENAI_API_KEY env variable

const messages = [
  OpenAIServiceHandler.formatSystemPromptMessage("You are a helpful assistant"),
  OpenAIServiceHandler.formatUserPromptMessage("Hello!")
];

const response = await OpenAIServiceHandler.request({
  messages,
  toolDefinitions: []
});
```

**API Reference:**
- [OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat)
- Authentication: Bearer token in `Authorization` header
- Tool calling: Supported via `tools` parameter
- Message format: `{role: string, content: string, tool_calls?: object[]}`

---

### 2. Claude Service (Anthropic)

**Location:** `src/api/services/claude/`

**API Endpoint:** `https://api.anthropic.com/v1/messages`

**Models:** claude-3-5-sonnet-20241022, claude-3-opus, claude-3-haiku

**Environment Variables:**
```bash
CLAUDE_API_KEY=your_api_key_here
```

**Usage:**
```typescript
import ClaudeServiceHandler from './api/services/claude/handler';

// The handler is pre-configured with:
// - Model: claude-3-5-sonnet-20241022
// - URL: https://api.anthropic.com/v1/messages
// - API Key: from CLAUDE_API_KEY env variable

const messages = [
  ClaudeServiceHandler.formatSystemPromptMessage("You are a helpful assistant"),
  ClaudeServiceHandler.formatUserPromptMessage("Hello!")
];

const response = await ClaudeServiceHandler.request({
  messages,
  toolDefinitions: []
});
```

**API Reference:**
- [Anthropic Messages API](https://docs.anthropic.com/claude/reference/messages_post)
- Authentication: `x-api-key` header
- API Version: `anthropic-version: 2023-06-01` header
- Tool calling: Supported via `tools` parameter
- System prompt: Sent as separate `system` parameter, not as a message
- Message format: `{role: "user" | "assistant", content: string | ContentBlock[]}`
- Content blocks can be: text, tool_use, or tool_result

**Key Differences from OpenAI:**
- System prompts are sent as a separate `system` parameter, not as messages
- Tool results are sent as user messages with `tool_result` content blocks
- Requires `max_tokens` parameter (default: 4096)
- Uses `x-api-key` header instead of `Authorization: Bearer`

---

### 3. Ollama Service (Local LLMs)

**Location:** `src/api/services/ollama/`

**API Endpoint:** `http://localhost:11434/api/chat` (default)

**Models:** llama2, mistral, codellama, and other locally installed models

**Environment Variables:**
```bash
OLLAMA_MODEL=llama2                              # Optional, defaults to "llama2"
OLLAMA_API_URL=http://localhost:11434/api/chat   # Optional, defaults to localhost
OLLAMA_API_KEY=                                  # Optional, Ollama doesn't require auth by default
```

**Usage:**
```typescript
import OllamaServiceHandler from './api/services/ollama/handler';

// The handler is pre-configured with:
// - Model: from OLLAMA_MODEL env variable (default: "llama2")
// - URL: from OLLAMA_API_URL env variable (default: "http://localhost:11434/api/chat")
// - API Key: from OLLAMA_API_KEY env variable (optional, defaults to empty string)

const messages = [
  OllamaServiceHandler.formatSystemPromptMessage("You are a helpful assistant"),
  OllamaServiceHandler.formatUserPromptMessage("Hello!")
];

const response = await OllamaServiceHandler.request({
  messages,
  toolDefinitions: []
});
```

**API Reference:**
- [Ollama API Documentation](https://github.com/ollama/ollama/blob/main/docs/api.md)
- Authentication: Not required by default (local deployment)
- Tool calling: Supported by some models (varies by model)
- Message format: Compatible with OpenAI format
- Streaming: Disabled by default (`stream: false`)

**Key Differences from Cloud APIs:**
- Runs locally, no API key required by default
- Model must be installed locally (`ollama pull <model>`)
- Tool support varies by model
- No usage/token tracking in response
- Response includes timing information (duration, eval_count, etc.)

**Prerequisites:**
1. Install Ollama: https://ollama.ai/
2. Pull a model: `ollama pull llama2`
3. Ensure Ollama is running: `ollama serve`

---

## Common Interface

All services implement the same `Service` interface:

```typescript
interface Service<TResponse, TServiceMessage> {
  // Send a request to the AI service
  handleRequest(requestData: IServiceRequest<TServiceMessage>): Promise<TResponse>;

  // Process the response from the AI service
  handleResponse(responseData: TResponse): Promise<IAppMessage<TServiceMessage>[]>;

  // Map system prompt to service-specific format
  mapSystemPromptToServiceMessage(systemPrompt: string): IAppMessage<TServiceMessage>;

  // Map user prompt to service-specific format
  mapUserPromptToServiceMessage(userPrompt: string): IAppMessage<TServiceMessage>;

  // Map tool results to service-specific format
  mapToolCallToServiceMessage(params: {
    content: string;
    toolCallInfo: IToolCallInfo;
  }): IAppMessage<TServiceMessage>;
}
```

## Creating a New Service Handler

To add a new AI service, follow this pattern:

1. **Create types file** (`src/api/services/{service}/types/index.ts`):
   ```typescript
   export interface IServiceMessage {
     role: string;
     content: string;
     // Add service-specific fields
   }

   export interface IServiceResponse {
     // Define response structure
   }
   ```

2. **Create service class** (`src/api/services/{service}/ServiceName.ts`):
   ```typescript
   import ApiHandler from "../../ApiHandler";
   import { Service, IServiceRequest } from "../../ApiService";

   class ServiceName extends ApiHandler implements Service<IServiceResponse, IServiceMessage> {
     constructor(url: string, model: string, apiKey: string) {
       super(url, model, apiKey);
     }

     // Implement all required methods
   }
   ```

3. **Create handler** (`src/api/services/{service}/handler.ts`):
   ```typescript
   import { AppServiceHandler } from "../../ApiService";
   import ServiceName from "./ServiceName";

   const MODEL = process.env.SERVICE_MODEL || "default-model";
   const API_URL = "https://api.service.com/endpoint";
   const API_KEY = process.env.SERVICE_API_KEY;

   if (!API_KEY) {
     throw new Error("Missing SERVICE_API_KEY environment variable");
   }

   export default new AppServiceHandler(new ServiceName(API_URL, MODEL, API_KEY));
   ```

## Tool Calling

All services support tool calling, though implementation varies:

**OpenAI Format:**
```json
{
  "tools": [{
    "type": "function",
    "function": {
      "name": "tool_name",
      "description": "Tool description",
      "parameters": { "type": "object", "properties": {...}, "required": [...] }
    }
  }]
}
```

**Claude Format:**
```json
{
  "tools": [{
    "name": "tool_name",
    "description": "Tool description",
    "input_schema": { "type": "object", "properties": {...}, "required": [...] }
  }]
}
```

**Ollama Format:**
- Uses OpenAI-compatible format
- Tool support varies by model

## Error Handling

Each service uses the base `ApiHandler.makeRequest()` method which:
- Sets a 3-minute timeout
- Catches and logs errors
- Re-throws errors for handler processing

Example error handling:
```typescript
try {
  const response = await ServiceHandler.request({ messages, toolDefinitions });
} catch (error) {
  console.error("API request failed:", error);
}
```

## Environment Setup

Create a `.env` file in the project root:

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Claude (Anthropic)
CLAUDE_API_KEY=sk-ant-...

# Ollama (optional, for local models)
OLLAMA_MODEL=llama2
OLLAMA_API_URL=http://localhost:11434/api/chat
OLLAMA_API_KEY=
```

## Testing

To test each service:

1. Set up environment variables
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run the application: `npm start`

## Additional Resources

- **OpenAI:** https://platform.openai.com/docs
- **Claude (Anthropic):** https://docs.anthropic.com/
- **Ollama:** https://ollama.ai/ and https://github.com/ollama/ollama
