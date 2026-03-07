import { Bot } from 'grammy';
import { config, isUserAllowed } from '../config.js';
import { dbAddUser } from '../memory/database.js';
import { runAgentLoop } from '../agent/loop.js';

const bot = new Bot(config.TELEGRAM_BOT_TOKEN);

// Middleware for whitelisting users
bot.use(async (ctx, next) => {
  if (ctx.from?.id && isUserAllowed(ctx.from.id)) {
    // Save user info to DB just in case it's their first time
    await dbAddUser(
      ctx.from.id,
      ctx.from.username,
      ctx.from.first_name,
      ctx.from.last_name
    );
    await next();
  } else {
    // Silently ignore unauthorized users or send an unauthorized message
    console.warn(`Unauthorized access attempt from user ID: ${ctx.from?.id}`);
  }
});

bot.command('start', async (ctx) => {
  await ctx.reply('¡Hola! Soy OpenGravity, tu agente personal en la nube. ¿En qué te puedo ayudar?');
});

bot.on('message:text', async (ctx) => {
  const userId = ctx.from.id;
  const userMessage = ctx.message.text;

  // Let Telegram know we are "typing"
  await ctx.replyWithChatAction('typing');

  try {
    const response = await runAgentLoop(userId, userMessage);
    await ctx.reply(response);
  } catch (error: any) {
    console.error('Error handling message:', error);
    await ctx.reply('Ha ocurrido un error al procesar tu solicitud.');
  }
});

// Error handling
bot.catch((err) => {
  console.error('Grammy Error:', err);
});

export const startBot = () => {
  bot.start({
    onStart: (botInfo) => {
      console.log(`✅ Bot started safely! Logged in as: ${botInfo.username}`);
    }
  });
};
