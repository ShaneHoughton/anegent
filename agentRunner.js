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
        content: [
          "You are a helpful coding assistant",
          "Always call a tool whenever you can to help the user with coding tasks",
          "Do not call a tool if the user is asking a non-coding related question",
          "Avoid redundant tool calls",
        ].join("."),
      },
    ];

    const MAX_TURNS = process.env.MAX_TURNS
      ? parseInt(process.env.MAX_TURNS)
      : 20;
    const EXIT_COMMANDS = ["exit", "quit"];

    let conversationContext = null; // previous turns: user messages + assistant response
    let turns = 0;

    while (true) {
      if (turns++ >= MAX_TURNS) {
        console.log("Reached maximum turns. Exiting.");
        break;
      }

      const messages = [...initMessages];
      if (conversationContext && conversationContext.length) {
        messages.push(...conversationContext);
      }

      const task = await getUserInput("\n\x1b[36m--> \x1b[0m");
      const trimmedTask = (task || "").trim();
      if (EXIT_COMMANDS.includes(trimmedTask.toLowerCase())) {
        console.log("Exiting.");
        break;
      }

      const prompt = formatPrompt(task);
      messages.push({
        role: "user",
        content: prompt,
      });

      const nextContext = await callOpenAI(apiKey, messages);
      if (!nextContext) {
        console.error("No response from assistant. Exiting.");
        break;
      }
      conversationContext = nextContext;
    }
  } catch (error) {
    console.error("An error occurred:", error?.message);
  }
}

// Run the agent
runAgent();
