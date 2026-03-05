import { AppServiceHandler } from "../../ApiService";
import ClaudeService from "./ClaudeService";

const MODEL = "claude-3-5-sonnet-20241022";
const API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

if (!CLAUDE_API_KEY) {
  throw new Error(
    "Missing CLAUDE_API_KEY environment variable. Please set it before starting the application.",
  );
}

const ClaudeServiceHandler = new AppServiceHandler(
  new ClaudeService(API_URL, MODEL, CLAUDE_API_KEY)
);

export default ClaudeServiceHandler;
