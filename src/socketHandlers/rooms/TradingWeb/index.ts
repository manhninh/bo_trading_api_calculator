import {Socket} from 'socket.io';
import {TradingCandles} from './ITradingSystem';

const userConnected: TradingCandles = (socket) => (data) => {
  socket.join(socket['user_id']?.toString());
};

const administrator: TradingCandles = (socket) => (data) => {
  socket.join('administrator');
};

export default (socket: Socket) => ({
  userConnected: userConnected(socket),
  administrator: administrator(socket),
});
