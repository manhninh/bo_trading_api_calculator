import {Socket} from 'socket.io';
import {TradingCandles} from './ITradingSystem';

const protectStatus: TradingCandles = (socket) => (data: number) => {
  console.log(data, 'data');
};

export default (socket: Socket) => ({
  protectStatus: protectStatus(socket),
});
