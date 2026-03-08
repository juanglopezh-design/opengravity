import { chatCompletion } from './src/llm/client.js';

async function test() {
  try {
    const res = await chatCompletion([{ role: 'user', content: 'hola' }], []);
    console.log('✅ LLM Response:', res.message.content);
  } catch (err) {
    console.error('❌ LLM Error:', err);
  }
}

test();
