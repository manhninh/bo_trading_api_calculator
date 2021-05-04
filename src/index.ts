import http from 'http';
import 'module-alias/register';
import mongoose from 'mongoose';
import {Server} from 'socket.io';
import IOClient from 'socket.io-client';
import app from './App';
import CandlestickSocket from './candlestick';
import config from './config';
import IOHandlers from './socketHandlers/EventHandlers';

app.set('port', config.port);

const server = http.createServer(app);

server.listen(config.port);

server.on('listening', () => {
  if (process.env.NODE_ENV !== 'production') mongoose.set('debug', true);
  mongoose.connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
  mongoose.connection.once('open', () => {
    console.info('\n🚀Connected to Mongo via Mongoose');
    console.info(
      `\n🚀Server listening on port: ${config.port} - env: ${process.env.NODE_ENV}
      \n🚀API Document on http://localhost:${config.port}/apidoc/index.html\n`,
    );

    /** tạo socket server của hệ thống */
    const io: Server = new Server(server, {cors: {origin: '*'}});
    IOHandlers(io);

    /** kết nối socket nến để lấy dữ liệu cần thiết */
    const socket = IOClient(config.WS_CANDLESTICK, {query: {token: config.WS_TOKEN_CALCULATOR}});
    CandlestickSocket(socket);
  });
  mongoose.connection.on('error', (err) => {
    console.error('\n🚀Unable to connect to Mongo via Mongoose', err);
  });
});

server.on('error', (error: NodeJS.ErrnoException): void => {
  if (error.syscall !== 'listen') throw error;
  const bind = typeof config.port === 'string' ? 'Pipe ' + config.port : 'Port ' + config.port;
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
    default:
      throw error;
  }
});
