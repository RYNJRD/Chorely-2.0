type EnvConfig = {
  DATABASE_URL: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL?: string;
  FIREBASE_PRIVATE_KEY?: string;
  RESEND_API_KEY?: string;
  NODE_ENV: string;
  PORT: number;
};

let cachedEnv: EnvConfig | null = null;

function readString(name: string, required = false): string | undefined {
  const value = process.env[name]?.trim();
  if (!value && required) {
    throw new Error(`[Env] Missing required environment variable ${name}`);
  }
  return value;
}

export function getEnv(): EnvConfig {
  if (cachedEnv) return cachedEnv;

  const isProd = process.env.NODE_ENV === "production" || !!process.env.VERCEL;

  const env: EnvConfig = {
    DATABASE_URL: readString("DATABASE_URL", isProd) || "",
    FIREBASE_PROJECT_ID: readString("FIREBASE_PROJECT_ID", isProd) || "",
    FIREBASE_CLIENT_EMAIL: readString("FIREBASE_CLIENT_EMAIL"),
    FIREBASE_PRIVATE_KEY: readString("FIREBASE_PRIVATE_KEY"),
    RESEND_API_KEY: readString("RESEND_API_KEY", isProd),
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: Number(process.env.PORT || "5000"),
  };

  if (isProd && env.FIREBASE_CLIENT_EMAIL && !env.FIREBASE_PRIVATE_KEY) {
    throw new Error("[Env] Incomplete Firebase credentials: FIREBASE_CLIENT_EMAIL is set but FIREBASE_PRIVATE_KEY is missing.");
  }

  cachedEnv = env;
  return env;
}

