// src/store/useChatStore.js
import { create } from "zustand";
import { getSocket } from "../socket";
import axios from "axios";

export const useChatStore = create((set, get) => ({
  user: null, // logged-in user info { _id, username, token, avatar }
  conversations: [],
  activeConversation: null, // conversationId
  messages: [],
  loading: false,
  error: null,

  // Set user after login
  setUser: (user) => set({ user }),

  // Set active conversation
  setActiveConversation: (conversationId) => {
    set({ activeConversation: conversationId, messages: [] });
    get().loadMessages(conversationId);
  },

  // Load all conversations
  loadConversations: async () => {
    set({ loading: true, error: null });
    try {
      const baseURL = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
      const res = await axios.get(`${baseURL}/api/v1/messages/conversations`, {
        headers: { Authorization: `Bearer ${get().user.token}` },
      });
      set({ conversations: res.data.data, loading: false });
    } catch (err) {
      set({ error: err, loading: false });
    }
  },

  // Load messages for a conversation
  loadMessages: async (conversationId) => {
    set({ loading: true, error: null });
    try {
      const baseURL = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
      const res = await axios.get(
        `${baseURL}/api/v1/messages/conversations/${conversationId}/messages`,
        { headers: { Authorization: `Bearer ${get().user.token}` } }
      );
      set({ messages: res.data.data, loading: false });
    } catch (err) {
      set({ error: err, loading: false });
    }
  },

  // Send message
  sendMessage: async (conversationId, content) => {
    if (!content.trim()) return;
    try {
      const baseURL = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
      await axios.post(
        `${baseURL}/api/v1/messages/conversations/${conversationId}/messages`,
        { content },
        { headers: { Authorization: `Bearer ${get().user.token}` } }
      );
      // Real-time message will be handled via socket
    } catch (err) {
      set({ error: err });
    }
  },

  // Listen for socket messages
  listenForMessages: () => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("new_message", ({ conversationId, message }) => {
      const activeId = get().activeConversation;
      if (conversationId === activeId) {
        set((state) => ({ messages: [...state.messages, message] }));
      }
      // Optionally update conversations' lastMessage
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv._id === conversationId ? { ...conv, lastMessage: message } : conv
        ),
      }));
    });
  },

  // Send typing indicator
  sendTypingIndicator: (conversationId) => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit("typing", { conversationId });
  },
}));
