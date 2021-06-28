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

const updateProtectLevel = (_socket: Socket) => ({protectLevel1, protectLevel2, protectLevel3, protectLevel4}) => {
  global.protectLevel1 = protectLevel1;
  global.protectLevel2 = protectLevel2;
  global.protectLevel3 = protectLevel3;
  global.protectLevel4 = protectLevel4;
};

export default (socket: Socket) => ({
  addProcessJob: addProcessJob(socket),
  changeProtectStatus: changeProtectStatus(socket),
  updateProtectLevel: updateProtectLevel(socket),
});
