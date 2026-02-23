// import { IMessage } from "../types";
// import { AgentJob, Agent } from "./Agent";
// import codingTools from "../tools/coding";
// import OpenAIServiceHander from "../api/services/openai/handler";
// import CodingAgent from "./codingAgent";

// class ValidationAgentJob extends AgentJob {
//   handleContext(context: IMessage[]): IMessage[] {
//     return [...context];
//   }

//   async onRespond(response: string) {
//     const steps = response
//       .split("\n")
//       .map((step) => step.trim())
//       .filter((step) => step.length > 0);

//     for (const step of steps) {
//       const agent = new CodingAgent();
//       const responseMessages = await agent.Act(step);
//     }
//     return [];
//   }
// }

// class ValidationAgent extends Agent {
//   constructor() {
//     const systemPrompt = [
//       "You are a helpful validation assistant that specializes in planning",
//       "Given a requirement and a result determine whether the result meets the requirement",
//       "If it does not meet the requirement, break down what is missing into clear steps and state which tools to use for each step",
//       "If the result meets the requirement, respond with 'The result meets the requirement.'",
//     ].join(".");

//     super(
//       systemPrompt,
//       new ValidationAgentJob(),
//       OpenAIServiceHander,
//       codingTools
//     );
//   }
// }

// export default ValidationAgent;
