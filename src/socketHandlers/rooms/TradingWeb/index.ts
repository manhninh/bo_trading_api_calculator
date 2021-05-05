import {Socket} from 'socket.io';

const userConnected = (socket: Socket) => () => {
  socket.join(socket['user_id']?.toString());
};

export default (socket: Socket) => ({
  userConnected: userConnected(socket),
});
