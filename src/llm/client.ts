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
  fallbackToGroq: boolean = true
) => {
  try {
    if (!openrouterClient) {
      throw new Error('OpenRouter API key missing');
    }
    const response = await openrouterClient.chat.completions.create({
      model: config.OPENROUTER_MODEL,
      messages,
      tools: tools?.length ? tools : undefined,
      tool_choice: tools?.length ? 'auto' : undefined,
      temperature: 0.2, // Low temperature for more deterministic agentic behavior
    });
    return response.choices[0];
  } catch (error) {
    console.error('OpenRouter API Error:', error);
    if (fallbackToGroq) {
      console.log('Falling back to Groq...', 'llama-3.3-70b-versatile');
      const groqResponse = await groqClient.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        tools: tools?.length ? tools : undefined,
        tool_choice: tools?.length ? 'auto' : undefined,
        temperature: 0.2,
      });
      return groqResponse.choices[0];
    }
    throw error;
  }
};
