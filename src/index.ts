import * as dotenv from "dotenv";
dotenv.config();
import CodingAgent from "./agents/codingAgent";
import { Cli } from "./chat/interfaces/Cli";

const EXIT_COMMANDS = ["exit", "quit", "x", "f"];

/**
 * Main application loop for the coding agent.
 * @returns {Promise<void>}
 */
const main = async (): Promise<void> => {
  const cli = new Cli();
  const agent = new CodingAgent(cli);
  while (true) {
    const userRequest = await cli.sendMessage();
    if (EXIT_COMMANDS.includes(userRequest.toLowerCase().trim())) {
      console.log("Exiting.");
      break;
    }
    await agent.prompt(userRequest);
  }
};

main();
