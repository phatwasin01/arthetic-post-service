import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

const envSchema = z.object({
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .optional(),
  DATABASE_URL: z.string().optional(),
  NODE_ENV: z.string().optional(),
});

export const config = envSchema.parse(process.env);
