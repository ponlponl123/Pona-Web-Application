'use client';

import { Manager } from 'socket.io-client';

const getEndpoint = () => {
  if (typeof window !== 'undefined') {
    return (
      process.env['NEXT_PUBLIC_PONA_APPLICATION_WS_ENDPOINT'] ||
      window.location.origin
    );
  }
  return process.env['NEXT_PUBLIC_PONA_APPLICATION_WS_ENDPOINT'] || '';
};

const endpoint_port =
  process.env['NEXT_PUBLIC_PONA_APPLICATION_WS_ENDPOINT_PORT'] || '';

const endpoint = getEndpoint();
const baseUrl = `${endpoint}${endpoint_port ? ':' + endpoint_port : ''}`;

export const ws_manager = new Manager(baseUrl, {
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
  timeout: 20000,
});
