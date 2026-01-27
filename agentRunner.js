require("dotenv").config();
const readline = require("readline");
const callOpenAI = require("./agent");

function getUserInput(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Function to format the prompt
function formatPrompt(task) {
  return `Help with the following task:\n\n${task}`;
}

// Main function to run the agent
async function runAgent() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("Error: OpenAI API key is not set.");
      return;
    }

    const initMessages = [
      {
        role: "system",
        content: "You are a helpful coding assistant.",
      },
    ];
    let conversationContext = null;
    while (true) {
      const messages = [...initMessages];
      if (conversationContext) {
        messages.push(...conversationContext);
      }
      const task = await getUserInput("\x1b[36m--> \x1b[0m");
      const prompt = formatPrompt(task);
      messages.push({
        role: "user",
        content: prompt,
      });
      conversationContext = await callOpenAI(apiKey, messages);
    }
  } catch (error) {
    console.error("An error occurred:", error.message);
  }
}

// Run the agent
runAgent();
