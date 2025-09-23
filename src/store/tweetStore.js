import { create } from "zustand";
import { TweetService } from "../services/tweetService";

const useTweetStore = create((set) => ({
  tweets: [],
  loading: false,

  loadTweets: async () => {
    set({ loading: true });
    try {
      const res = await TweetService.fetchTweets();
      set({ tweets: res.data, loading: false });
    } catch (err) {
      console.error("Error fetching tweets:", err);
      set({ loading: false });
    }
  },

  addTweet: async (data) => {
    try {
      const res = await TweetService.createTweet(data);
      set((state) => ({ tweets: [res.data, ...state.tweets] }));
    } catch (err) {
      console.error("Error creating tweet:", err);
    }
  },

  removeTweet: async (id) => {
    try {
      await TweetService.deleteTweet(id);
      set((state) => ({ tweets: state.tweets.filter((t) => t._id !== id) }));
    } catch (err) {
      console.error("Error deleting tweet:", err);
    }
  },
}));

export default useTweetStore;
