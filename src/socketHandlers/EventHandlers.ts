import AccessTokenRepository from '@src/repository/AccessTokenRepository';
import UserRepository from '@src/repository/UserRepository';
import {logger} from 'bo-trading-common/lib/utils';
import {Server, Socket} from 'socket.io';
import {ExtendedError} from 'socket.io/dist/namespace';
import TradingSystemEvents from './events/TradingWeb';
import TradingSystemRooms from './rooms/TradingWeb';

export default (io: Server) => {
  try {
    global.io = io;
    io.use(async (socket: Socket, next: (err?: ExtendedError) => void) => {
      try {
        logger.info('Socket connect token');
        const token = socket.handshake.query['token'].toString();
        if (token) {
          console.log('token');
          const accessTokenRes = new AccessTokenRepository();
          const accessToken = await accessTokenRes.findByToken(token);
          const userRepository = new UserRepository();
          const user = await userRepository.findById(accessToken.user_id);
          if (user) {
            socket['user_id'] = user.id;
            next();
          } else next(new Error('Socket not authorized'));
        } else next(new Error('Socket not authorized'));
      } catch (error) {
        next(new Error('Socket not authorized'));
      }
    });

    io.on('connection', (socket: Socket) => {
      logger.info('Socket Connection Success');
      const roomHandlers = [TradingSystemRooms(socket)];
      roomHandlers.forEach((handler) => {
        for (const roomName in handler) {
          socket.on(roomName, handler[roomName]);
        }
      });
      const eventHandlers = [TradingSystemEvents(socket)];
      eventHandlers.forEach((handler) => {
        for (const eventName in handler) {
          socket.on(eventName, handler[eventName]);
        }
      });
    });
  } catch (error) {
    logger.error(`SOCKET CONNECT ERROR: ${error.message}`);
  }
};
