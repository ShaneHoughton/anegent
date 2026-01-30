const axios = require("axios");
const { createToolset } = require("./tools/tooling");
const codingTools = require("./tools/coding");
const { tools, callTool } = createToolset(...codingTools);

const colorLog = (artStr, color = "cyan") => {
  const colorMap = {
    red: 31,
    green: 32,
    yellow: 33,
    blue: 34,
    magenta: 35,
    cyan: 36,
    white: 37,
  };
  const selectedColor = colorMap[color] || colorMap["cyan"];
  console.info("\n");
  console.log(`\x1b[${selectedColor}m${artStr}\x1b[0m`);
};

function logAIResponse(config) {
  if (!config) return;

  colorLog(`~`.repeat(50));
  if (config.text) colorLog(config.text);
  switch (config.type) {
    case "respond":
      colorLog("[°_°]∫ ", "yellow");
      break;
    case "thinking":
      colorLog("/[-_-]\\\n", "yellow");
      process.stdout.write("\x1b[36mhm\x1b[0m");
      let intervalId = setInterval(() => {
        if (!config.shouldAnimate) {
          clearInterval(intervalId);
          return;
        }
        process.stdout.write("\x1b[36mm\x1b[0m");
      }, 1000);
      break;
    case "action":
      colorLog("[°o°]/", "yellow");
      break;
    case "error":
      colorLog("\\[°x°]/", "yellow");
      break;
    default:
      break;
  }
}

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
        const { message } = choice;
        const { function: toolCall, id: callId } = message.tool_calls[0];
        const toolOutput = await callTool(toolCall.name, toolCall.arguments);
        logAIResponse({
          text: `I called ${toolCall.name}!`,
          type: "action",
        });
        const functionMessage = {
          role: "tool",
          tool_call_id: callId,
          content: JSON.stringify({ output: toolOutput }),
        };
        toolCallResults.push(message);
        toolCallResults.push(functionMessage);
      }
      if (finish_reason === "stop") {
        const agentMessage = choice.message.content;
        logAIResponse({ text: agentMessage, type: "respond" });
        // removing tool messages before reprompting user to reduce context bloat and token use
        // messages become user ask and agent reply
        const conversationContext = [
          ...messages.filter((msg) => msg.role === "user"),
          { role: "assistant", content: agentMessage },
        ];
        return conversationContext;
      }
    }
    if (toolCallResults.length > 0) {
      messages.push(...toolCallResults);
      return await callOpenAI(apiKey, messages, model);
    }
    return null;
  } catch (error) {
    logAIResponse({ text: error, type: "error" });
    return null;
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
  const timeout = process.env.OPENAI_TIMEOUT
    ? parseInt(process.env.OPENAI_TIMEOUT)
    : 1500000;
  try {
    const animateThink = {
      text: "Let's see...",
      type: "thinking",
      shouldAnimate: true,
    };
    logAIResponse(animateThink);
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
        timeout,
      }
    );
    animateThink.shouldAnimate = false;
    return response.data;
  } catch (error) {
    throw error;
  }
}

module.exports = callOpenAI;
