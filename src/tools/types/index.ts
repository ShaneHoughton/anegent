export interface Parameter {
  type: string;
  description: string;
  enum?: string[];
}

export interface IToolDefinition {
  type: string;
  function: {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: Record<string, Parameter>;
      required: string[];
    };
  };
}

export interface ITool {
  definition: IToolDefinition;
  fn: (args: any) => any;
}
