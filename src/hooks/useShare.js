import { useToast } from "../components/ToastContext";// Adjust path as needed

export const useShare = () => {
  const { showToast } = useToast(); // Use the context toast

  const shareVideo = (videoId) => {
    const videoUrl = `${window.location.origin}/#/video/${videoId}`;
    navigator.clipboard.writeText(videoUrl)
      .then(() => {
        showToast('Video URL copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        showToast('Failed to copy link');
      });
  };

  const shareChannel = (channelId) => {
    const channelUrl = `${window.location.origin}/#/channel/${channelId}`;
    navigator.clipboard.writeText(channelUrl)
      .then(() => {
        showToast('Channel URL copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy channel URL:', err);
        showToast('Failed to copy channel link');
      });
  };

  const sharePlaylist = (playlistId) => {
    const playlistUrl = `${window.location.origin}/#/playlist/${playlistId}`;
    navigator.clipboard.writeText(playlistUrl)
      .then(() => {
        showToast('Playlist URL copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy playlist URL:', err);
        showToast('Failed to copy playlist link');
      });
  };

  const shareCustomUrl = (url, customMessage = 'URL copied to clipboard!') => {
    navigator.clipboard.writeText(url)
      .then(() => {
        showToast(customMessage);
      })
      .catch(err => {
        console.error('Failed to copy URL:', err);
        showToast('Failed to copy link');
      });
  };

  return {
    shareVideo,
    shareChannel,
    sharePlaylist,
    shareCustomUrl
  };
};