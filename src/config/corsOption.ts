import { CorsOptions } from 'cors';

export const corsOptions: CorsOptions = {
  origin: [process.env.FRONTEND_URL].filter(
    (origin): origin is string => typeof origin === 'string'
  ),
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
};
