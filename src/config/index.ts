import {config} from 'dotenv';

const envFound = config({path: `./.env.${process.env.NODE_ENV || 'development'}`});
if (!envFound) throw new Error("Couldn't find .env file");

export default {
  NODE_ENV: process.env.NODE_ENV,

  port: process.env.PORT || 5001,

  logs: {level: process.env.LOG_LEVEL || 'silly'},

  MONGODB_URI: process.env.MONGODB_URI,

  WS_CANDLESTICK: process.env.WS_CANDLESTICK,

  // REDIS CONFIG
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_AUTH: process.env.REDIS_AUTH,

  SYSTEM_PROTECT_LEVEL_1: process.env.SYSTEM_PROTECT_LEVEL_1,
  SYSTEM_PROTECT_LEVEL_2: process.env.SYSTEM_PROTECT_LEVEL_2,
  SYSTEM_PROTECT_LEVEL_3: process.env.SYSTEM_PROTECT_LEVEL_3,
  SYSTEM_PROTECT_LEVEL_4: process.env.SYSTEM_PROTECT_LEVEL_4,

  WS_TOKEN_CALCULATOR: process.env.WS_TOKEN_CALCULATOR,
  WS_TOKEN_API: process.env.WS_TOKEN_API,
};
