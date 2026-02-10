export interface IOpenAIMessage {
  role: string;
  content: string | null;
  tool_calls?: {
    id: string;
    type: string;
    function: {
      name: string;
      arguments: string;
    };
  }[];
}

export interface IOpenAIChatCompletionsResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: IOpenAIMessage;
    logprobs: any | null;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    completion_tokens_details: {
      reasoning_tokens: number;
      accepted_prediction_tokens: number;
      rejected_prediction_tokens: number;
    };
  };
}
