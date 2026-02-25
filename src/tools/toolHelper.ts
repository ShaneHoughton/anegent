import { ITool, IToolDefinition, Parameter } from "./types";

/**
 * Creates a tool definition with its function implementation.
 * @param {string} name - The name of the tool
 * @param {string} description - Description of what the tool does
 * @param {Record<string, Parameter>} parametersProps - The tool's parameter definitions
 * @param {function} fn - The function to execute when the tool is called
 * @returns {ITool} The complete tool object with definition and function
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
 * @param {string} name - The parameter name
 * @param {string} type - The parameter type (e.g., "string", "number")
 * @param {string} description - Description of the parameter
 * @param {string[]} [enumValues] - Optional array of allowed values
 * @returns {Record<string, Parameter>} Object mapping parameter name to its definition
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
   * @param {ITool[]} tools - Array of tools to include in the toolset
   */
  constructor(tools: ITool[]) {
    tools.forEach((tool) => this.addTool(tool));
  }

  /**
   * Adds a tool to the toolset.
   * @param {ITool} tool - The tool to add
   */
  addTool(tool: ITool) {
    this.tools.push(tool);
    this.functionsMap[tool.definition.function.name] = tool.fn;
    this.cachedToolDefinitions = null;
  }

  /**
   * Executes a tool by name with the given arguments.
   * @param {string} toolName - The name of the tool to execute
   * @param {any} args - Arguments to pass to the tool
   * @returns {any} The result from the tool execution
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
   * @returns {IToolDefinition[]} Array of tool definitions
   */
  get toolDefinitions(): IToolDefinition[] {
    if (!this.cachedToolDefinitions) {
      this.cachedToolDefinitions = this.tools.map((tool) => tool.definition);
    }
    return this.cachedToolDefinitions;
  }
}
