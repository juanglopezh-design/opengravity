import { LLMTool } from '../../llm/client.js';

export interface AgentTool {
  definition: LLMTool;
  execute: (args: any) => Promise<string> | string;
}

// Implement get_current_time tool
export const getCurrentTimeTool: AgentTool = {
  definition: {
    type: 'function',
    function: {
      name: 'get_current_time',
      description: 'Returns the current local date and time. Use this when the user asks for the time or when you need to know the current date for context.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  execute: () => {
    return new Date().toLocaleString('es-ES', { timeZone: 'local' });
  },
};

// Tool Registry
export const toolsRegistry: Record<string, AgentTool> = {
  get_current_time: getCurrentTimeTool,
};

export const getAvailableTools = (): LLMTool[] => {
  return Object.values(toolsRegistry).map(t => t.definition);
};
