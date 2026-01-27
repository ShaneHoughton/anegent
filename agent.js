const axios = require("axios");
const { createToolset } = require("./tools/tooling");
const codingTools = require("./tools/coding");
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
        const truncatedArgs =
          JSON.stringify(toolCall.arguments).slice(0, 100) +
          (JSON.stringify(toolCall.arguments).length > 100 ? "..." : "");
        console.info("\n");
        console.info("\x1b[36m~\x1b[0m".repeat(100));
        console.info("\n");
        const toolOutput = callTool(toolCall.name, toolCall.arguments);
        console.info(
          "\n\n\x1b[36m%s\x1b[0m",
          `Calling ${toolCall.name} with arguments ${truncatedArgs}`
        );
        console.info(
          "\n\x1b[36m%s\x1b[0m",
          "~~~   ",
          "\x1b[36m~\x1b[0m".repeat(95)
        );
        console.info("\n\x1b[36m%s\x1b[0m", "   |/");
        console.info("\n\x1b[36m%s\x1b[0m", "[°o°]\n");
        // todo make callTool return this schema
        const result = {
          role: "user", // avoids assistant role which may trigger infinite tool calls
          type: "function_call_output",
          call_id: callId,
          content: `Tool call result: ${JSON.stringify({
            toolOutput,
          })}`,
        };
        toolCallResults.push(result);
      }
      if (finish_reason === "stop") {
        const agentMessage = choice.message.content;
        console.info("\n\n");
        console.info("\x1b[36m~\x1b[0m".repeat(100));
        console.info("\n\n\x1b[36m%s\x1b[0m", agentMessage);
        console.info(
          "\n\x1b[36m%s\x1b[0m",
          "~~~   ",
          "\x1b[36m~\x1b[0m".repeat(95)
        );
        console.info("\n\x1b[36m%s\x1b[0m", "   |/");
        console.info("\n\x1b[36m%s\x1b[0m", "[°_°]\n");
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
    // console.info("\n\x1b[36m%s\x1b[0m", "[^_^] ? ");
    process.stdout.write("\n\x1b[36m[^_°] hmm\x1b[0m");
    let animateThink = true;
    const intervalId = setInterval(() => {
      if (!animateThink) {
        clearInterval(intervalId);
        return;
      }
      process.stdout.write("\x1b[36mm\x1b[0m");
    }, 1000);
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
    animateThink = false;
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
