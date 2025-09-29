import axios from "./axios";

// Send a message request
export const createMessageRequest = (receiverId, content) =>
  axios.post("/messages/requests", { receiverId, content });

// Get all message requests
export const getMessageRequests = () =>
  axios.get("/messages/requests");

// Respond to a message request (accept/reject)
export const respondMessageRequest = (requestId, action) =>
  axios.patch(`/messages/requests/${requestId}`, { action });

// Get all conversations
export const getConversations = () =>
  axios.get("/messages/conversations");

// Get all messages in a conversation
export const getConversationMessages = (convId) =>
  axios.get(`/messages/conversations/${convId}/messages`);

// Send a new message in a conversation
export const postConversationMessage = (convId, data) =>
  axios.post(`/messages/conversations/${convId}/messages`, data);

// Check status of message request with a receiver  
export const checkMessageRequest = async (receiverId) => {
  const res = await axios.get(`/messages/requests/${receiverId}/check`);
  return res.data;
  // Example: { status: 'none' | 'pending' | 'accepted', conversationId?: '...' }
};
