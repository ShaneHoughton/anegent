import * as dotenv from "dotenv";
dotenv.config();
import readline from "readline";
import CodingAgent from "./agents/codingAgent";

const EXIT_COMMANDS = ["exit", "quit"];

function getUserInput(prompt: string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<string>((resolve) => {
    rl.question(prompt, (answer: string) => {
      rl.close();
      resolve(answer);
    });
  });
}

const main = async () => {
  const agent = new CodingAgent();
  while (true) {
    const task = await getUserInput("\n\x1b[36m--> \x1b[0m");
    const trimmedTask = (task || "").trim();
    if (EXIT_COMMANDS.includes(trimmedTask.toLowerCase())) {
      console.log("Exiting.");
      break;
    }
    await agent.prompt(trimmedTask);
  }
};

main();
