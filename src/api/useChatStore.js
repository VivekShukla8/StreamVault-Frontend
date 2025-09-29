import { create } from "zustand";
import { io } from "socket.io-client";
import API from "../api/axios";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  withCredentials: true,
});

export const useChatStore = create((set, get) => ({
  conversations: [],
  messages: [],
  activeConversation: null,

  loadConversations: async () => {
    const res = await API.get("/conversations");
    set({ conversations: res.data });
  },

  loadMessages: async (conversationId) => {
    const res = await API.get(`/messages/${conversationId}`);
    set({ messages: res.data, activeConversation: conversationId });
  },

  sendMessage: async (conversationId, content) => {
    const res = await API.post(`/messages/${conversationId}`, { content });
    socket.emit("send_message", { conversationId, message: res.data });
    set((state) => ({ messages: [...state.messages, res.data] }));
  },

  listenForMessages: () => {
    socket.on("new_message", (msg) => {
      const { activeConversation, messages } = get();
      if (msg.conversation === activeConversation) {
        set({ messages: [...messages, msg] });
      }
    });
  },
}));
