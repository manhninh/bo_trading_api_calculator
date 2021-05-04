import QueueKue from '@src/queue';
import {Socket} from 'socket.io';

const addProcessJob = (_socket: Socket) => (id: string) => {
  console.log('sssss');
  const queue = new QueueKue();
  queue.processOrder(id);
};

export default (socket: Socket) => ({
  addProcessJob: addProcessJob(socket),
});
