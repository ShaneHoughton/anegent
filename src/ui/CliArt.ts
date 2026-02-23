/**
 * Logs colored text to the console.
 */
const colorLog = (artStr: string, color = "cyan") => {
  const colorMap: { [key: string]: number } = {
    red: 31,
    green: 32,
    yellow: 33,
    blue: 34,
    magenta: 35,
    cyan: 36,
    white: 37,
  };
  const selectedColor = colorMap[color] || colorMap["cyan"];
  console.info("\n");
  console.log(`\x1b[${selectedColor}m${artStr}\x1b[0m`);
};

export interface AIResponseConfig {
  type: "respond" | "thinking" | "action" | "error";
  text?: string;
  shouldAnimate?: boolean;
}

/**
 * Displays AI responses with visual formatting and animations.
 */
export function logAIResponse(config: AIResponseConfig) {
  let intervalId: NodeJS.Timeout | null = null;
  const cleanupInterval = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
  colorLog(`~`.repeat(50));
  if (config.text) colorLog(config.text);
  switch (config.type) {
    case "respond":
      colorLog("[°_°]∫ ", "yellow");
      break;
    case "thinking":
      colorLog("/[-_-]\\\n", "yellow");
      process.stdout.write("\x1b[36mhm\x1b[0m");
      intervalId = setInterval(() => {
        process.stdout.write("\x1b[36mm\x1b[0m");
      }, 1000);
      break;
    case "action":
      colorLog("[°o°]/", "yellow");
      break;
    case "error":
      colorLog("\\[°x°]/", "yellow");
      break;
    default:
      break;
  }
  return { cleanupInterval };
}
