import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let socketEnabled = true;

export const initSocket = (token?: string): Socket | null => {
  // Check if socket.io is enabled (can be disabled if server doesn't support it)
  if (!socketEnabled) {
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  try {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
    
    socket = io(apiUrl, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      timeout: 5000,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      // If server doesn't support socket.io, disable it
      if (reason === "io server disconnect" || reason === "transport close") {
        socketEnabled = false;
      }
    });

    socket.on("connect_error", (error) => {
      console.warn("Socket connection error:", error.message);
      // Disable socket if server doesn't support it
      if (error.message.includes("404") || error.message.includes("500")) {
        console.warn("Socket.io not available on server, disabling real-time features");
        socketEnabled = false;
        if (socket) {
          socket.disconnect();
          socket = null;
        }
      }
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    return socket;
  } catch (error) {
    console.warn("Failed to initialize socket:", error);
    socketEnabled = false;
    return null;
  }
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const isSocketEnabled = (): boolean => {
  return socketEnabled && socket?.connected === true;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default socket;

