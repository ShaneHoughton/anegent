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

function createToolset(..._tools) {
  const functionsMap = _tools.reduce((acc, tool) => {
    acc[tool.definition.function.name] = tool.fn;
    return acc;
  }, {});
  const tools = _tools.map((tool) => tool.definition);

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
