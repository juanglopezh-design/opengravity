import OpenAI from 'openai';
import { config } from '../config.js';

// Groq connection configuration
const groqClient = new OpenAI({
  apiKey: config.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// OpenRouter connection configuration (optional fallback)
const openrouterClient = config.OPENROUTER_API_KEY ? new OpenAI({
  apiKey: config.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://github.com/juang/opengravity',
    'X-Title': 'OpenGravity Agent',
  }
}) : null;

export type LLMMessage = OpenAI.Chat.ChatCompletionMessageParam;
export type LLMTool = OpenAI.Chat.ChatCompletionTool;

export const chatCompletion = async (
  messages: LLMMessage[],
  tools?: LLMTool[],
  fallbackToOpenRouter: boolean = true
) => {
  try {
    const response = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      tools: tools?.length ? tools : undefined,
      tool_choice: tools?.length ? 'auto' : undefined,
      temperature: 0.2, // Low temperature for more deterministic agentic behavior
    });
    return response.choices[0];
  } catch (error) {
    console.error('Groq API Error:', error);
    if (fallbackToOpenRouter && openrouterClient) {
      console.log('Falling back to OpenRouter...', config.OPENROUTER_MODEL);
      const openRouterResponse = await openrouterClient.chat.completions.create({
        model: config.OPENROUTER_MODEL,
        messages,
        tools: tools?.length ? tools : undefined,
        tool_choice: tools?.length ? 'auto' : undefined,
        temperature: 0.2,
      });
      return openRouterResponse.choices[0];
    }
    throw error;
  }
};
