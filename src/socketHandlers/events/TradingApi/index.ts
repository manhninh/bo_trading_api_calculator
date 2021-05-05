import {PROTECT_STATUS} from '@src/contants/system';
import QueueKue from '@src/queue';
import {Socket} from 'socket.io';

const addProcessJob = (_socket: Socket) => (id: string) => {
  const queue = new QueueKue();
  queue.processOrder(id);
};

const changeProtectStatus = (_socket: Socket) => (protectStatus: PROTECT_STATUS) => {
  global.protectBO = protectStatus;
};

export default (socket: Socket) => ({
  addProcessJob: addProcessJob(socket),
  changeProtectStatus: changeProtectStatus(socket),
});
