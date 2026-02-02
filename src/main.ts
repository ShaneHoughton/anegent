import OpenAIServiceHander from "./api/services/openai/handler";
import { IAppRequest } from "./api/ApiService";

const main = async () => {
  // do something
  const request: IAppRequest = {
    messages: [
      {
        role: "system",
        content: [
          "You are a helpful coding assistant",
          "Always call a tool whenever you can to help the user with coding tasks",
          "Do not call a tool if the user is asking a non-coding related question",
          "Avoid redundant tool calls",
        ].join("."),
      },
      {
        role: "user",
        content: "How do I init an npm project?",
      },
    ],
    tools: [],
  };
  const response = await OpenAIServiceHander.handleService(request);
};

main();
