import { create } from "zustand";
import { CommentService } from "../services/commentService";

const useCommentStore = create((set) => ({
  comments: [],
  loading: false,

  loadComments: async (videoId) => {
    set({ loading: true });
    try {
      const res = await CommentService.fetchComments(videoId);
      set({ comments: res.data, loading: false });
    } catch (err) {
      console.error("Error loading comments:", err);
      set({ loading: false });
    }
  },

  addComment: async (videoId, data) => {
    try {
      const res = await CommentService.addComment(videoId, data);
      set((state) => ({ comments: [res.data, ...state.comments] }));
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  },

  removeComment: async (commentId) => {
    try {
      await CommentService.deleteComment(commentId);
      set((state) => ({ comments: state.comments.filter(c => c._id !== commentId) }));
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  },

  updateComment: async (commentId, content) => {
    try {
      const res = await CommentService.updateComment(commentId, content);
      set((state) => ({
        comments: state.comments.map(c => (c._id === commentId ? res.data : c)),
      }));
    } catch (err) {
      console.error("Error updating comment:", err);
    }
  },
}));

export default useCommentStore;
