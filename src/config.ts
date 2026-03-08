import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

// Load variables from .env if present
loadDotenv();

const idsTransform = (val: string) => val.split(',').map((id) => parseInt(id.trim(), 10)).filter((id) => !isNaN(id));

const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1, 'TELEGRAM_BOT_TOKEN is required'),
  TELEGRAM_ALLOWED_USER_IDS: z.string().transform(idsTransform),
  GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY is required'),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().default('openrouter/free'),
  DB_PATH: z.string().default('./memory.db'),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  FIREBASE_SERVICE_ACCOUNT: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;

export const isUserAllowed = (userId: number): boolean => {
  return config.TELEGRAM_ALLOWED_USER_IDS.includes(userId);
};
