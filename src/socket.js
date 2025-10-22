// src/socket.js
import { io } from "socket.io-client";

// const SOCKET_SERVER_URL = "https://streamvault-backend-production-ccf9.up.railway.app/"

const SOCKET_SERVER_URL = "http://localhost:8000/"

let socket = null;

/**
 * initSocket({ token })
 * - token optional; when omitted it tries localStorage keys
 */
export function initSocket({ token } = {}) {
  if (socket) return socket;

  const storedToken =
    token ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    null;

  socket = io(SOCKET_SERVER_URL, {
    transports: ["websocket"],
    withCredentials: true,
    auth: {
      token: storedToken ? `Bearer ${storedToken}` : undefined,
    },
  });

  socket.on("connect", () => {
    console.log("🔌 socket connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.log("⚠️ socket connect_error:", err && err.message ? err.message : err);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 socket disconnected:", reason);
  });

  return socket;
}

/**
 * getSocket() - returns socket. If socket isn't initialized it will
 * auto-call initSocket() (which reads localStorage token).
 * This prevents throwing "Socket not initialized" errors.
 */
export function getSocket() {
  if (!socket) {
    // try to initialize using stored token
    socket = initSocket();
  }
  return socket;
}

export default initSocket;
