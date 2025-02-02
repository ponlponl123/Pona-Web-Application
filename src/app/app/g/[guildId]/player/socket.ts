"use client";

import { Manager } from "socket.io-client";

export const ws_manager = new Manager(`${window.location.origin}/socket.io/`, {
  reconnectionDelayMax: 10000,
});