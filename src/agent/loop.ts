import { chatCompletion, LLMMessage } from '../llm/client.js';
import { dbGetMessages, dbAddMessage } from '../memory/database.js';
import { toolsRegistry, getAvailableTools } from './tools/index.js';

const SYSTEM_PROMPT = `Eres OpenGravity, un asistente de IA personal potente y seguro, creado para ejecutarse localmente y ser controlado únicamente a través de Telegram. Eres conciso, amable, y sigues cuidadosamente las instrucciones. Utilizas tus herramientas cuando es necesario. Tu memoria es persistente y recuerdas las interacciones anteriores.`;
const MAX_ITERATIONS = 5;

export const runAgentLoop = async (userId: number, userMessage: string): Promise<string> => {
  // 1. Save user message to DB
  await dbAddMessage({
    user_id: userId,
    role: 'user',
    content: userMessage,
  });

  // 2. Retrieve history for context
  const previousMessages = await dbGetMessages(userId, 20);
  
  // 3. Construct the message payload
  const messages: LLMMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    // Map DB messages to LLM format
  ];

  for (const msg of previousMessages) {
    if (msg.role === 'tool') {
      messages.push({
        role: 'tool',
        content: msg.content,
        tool_call_id: msg.tool_call_id as string
      });
    } else if (msg.role === 'assistant') {
      // Need to handle assistant messages carefully (can involve tool calls)
      if (msg.tool_calls) {
        messages.push({
          role: 'assistant',
          content: msg.content || '',
          tool_calls: JSON.parse(msg.tool_calls)
        });
      } else {
        messages.push({
          role: 'assistant',
          content: msg.content || ''
        });
      }
    } else {
      messages.push({
        role: msg.role as 'system' | 'user',
        content: msg.content
      });
    }
  }

  // 4. Start the Agent Loop
  let iteration = 0;
  const availableTools = getAvailableTools();

  while (iteration < MAX_ITERATIONS) {
    iteration++;

    // Call LLM
    const responseMessage = await chatCompletion(messages, availableTools);
    
    // Check if the model wants to call a tool
    if (responseMessage.message.tool_calls && responseMessage.message.tool_calls.length > 0) {
      const toolCalls = responseMessage.message.tool_calls;
      
      // Save assistant's tool calls intent to memory
      await dbAddMessage({
        user_id: userId,
        role: 'assistant',
        content: responseMessage.message.content || '',
        tool_calls: JSON.stringify(toolCalls)
      });
      
      messages.push(responseMessage.message);

      // Execute all tool calls
      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const tool = toolsRegistry[functionName];

        let resultStr = "";
        try {
          if (tool) {
            const args = JSON.parse(toolCall.function.arguments);
            resultStr = await tool.execute(args);
          } else {
            resultStr = `Error: Tool ${functionName} not found.`;
          }
        } catch (error: any) {
          resultStr = `Error executing tool: ${error.message}`;
        }

        // Save tool response to DB
        await dbAddMessage({
          user_id: userId,
          role: 'tool',
          content: resultStr,
          tool_call_id: toolCall.id
        });

        messages.push({
          role: 'tool',
          content: resultStr,
          tool_call_id: toolCall.id
        });
      }
      
      // Loop continues, sending tool results back to the model
      continue;
    }

    // No tool calls = final response
    const finalContent = responseMessage.message.content || 'Sin respuesta.';
    
    // Save final assistant response to DB
    await dbAddMessage({
      user_id: userId,
      role: 'assistant',
      content: finalContent
    });

    return finalContent;
  }

  // If we exceed MAX_ITERATIONS
  const limitMsg = 'Límite de iteraciones alcanzado al pensar.';
  await dbAddMessage({
    user_id: userId,
    role: 'assistant',
    content: limitMsg
  });
  return limitMsg;
};
