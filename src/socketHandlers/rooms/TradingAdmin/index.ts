import ProtectLogRepository from '@src/repository/ProtectLogRepository';
import {EMITS} from '@src/socketHandlers/EmitType';
import {logger} from 'bo-trading-common/lib/utils';
import {Socket} from 'socket.io';

const administrator = (socket: Socket) => (data) => {
  socket.join('administrator');
};

export default (socket: Socket) => ({
  administrator: administrator(socket),
});
