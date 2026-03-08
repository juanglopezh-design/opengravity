import { Bot } from 'grammy';
import { config } from './src/config.js';

const bot = new Bot(config.TELEGRAM_BOT_TOKEN);
bot.api.getMe().then(me => {
  console.log('✅ Bot is valid:', me.username);
  process.exit(0);
}).catch(err => {
  console.error('❌ Bot is invalid:', err);
  process.exit(1);
});
