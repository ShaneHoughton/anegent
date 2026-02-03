export interface Parameter {
  type: string;
  description: string;
  enum?: string[];
}

export interface IToolDefinition {
  type: string;
  function: {
    name: any;
    description: any;
    parameters: {
      type: string;
      properties: any;
      required: string[];
    };
  };
}

export interface ITool {
  definition: IToolDefinition;
  fn: (args: any) => any;
}