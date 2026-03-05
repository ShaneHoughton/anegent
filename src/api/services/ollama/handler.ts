import { AppServiceHandler } from "../../ApiService";
import OllamaService from "./OllamaService";

// Default Ollama configuration
const MODEL = process.env.OLLAMA_MODEL || "llama2";
const API_URL = process.env.OLLAMA_API_URL || "http://localhost:11434/api/chat";
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || ""; // Ollama doesn't require auth by default

const OllamaServiceHandler = new AppServiceHandler(
  new OllamaService(API_URL, MODEL, OLLAMA_API_KEY)
);

export default OllamaServiceHandler;
