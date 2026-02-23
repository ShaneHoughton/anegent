/**
 * Creates a tool definition with its function implementation.
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
