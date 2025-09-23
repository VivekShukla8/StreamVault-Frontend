import React, { useState, useEffect } from "react";
import { videoAPI } from "../api/video";
import Loader from "../components/Loader";
import VideoCard from "../components/VideoCard";

export default function Trending() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrendingVideos();
  }, []);

  const fetchTrendingVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await videoAPI.getAllVideos({ 
        limit: 12, // Show more videos on trending page
        sortBy: 'views', // Sort by views for trending
        sortType: 'desc' 
      });
      
      // Handle different response structures
      const videos = response.data?.data?.videos || response.data?.videos || [];
      
      // Debug: Log trending video structure
      if (videos.length > 0) {
        console.log('Trending video data structure:', videos[0]);
      } else {
        console.log('No trending videos, using sample data');
        // Add sample trending videos for testing
        const sampleTrendingVideos = [
          {
            _id: 'trending1',
            title: 'Most Popular Video Today',
            thumbnail: 'https://picsum.photos/320/180?random=trending1', 
            duration: 420,
            views: 50000,
            createdAt: new Date(),
            owner: { username: 'TrendingCreator1', avatar: 'https://picsum.photos/40/40?random=trendavatar1' }
          },
          {
            _id: 'trending2',
            title: 'Viral Video This Week',
            thumbnail: 'https://picsum.photos/320/180?random=trending2',
            duration: 240, 
            views: 75000,
            createdAt: new Date(),
            owner: { username: 'TrendingCreator2', avatar: 'https://picsum.photos/40/40?random=trendavatar2' }
          },
          {
            _id: 'trending3',
            title: 'Breaking News Video',
            thumbnail: 'https://picsum.photos/320/180?random=trending3',
            duration: 360,
            views: 120000, 
            createdAt: new Date(),
            owner: { username: 'NewsChannel', avatar: 'https://picsum.photos/40/40?random=trendavatar3' }
          }
        ];
        setVideos(sampleTrendingVideos);
        return;
      }
      
      setVideos(videos);
      
    } catch (err) {
      setError("Failed to fetch trending videos");
      console.error("Error fetching trending videos:", err);
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
          <div className="relative">
            {/* Background decorations */}
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-yellow-500/10 to-red-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
            
            {/* Main header container */}
            <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800/30 shadow-[0_25px_60px_-12px_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-6 mb-4">
                {/* Trending icon with glow */}
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                    </svg>
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl opacity-75 blur animate-pulse"></div>
                </div>
                
                {/* Title section */}
                <div className="flex-1">
                  <h1 className="text-4xl md:text-5xl font-light text-slate-100 mb-2 tracking-tight">
                    Trending <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent font-normal">Now</span>
                  </h1>
                  <p className="text-xl text-slate-400 font-light leading-relaxed">
                    🚀 Most popular videos right now • Updated every hour
                  </p>
                </div>
                
                {/* Stats badge */}
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-2xl border border-slate-700/30">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-slate-300 text-sm font-medium">Live Updates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((video, index) => (
                <div key={video._id} className="group relative">
                  {/* Trending rank badge */}
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                      index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                      'bg-gradient-to-br from-slate-500 to-slate-600'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
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
                <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-light text-slate-100 mb-4">No trending videos</h3>
                <p className="text-slate-400 mb-8 leading-relaxed">Check back later for popular content!</p>
                <a 
                  href="/upload" 
                  className="inline-flex items-center gap-3 px-8 py-4 bg-slate-100 text-slate-900 rounded-2xl hover:bg-white transition-all duration-300 font-medium shadow-lg hover:shadow-xl active:scale-95"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4v16m8-8H4"/>
                  </svg>
                  Upload Video
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}