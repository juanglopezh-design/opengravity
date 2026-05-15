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

// Tool to read a local file
export const readLocalFileTool: AgentTool = {
  definition: {
    type: 'function',
    function: {
      name: 'read_local_file',
      description: 'Reads the contents of a file on your local PC.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'The absolute path to the file to read.' }
        },
        required: ['path'],
      },
    },
  },
  execute: async (args: { path: string }) => {
    const commandId = await dbAddRemoteCommand('read_file', args);
    return `Petición para leer archivo enviada a tu PC (ID: ${commandId}).`;
  },
};

// Tool to write to a local file
export const writeLocalFileTool: AgentTool = {
  definition: {
    type: 'function',
    function: {
      name: 'write_local_file',
      description: 'Creates a new file or overwrites an existing file on your local PC.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'The absolute path to the file to write.' },
          content: { type: 'string', description: 'The text content to write into the file.' }
        },
        required: ['path', 'content'],
      },
    },
  },
  execute: async (args: { path: string, content: string }) => {
    const commandId = await dbAddRemoteCommand('write_file', args);
    return `Petición para escribir archivo enviada a tu PC (ID: ${commandId}).`;
  },
};

// Tool to list a local directory
export const listLocalDirectoryTool: AgentTool = {
  definition: {
    type: 'function',
    function: {
      name: 'list_local_directory',
      description: 'Lists the contents of a directory on your local PC.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'The absolute path to the directory to list.' }
        },
        required: ['path'],
      },
    },
  },
  execute: async (args: { path: string }) => {
    const commandId = await dbAddRemoteCommand('list_dir', args);
    return `Petición para listar directorio enviada a tu PC (ID: ${commandId}).`;
  },
};

// Update registry
toolsRegistry['execute_local_command'] = executeTerminalCommandTool;
toolsRegistry['open_local_url'] = openUrlTool;
toolsRegistry['read_local_file'] = readLocalFileTool;
toolsRegistry['write_local_file'] = writeLocalFileTool;
toolsRegistry['list_local_directory'] = listLocalDirectoryTool;

export const getAvailableTools = (): LLMTool[] => {
  return Object.values(toolsRegistry).map(t => t.definition);
};
