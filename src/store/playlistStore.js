import { create } from "zustand";
import { PlaylistService } from "../services/playlistService";

const usePlaylistStore = create((set) => ({
  playlists: [],
  selectedPlaylist: null,
  loading: false,

  loadPlaylists: async (userId) => {
    set({ loading: true });
    try {
      const res = await PlaylistService.fetchUserPlaylists(userId);
      set({ playlists: res.data, loading: false });
    } catch (err) {
      console.error("Error fetching playlists:", err);
      set({ loading: false });
    }
  },

  getPlaylistById: async (playlistId) => {
    set({ loading: true });
    try {
      const res = await PlaylistService.fetchPlaylistById(playlistId);
      set({ selectedPlaylist: res.data, loading: false });
    } catch (err) {
      console.error("Error fetching playlist:", err);
      set({ loading: false });
    }
  },

  addPlaylist: async (data) => {
    try {
      const res = await PlaylistService.createPlaylist(data);
      set((state) => ({ playlists: [res.data, ...state.playlists] }));
    } catch (err) {
      console.error("Error creating playlist:", err);
    }
  },

  removePlaylist: async (playlistId) => {
    try {
      await PlaylistService.deletePlaylist(playlistId);
      set((state) => ({ playlists: state.playlists.filter(p => p._id !== playlistId) }));
    } catch (err) {
      console.error("Error deleting playlist:", err);
    }
  },
}));

export default usePlaylistStore;
