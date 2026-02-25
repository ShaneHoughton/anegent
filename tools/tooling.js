/**
 * Creates a tool definition with its function implementation.
 * @param {string} name - The name of the tool
 * @param {string} description - Description of what the tool does
 * @param {Object} parametersProps - The tool's parameter definitions
 * @param {Function} fn - The function to execute when the tool is called
 * @returns {Object} The complete tool object with definition and function
 */
function createTool(name, description, parametersProps, fn) {
  const requiredKeys = Object.keys(parametersProps);
  const definition = {
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
 * @param {string[]} [enumValues=[]] - Optional array of allowed values
 * @returns {Object} Object mapping parameter name to its definition
 */
function registerParameter(name, type, description, enumValues = []) {
  const parameter = {
    type,
    description,
  };
  if (enumValues.length > 0) {
    parameter.enum = enumValues;
  }
  return { [name]: parameter };
}

/**
 * Creates a toolset with the given tools and provides tool execution.
 * @param {...Object} _tools - Variable number of tool objects to include
 * @returns {Object} Object with tools array and callTool function
 */
function createToolset(..._tools) {
  const functionsMap = _tools.reduce((acc, tool) => {
    acc[tool.definition.function.name] = tool.fn;
    return acc;
  }, {});
  const tools = _tools.map((tool) => tool.definition);
  console.info("\n")
  _tools.forEach((tool) => {
    console.info(
      "Tool registered: ",
      `\x1b[34m${tool.definition.function.name}\x1b[0m`
    );
  });

  /**
   * Executes a tool by name with the given arguments.
   * @param {string} toolName - The name of the tool to execute
   * @param {string} stringArgs - JSON string of arguments to pass to the tool
   * @returns {*} The result from the tool execution
   */
  function callTool(toolName, stringArgs) {
    if (functionsMap[toolName]) {
      return functionsMap[toolName](JSON.parse(stringArgs));
    } else {
      throw new Error(`Tool "${toolName}" not found.`);
    }
  }
  return { tools, callTool };
}

module.exports = { registerParameter, createTool, createToolset };
