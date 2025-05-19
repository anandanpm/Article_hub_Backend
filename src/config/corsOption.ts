// import { CorsOptions } from 'cors';

// export const corsOptions: CorsOptions = {
//   origin: [process.env.FRONTEND_URL].filter(
//     (origin): origin is string => typeof origin === 'string'
//   ),
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//   credentials: true,
// };


import { CorsOptions } from 'cors';

const allowedOrigin = process.env.FRONTEND_URL;

if (!allowedOrigin) {
  console.warn('⚠️ FRONTEND_URL is not defined in environment variables');
}

export const corsOptions: CorsOptions = {
  origin: allowedOrigin,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};