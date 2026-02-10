import { IAppMessage } from "../types";
import { AgentJob, Agent } from "./Agent";
import codingTools from "../tools/coding";
import OpenAIServiceHander from "../api/services/openai/handler";
// import ValidationAgent from "./ValidationAgent";

class CodingAgentJob extends AgentJob {
  handleContext(context: IAppMessage[]): IAppMessage[] {
    return [...context];
  }

  async onRespond(response: string): Promise<IAppMessage[]> {
    const messages: IAppMessage[] = [];
    messages.push({ role: "assistant", content: response });
    return messages;
  }
}

class CodingAgent extends Agent {
  constructor() {
    const systemPrompt = [
      "You are a helpful coding assistant",
      "Always call a tool whenever you can to help the user with coding tasks",
      "Do not call a tool if the user is asking a non-coding related question",
      "Avoid redundant tool calls",
    ].join(".");

    super(systemPrompt, new CodingAgentJob(), OpenAIServiceHander, codingTools);
  }
}

export default CodingAgent;
