const { createTool, registerParameter } = require("./tooling");

const weatherTool = createTool(
  "get_current_weather",
  "Get the current weather in a given location",
  {
    ...registerParameter(
      "location",
      "string",
      "The city and state, e.g. San Francisco, CA"
    ),

    ...registerParameter("unit", "string", "The unit of temperature", [
      "celsius",
      "fahrenheit",
    ]),
  },
  ({ location, unit }) => {
    return `The weather in ${location} is 76 degrees and sunny in ${unit} units.`;
  }
);

module.exports = weatherTool;
