import config from '@src/config';
import AccessTokenRepository from '@src/repository/AccessTokenRepository';
import AdminRepository from '@src/repository/AdminRepository';
import UserRepository from '@src/repository/UserRepository';
import {logger} from 'bo-trading-common/lib/utils';
import {Server, Socket} from 'socket.io';
import {ExtendedError} from 'socket.io/dist/namespace';
import TradingApiEvents from './events/TradingApi';
import TradingAdminRooms from './rooms/TradingAdmin';
import TradingWebRooms from './rooms/TradingWeb';

export default (io: Server) => {
  try {
    global.io = io;
    io.use(async (socket: Socket, next: (err?: ExtendedError) => void) => {
      try {
        const token = socket.handshake.query['token'].toString();
        if (token) {
          if (token === config.WS_TOKEN_API) {
            next();
          } else {
            const accessTokenRes = new AccessTokenRepository();
            const accessToken = await accessTokenRes.findByToken(token);
            const userRepository = new UserRepository();
            const user = await userRepository.findById(accessToken.user_id);
            if (user) {
              socket['user_id'] = user.id.toString();
              next();
            } else {
              const adminRepository = new AdminRepository();
              const admin = await adminRepository.findById(accessToken.user_id);
              if (admin) {
                socket['user_id'] = 'administrator';
                next();
              } else next(new Error('Socket not authorized'));
            }
          }
        } else next(new Error('Socket not authorized'));
      } catch (error) {
        // logger.error(`SOCKET AUTHORIZE ERROR: ${error.message}`);
        next(new Error('Socket not authorized'));
      }
    });

    io.on('connection', (socket: Socket) => {
      const roomHandlers = [TradingWebRooms(socket), TradingAdminRooms(socket)];
      roomHandlers.forEach((handler) => {
        for (const roomName in handler) {
          socket.on(roomName, handler[roomName]);
        }
      });
      const eventHandlers = [TradingApiEvents(socket)];
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
