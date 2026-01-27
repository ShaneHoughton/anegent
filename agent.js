const axios = require("axios");
const { createToolset } = require("./tools/tooling");
const codingTools = require("./tools/coding");
console.log(codingTools);
const { tools, callTool } = createToolset(...codingTools);

/**
 * Makes an API call to OpenAI.
 * @param {string} apiKey - Your OpenAI API key.
 * @param {Array<object>} messages - The messages to send to OpenAI.
 * @param {string} model - The OpenAI model to use (e.g., "gpt-5-nano-2025-08-07").
 * @returns {Promise<string>} - The response from OpenAI.
 */
async function callOpenAI(apiKey, messages, model = "gpt-5-nano-2025-08-07") {
  const url = "https://api.openai.com/v1/chat/completions";
  try {
    const data = await sendOpenAIRequest(url, apiKey, model, tools, messages);
    const { choices } = data;
    const toolCallResults = [];
    for (const choice of choices) {
      const { finish_reason } = choice;
      if (finish_reason === "tool_calls") {
        const { function: toolCall, id: callId } = choice.message.tool_calls[0];
        console.log("Tool called:", toolCall);
        const toolOutput = callTool(toolCall.name, toolCall.arguments);
        // todo make callTool return this schema
        const result = {
          role: "user",
          type: "function_call_output",
          call_id: callId,
          content: JSON.stringify({
            toolOutput,
          }),
        };
        toolCallResults.push(result);
      }
      if (finish_reason === "stop") {
        const agentMessage = choice.message.content;
        console.info("\x1b[36m%s\x1b[0m", "[°_°] : ", choice.message.content);
        // go back to user to get next input
        const conversationContext = [
          ...messages.filter((msg) => msg.role === "user"),
          {
            role: "assistant",
            content: agentMessage,
          },
        ];
        return conversationContext;
      }
    }
    if (toolCallResults.length > 0) {
      messages.push(...toolCallResults);
      return await callOpenAI(apiKey, messages, model);
    }
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
  }
}

/**
 * Sends a POST request to the OpenAI API.
 * @param {string} url - The API endpoint URL.
 * @param {string} apiKey - Your OpenAI API key.
 * @param {string} model - The OpenAI model to use.
 * @param {Array} tools - The tools to include in the request.
 * @param {Array} messages - The messages to send in the request.
 * @returns {Promise<Object>} - The response from the OpenAI API.
 */
async function sendOpenAIRequest(url, apiKey, model, tools, messages) {
  try {
    const response = await axios.post(
      url,
      {
        model,
        tools,
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error sending OpenAI request:",
      error.response?.data || error.message
    );
    throw error;
  }
}

module.exports = callOpenAI;
