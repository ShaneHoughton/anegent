import { AppServiceHandler } from "../../ApiService";
import OpenAIService from "./OpenAiService";

const MODEL = "gpt-5-nano-2025-08-07";
const API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

const OpenAIServiceHander = new AppServiceHandler(
  new OpenAIService(API_URL, MODEL, OPENAI_API_KEY)
);

export default OpenAIServiceHander;