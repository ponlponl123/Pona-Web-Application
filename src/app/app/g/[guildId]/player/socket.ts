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

export const ws_manager = new Manager(
  `${endpoint}${endpoint_port ? ':' + endpoint_port : ''}/socket.io/`,
  {
    reconnectionDelayMax: 10000,
  }
);
