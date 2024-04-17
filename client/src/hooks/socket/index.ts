import { useEffect, useRef } from 'react';
import { io, SocketOptions, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

import { env } from '@/env.mjs';

const useSocket = (
  events: { [key: string]: (...args: unknown[]) => void } = {},
  options?: SocketOptions,
) => {
  const socketRef = useRef<Socket | undefined>(undefined);
  const { data: { accessToken = undefined } = {} } = useSession();

  useEffect(() => {
    if (!accessToken || socketRef.current) return () => {};

    socketRef.current = io(env.NEXT_PUBLIC_API_URL, {
      transports: ['websocket'],
      auth: {
        token: accessToken,
      },
      ...options,
    });
  }, [accessToken, options]);

  useEffect(() => {
    const socket = socketRef.current;

    if (!socket) return () => {};

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;

    if (!socket) return () => {};

    Object.entries(events).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.entries(events).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [events]);

  return socketRef.current;
};

export default useSocket;
