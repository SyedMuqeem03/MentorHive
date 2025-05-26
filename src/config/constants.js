export const AI_CONFIG = {
  API_KEY: import.meta.env.VITE_GROQ_API_KEY || null,
  MODEL: "llama3-8b-8192",
  TEMPERATURE: 0.7,
  MAX_TOKENS: 1024
};