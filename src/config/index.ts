import {config} from 'dotenv';

const envFound = config({path: `./.env.${process.env.NODE_ENV || 'development'}`});
if (!envFound) throw new Error("Couldn't find .env file");
console.log(process.env.PORT, 'process.env.PORT');
export default {
  NODE_ENV: process.env.NODE_ENV,

  port: process.env.PORT || 5001,

  logs: {level: process.env.LOG_LEVEL || 'silly'},

  MONGODB_URI: process.env.MONGODB_URI,

  WS_CANDLESTICK: process.env.WS_CANDLESTICK,
};
