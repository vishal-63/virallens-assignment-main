// src/config/env.ts
import dotenv from 'dotenv';

dotenv.config();

type NodeEnv = 'development' | 'production' | 'test';

function required(name: string, value?: string | undefined): string {
  if (!value) throw new Error(`${name} environment variable is required`);
  return value;
}

export const env = {
  NODE_ENV: (process.env.NODE_ENV ?? 'development') as NodeEnv,
  PORT: Number(process.env.PORT ?? 5000),
  FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  MONGO_URI: required('MONGO_URI', process.env.MONGODB_URI),
  JWT_SECRET: required('JWT_SECRET', process.env.JWT_SECRET),
  // add more env values here and validate as needed
};
