import { create } from "zustand";
import { VideoService } from "../services/videoService";

const useVideoStore = create((set) => ({
  videos: [],
  selectedVideo: null,
  loading: false,

  loadVideos: async () => {
    set({ loading: true });
    try {
      const res = await VideoService.fetchVideos();
      set({ videos: res.data, loading: false });
    } catch (err) {
      console.error("Error loading videos:", err);
      set({ loading: false });
    }
  },

  getVideoById: async (id) => {
    set({ loading: true });
    try {
      const res = await VideoService.getVideoById(id);
      set({ selectedVideo: res.data, loading: false });
    } catch (err) {
      console.error("Error fetching video:", err);
      set({ loading: false });
    }
  },

  addVideo: async (data) => {
    try {
      const res = await VideoService.uploadVideo(data);
      set((state) => ({ videos: [res.data, ...state.videos] }));
    } catch (err) {
      console.error("Error uploading video:", err);
    }
  },

  removeVideo: async (id) => {
    try {
      await VideoService.deleteVideo(id);
      set((state) => ({ videos: state.videos.filter(v => v._id !== id) }));
    } catch (err) {
      console.error("Error deleting video:", err);
    }
  },
}));

export default useVideoStore;
