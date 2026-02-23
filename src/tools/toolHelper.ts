import { ITool, IToolDefinition, Parameter } from "./types";

/**
 * Creates a tool definition with its function implementation.
 */
export function createTool(
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

/**
 * Registers a parameter with its type and description.
 */
export function registerParameter(
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

/**
 * Manages a collection of tools and their execution.
 */
export class ToolSet {
  tools: ITool[] = [];
  functionsMap: Record<string, (args: any) => any> = {};
  private cachedToolDefinitions: IToolDefinition[] | null = null;

  /**
   * Creates a new toolset with the given tools.
   */
  constructor(tools: ITool[]) {
    tools.forEach((tool) => this.addTool(tool));
  }

  /**
   * Adds a tool to the toolset.
   */
  addTool(tool: ITool) {
    this.tools.push(tool);
    this.functionsMap[tool.definition.function.name] = tool.fn;
    this.cachedToolDefinitions = null;
  }

  /**
   * Executes a tool by name with the given arguments.
   */
  callTool(toolName: string, args: any): any {
    if (this.functionsMap[toolName]) {
      return this.functionsMap[toolName](args);
    } else {
      throw new Error(`Tool "${toolName}" not found.`);
    }
  }

  /**
   * Returns all tool definitions in the toolset.
   */
  get toolDefinitions(): IToolDefinition[] {
    if (!this.cachedToolDefinitions) {
      this.cachedToolDefinitions = this.tools.map((tool) => tool.definition);
    }
    return this.cachedToolDefinitions;
  }
}
