import type { FastifyInstance } from 'fastify';
import { Server as SocketIOServer } from 'socket.io';

export const registerSocketServer = (app: FastifyInstance) => {
  const io = new SocketIOServer(app.server, {
    cors: {
      origin: app.config.CORS_ORIGIN,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    app.log.info({ socketId: socket.id }, 'socket connected');

    socket.emit('platform:ready', {
      service: 'cpv-server',
      message: 'Realtime gateway initialized.',
    });

    socket.on('disconnect', (reason) => {
      app.log.info({ socketId: socket.id, reason }, 'socket disconnected');
    });
  });

  return io;
};
