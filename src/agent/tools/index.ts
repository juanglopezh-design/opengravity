import { LLMTool } from '../../llm/client.js';
import { dbAddRemoteCommand, dbGetPendingCommands } from '../../memory/database.js';

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

// Tool to execute terminal commands on the local PC
export const executeTerminalCommandTool: AgentTool = {
  definition: {
    type: 'function',
    function: {
      name: 'execute_local_command',
      description: 'Executes a command on your local PC (Windows PowerShell). Use this for opening apps, manages files, checking system status, etc.',
      parameters: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'The exact PowerShell command to run.' },
          description: { type: 'string', description: 'Brief explanation of what this command does.' }
        },
        required: ['command', 'description'],
      },
    },
  },
  execute: async (args: { command: string, description: string }) => {
    const commandId = await dbAddRemoteCommand('execute_terminal', args);
    return `Comando encolado para tu PC (ID: ${commandId}). Esperando ejecución remota...`;
  },
};

// Tool to open URLs on the local PC
export const openUrlTool: AgentTool = {
  definition: {
    type: 'function',
    function: {
      name: 'open_local_url',
      description: 'Opens a website or link in the default browser of your local PC.',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'The absolute URL to open.' }
        },
        required: ['url'],
      },
    },
  },
  execute: async (args: { url: string }) => {
    const commandId = await dbAddRemoteCommand('open_url', args);
    return `URL encolada para abrir en tu PC (ID: ${commandId}).`;
  },
};

// Update registry
toolsRegistry['execute_local_command'] = executeTerminalCommandTool;
toolsRegistry['open_local_url'] = openUrlTool;

export const getAvailableTools = (): LLMTool[] => {
  return Object.values(toolsRegistry).map(t => t.definition);
};
