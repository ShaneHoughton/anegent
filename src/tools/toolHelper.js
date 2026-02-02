"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToolset = exports.registerParameter = exports.createTool = void 0;
function createTool(name, description, parametersProps, fn) {
    var requiredKeys = Object.keys(parametersProps);
    var definition = {
        type: "function",
        function: {
            name: name,
            description: description,
            parameters: {
                type: "object",
                properties: parametersProps,
                required: requiredKeys,
            },
        },
    };
    return {
        fn: fn,
        definition: definition,
    };
}
exports.createTool = createTool;
function registerParameter(name, type, description, enumValues) {
    var _a;
    if (enumValues === void 0) { enumValues = []; }
    var parameter = {
        type: type,
        description: description,
    };
    if (enumValues.length > 0) {
        parameter.enum = enumValues;
    }
    return _a = {}, _a[name] = parameter, _a;
}
exports.registerParameter = registerParameter;
function createToolset() {
    var _tools = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        _tools[_i] = arguments[_i];
    }
    var functionsMap = _tools.reduce(function (acc, tool) {
        acc[tool.definition.function.name] = tool.fn;
        return acc;
    }, {});
    var tools = _tools.map(function (tool) { return tool.definition; });
    console.info("\n");
    _tools.forEach(function (tool) {
        console.info("Tool registered: ", "\u001B[34m".concat(tool.definition.function.name, "\u001B[0m"));
    });
    function callTool(toolName, stringArgs) {
        if (functionsMap[toolName]) {
            return functionsMap[toolName](JSON.parse(stringArgs));
        }
        else {
            throw new Error("Tool \"".concat(toolName, "\" not found."));
        }
    }
    return { tools: tools, callTool: callTool };
}
exports.createToolset = createToolset;
