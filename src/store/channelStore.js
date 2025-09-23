import { create } from "zustand";
import { ChannelService } from "../services/channelService";

const useChannelStore = create((set) => ({
  channels: [],
  selectedChannel: null,
  loading: false,

  loadChannels: async () => {
    set({ loading: true });
    try {
      const res = await ChannelService.fetchChannels();
      set({ channels: res.data, loading: false });
    } catch (err) {
      console.error("Error loading channels:", err);
      set({ loading: false });
    }
  },

  getChannelById: async (channelId) => {
    set({ loading: true });
    try {
      const res = await ChannelService.fetchChannelById(channelId);
      set({ selectedChannel: res.data, loading: false });
    } catch (err) {
      console.error("Error fetching channel:", err);
      set({ loading: false });
    }
  },
}));

export default useChannelStore;
