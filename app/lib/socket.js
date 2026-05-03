import { io } from "socket.io-client";

/** Socket.IO server (see `socketServer.js`). Default 3001 — Next.js app is usually 3000. */
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    reconnectionAttempts: 5,
    reconnectionDelay: 1500,
});
