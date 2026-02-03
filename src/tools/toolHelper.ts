import { ITool, IToolDefinition, Parameter } from "./types";

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

  async function callTool(toolName: string, args: any): Promise<any> {
    if (functionsMap[toolName]) {
      return await functionsMap[toolName](args);
    } else {
      throw new Error(`Tool "${toolName}" not found.`);
    }
  }

  return { tools, callTool };
}

export { createTool, registerParameter, createToolset };

// class ToolSet {
//   tools: ITool[];
//   functionsMap: Record<string, (args: any) => any> = {};

//   constructor(tools: ITool[]) {
//     this.tools = tools;
//   }

//   addTool(tool: ITool) {
//     this.tools.push(tool);
//     this.functionsMap[tool.definition.function.name] = tool.fn;
//   }

//   private createTool(
//     name: string,
//     description: string,
//     parametersProps: Record<string, Parameter>,
//     fn: (args: any) => any
//   ): ITool {
//     const requiredKeys = Object.keys(parametersProps);
//     const definition: IToolDefinition = {
//       type: "function",
//       function: {
//         name,
//         description,
//         parameters: {
//           type: "object",
//           properties: parametersProps,
//           required: requiredKeys,
//         },
//       },
//     };
//     return {
//       fn,
//       definition,
//     };
//   }
// }
