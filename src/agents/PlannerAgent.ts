// import { IAppMessage } from "../types";
// import { AgentJob, Agent } from "./Agent";
// import codingTools from "../tools/coding";
// import OpenAIServiceHander from "../api/services/openai/handler";
// import CodingAgent from "./codingAgent";
// import { IAppAction } from "../api/types";

// class PlannerAgentJob extends AgentJob {
//   greet() {
//     return "Hello! I'm your coding assistant. How can I help you today?";
//   }

//   handleContext(context: IAppMessage[]): IAppMessage[] {
//     return [...context];
//   }

//   async onRespond(response: string) {
//     const messages: IAppMessage[] = [];
//     // const steps = response
//     //   .split("\n")
//     //   .map((step) => step.trim())
//     //   .filter((step) => step.length > 0);

//     // for (const step of steps) {
//     //   const agent = new CodingAgent();
//     //   const codingAgentMessages = await agent.prompt(step);
//     //   messages.push(...codingAgentMessages);
//     // }

//     return messages;
//   }
  
//   onToolCall(response: IAppAction): Promise<IAppAction> | IAppAction {
//     return response;
//   }
// }

// class PlannerAgent extends Agent {
//   constructor() {
//     const systemPrompt = [
//       "You are a helpful coding assistant that specializes in planning in as few steps as possible",
//       "If necessary, break down the user's coding requests into short, clear steps and state which tools to use for each step",
//       "Each step should be separated by a newline",
//       `The tools available are ${codingTools.tools
//         .map((t) => t.definition.function.name)
//         .join(", ")}`,
//     ].join(".");

//     super(systemPrompt, new PlannerAgentJob(), OpenAIServiceHander);
//     this.logMessage({ type: "respond", text: this.job.greet() });
//   }
// }

// export default PlannerAgent;
