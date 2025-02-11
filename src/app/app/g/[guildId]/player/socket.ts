"use client";

import { Manager } from "socket.io-client";

export const ws_manager = new Manager(`/socket.io/`, {
  reconnectionDelayMax: 10000,
});