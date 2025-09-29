// 1. First, let's create a proper socket hook to manage connection
// hooks/useSocket.js
import { useEffect, useRef } from 'react';
import { initializeSocket, getSocket, disconnectSocket } from '../socket';

export const useSocket = (token) => {
  const socketRef = useRef(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (token && !isInitialized.current) {
      console.log('Initializing socket with token:', token);
      socketRef.current = initializeSocket(token);
      isInitialized.current = true;

      // Add connection event listeners for debugging
      socketRef.current.on('connect', () => {
        console.log('✅ Socket connected successfully');
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        isInitialized.current = false;
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
      });
    }

    return () => {
      // Don't disconnect on cleanup - keep connection alive
      // Only disconnect when component unmounts completely
    };
  }, [token]);

  return socketRef.current;
};