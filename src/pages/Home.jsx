import React, { useState, useEffect } from "react";
import { videoAPI } from "../api/video";
import Loader from "../components/Loader";
import VideoCard from "../components/VideoCard";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching videos from backend...');
      const response = await videoAPI.getAllVideos({ 
        limit: 9, // Following project spec: 6-9 videos on home page
        sortBy: 'createdAt', 
        sortType: 'desc' 
      });
      
      console.log('✅ Backend response received:', response);
      
      // Handle different response structures
      const videos = response.data?.data?.videos || response.data?.videos || [];
      
      console.log('📹 Videos extracted:', videos.length, 'videos');
      if (videos.length > 0) {
        console.log('🎬 First video sample:', {
          id: videos[0]._id,
          title: videos[0].title,
          thumbnail: videos[0].thumbnail,
          uploader: videos[0].uploader?.username
        });
      }
      
      setVideos(videos);
      
    } catch (err) {
      console.error('❌ Error fetching videos:', err);
      setError("Failed to fetch videos. Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-zinc-950">
      {/* Hero Section */}
      <div className="px-8 pt-12 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-light text-slate-100 mb-4 tracking-tight">
              Discover Amazing <span className="bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent font-normal">Content</span>
            </h1>
            <p className="text-xl text-slate-400 font-light max-w-2xl mx-auto leading-relaxed">
              Explore premium videos from creators around the world on StreamVault 
            </p>
          </div>
        </div>
      </div>
      {/* Videos Grid */}
      <div className="px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((video) => (
                <div key={video._id} className="group">
                  <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-800/30 hover:border-slate-700/50 transition-all duration-500 hover:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.6)]">
                    <VideoCard video={video} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl p-12 max-w-lg mx-auto border border-slate-800/30">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <svg className="w-12 h-12 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-light text-slate-100 mb-4">No videos found</h3>
                <p className="text-slate-400 mb-8 leading-relaxed">No videos available from backend. Please upload videos first!</p>
                <div className="space-y-4">
                  <a 
                    href="/upload" 
                    className="inline-flex items-center gap-3 px-8 py-4 bg-slate-100 text-slate-900 rounded-2xl hover:bg-white transition-all duration-300 font-medium shadow-lg hover:shadow-xl active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4v16m8-8H4"/>
                    </svg>
                    Upload Video
                  </a>
                  <p className="text-slate-500 text-sm">Backend: {error ? '❌ Disconnected' : '✅ Connected'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
