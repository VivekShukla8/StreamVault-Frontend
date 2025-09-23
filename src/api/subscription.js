import API from "./axios";

export const subscriptionAPI = {
  // Toggle subscription (subscribe/unsubscribe)
  toggleSubscription: (channelId) => API.post(`/subscriptions/toggle/${channelId}`),
  
  // Check subscription status
  getSubscriptionStatus: (channelId) => API.get(`/subscriptions/status/${channelId}`),
  
  // Get channel subscribers
  getChannelSubscribers: (channelId) => API.get(`/subscriptions/channel/${channelId}/subscribers`),
  
  // Get user's subscribed channels
  getSubscribedChannels: (userId) => API.get(`/subscriptions/user/${userId}/channels`),
};
