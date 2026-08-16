import { io, type Socket } from 'socket.io-client';
import { API_BASE } from '@/lib/api';

// socket.io-client treats a URL's pathname as a namespace, not the HTTP path —
// passing the API base (which includes /api) would connect to a nonexistent
// "/api" namespace. Strip it down to the bare origin.
const SOCKET_ORIGIN = (() => {
  try {
    return new URL(API_BASE).origin;
  } catch {
    return API_BASE;
  }
})();

let socket: Socket | null = null;
let socketToken: string | null = null;

/** Singleton Socket.IO connection, authenticated with the admin's JWT. Returns
 * null (and disconnects any existing socket) once the admin is logged out. */
export function getSocket(token: string | null): Socket | null {
  if (!token) {
    socket?.disconnect();
    socket = null;
    socketToken = null;
    return null;
  }

  if (socket && socketToken === token) return socket;

  socket?.disconnect();
  socket = io(SOCKET_ORIGIN, { auth: { token }, transports: ['websocket', 'polling'] });
  socketToken = token;
  return socket;
}
