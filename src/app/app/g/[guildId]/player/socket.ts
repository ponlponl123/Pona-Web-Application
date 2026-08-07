'use client';

import { Manager, ManagerOptions, SocketOptions } from 'socket.io-client';

/**
 * Safely constructs the WebSocket target origin URL.
 */
const getWsEndpointUrl = (): string => {
  const envEndpoint = process.env['NEXT_PUBLIC_PONA_APPLICATION_WS_ENDPOINT'];
  const envPort = process.env['NEXT_PUBLIC_PONA_APPLICATION_WS_ENDPOINT_PORT'];

  const baseEndpoint =
    envEndpoint ||
    (typeof window !== 'undefined' ? window.location.origin : '');

  if (!baseEndpoint) return '';

  try {
    const url = new URL(baseEndpoint);
    if (envPort) {
      url.port = envPort;
    }
    return url.origin;
  } catch {
    return envPort ? `${baseEndpoint}:${envPort}` : baseEndpoint;
  }
};

const DEFAULT_SOCKET_OPTIONS: Partial<ManagerOptions & SocketOptions> = {
  path: '/socket.io/',
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
  reconnectionAttempts: Infinity,
  transports: ['websocket', 'polling'],
  autoConnect: false,
};

let managerInstance: Manager | null = null;

/**
 * Returns a lazily-initialized Socket.IO Manager instance.
 * Prevents side-effects or network setup during Server-Side Rendering (SSR).
 */
export const getWsManager = (
  options?: Partial<ManagerOptions & SocketOptions>
): Manager => {
  if (!managerInstance) {
    const endpoint = getWsEndpointUrl();
    managerInstance = new Manager(endpoint, {
      ...DEFAULT_SOCKET_OPTIONS,
      ...options,
    });
  }
  return managerInstance;
};

/**
 * Exported singleton proxy for backward compatibility with `ws_manager.socket(...)`.
 * Lazily delegates property access and method calls to the client-side Manager instance.
 */
export const ws_manager = new Proxy({} as Manager, {
  get(_target, prop: keyof Manager) {
    const instance = getWsManager();
    const value = instance[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

/**
 * Safely disconnects, removes event listeners, and deletes the socket namespace from Manager.
 */
export const destroySocket = (nsp: string) => {
  if (managerInstance) {
    const managerInternal = managerInstance as unknown as {
      nsps: Record<string, { off: () => void; disconnect: () => void }>;
    };
    const socket = managerInternal.nsps[nsp];
    if (socket) {
      socket.off();
      socket.disconnect();
      delete managerInternal.nsps[nsp];
    }
  }
};



