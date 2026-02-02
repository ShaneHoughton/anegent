interface Parameter {
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

function createTool(
  name: string,
  description: string,
  parametersProps: Record<string, Parameter>,
  fn: (args: any) => any
): ITool {
  const requiredKeys = Object.keys(parametersProps);
  const definition: IToolDefinition = {
    type: "function",
    function: {
      name,
      description,
      parameters: {
        type: "object",
        properties: parametersProps,
        required: requiredKeys,
      },
    },
  };
  return {
    fn,
    definition,
  };
}

function registerParameter(
  name: string,
  type: string,
  description: string,
  enumValues: string[] = []
): Record<string, Parameter> {
  const parameter: Parameter = {
    type,
    description,
  };
  if (enumValues.length > 0) {
    parameter.enum = enumValues;
  }
  return { [name]: parameter };
}

function createToolset(..._tools: ITool[]) {
  const functionsMap: Record<string, (args: any) => any> = _tools.reduce(
    (acc, tool) => {
      acc[tool.definition.function.name] = tool.fn;
      return acc;
    },
    {} as Record<string, (args: any) => any>
  );

  const tools = _tools.map((tool) => tool.definition);

  console.info("\n");
  _tools.forEach((tool) => {
    console.info(
      "Tool registered: ",
      `\x1b[34m${tool.definition.function.name}\x1b[0m`
    );
  });

  function callTool(toolName: string, stringArgs: string): any {
    if (functionsMap[toolName]) {
      return functionsMap[toolName](JSON.parse(stringArgs));
    } else {
      throw new Error(`Tool "${toolName}" not found.`);
    }
  }

  return { tools, callTool };
}

export { createTool, registerParameter, createToolset };
