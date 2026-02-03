import { IMessage } from "../types";
import { AgentJob, Agent } from "./Agent";
import codingTools from "../tools/coding";
import OpenAIServiceHander from "../api/services/openai/handler";

class CodingAgentJob extends AgentJob {
  handleContext(context: IMessage[]): IMessage[] {
    return context;
  }
}

class CodingAgent extends Agent {
  constructor(systemPrompt: string, tools: any[]) {
    super(systemPrompt, new CodingAgentJob(), tools, OpenAIServiceHander);
  }
}

const systemPrompt = [
  "You are a helpful coding assistant",
  "Always call a tool whenever you can to help the user with coding tasks",
  "Do not call a tool if the user is asking a non-coding related question",
  "Avoid redundant tool calls",
].join(".");

const codingAgent = new CodingAgent(systemPrompt, codingTools);
export default codingAgent;
