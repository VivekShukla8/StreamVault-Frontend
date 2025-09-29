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
        limit: 12,
        sortBy: 'views',
        sortType: 'desc' 
      });
      
      const videos = response.data?.data?.videos || response.data?.videos || [];
      
      if (videos.length > 0) {
        console.log('Trending video data structure:', videos[0]);
      } else {
        console.log('No trending videos, using sample data');
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
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-gradient-to-br from-red-950/30 to-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-red-500/20 shadow-2xl">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto mb-6 shadow-lg shadow-red-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-center bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent mb-3">
            Connection Error
          </h3>
          <p className="text-slate-300 text-center leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section - CHANGED: Smaller and more compact */}
      <div className="relative px-6 md:px-12 pt-12 md:pt-16 pb-8 md:pb-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4">
            {/* Main Heading - CHANGED: Reduced size */}
            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight">
                <span className="block bg-gradient-to-r from-red-400 via-orange-500 to-yellow-600 bg-clip-text text-transparent animate-gradient">
                  🔥 Trending Right Now
                </span>
              </h1>
              
              {/* Subtitle - CHANGED: Smaller text */}
              <p className="text-sm md:text-lg text-slate-400 font-light max-w-2xl mx-auto leading-relaxed px-4">
                Most popular videos from creators around the world
              </p>
            </div>

            {/* Stats Bar - CHANGED: Removed video count, made smaller */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 pt-4">
              <div className="group cursor-default">
                <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-500 to-yellow-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  LIVE
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1">Updated</div>
              </div>
              <div className="w-px h-8 bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>
              <div className="group cursor-default">
                <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-yellow-600 to-red-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  TOP
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1">Ranked</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Grid Section */}
      <div className="relative px-6 md:px-12 pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto">
          {videos.length > 0 ? (
            <div className="space-y-8">
              {/* Videos Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
                {videos.map((video, index) => (
                  <div 
                    key={video._id} 
                    className="group relative transform transition-all duration-500 hover:-translate-y-2"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'fadeInUp 0.6s ease-out forwards',
                      opacity: 0
                    }}
                  >
                    {/* Rank Badge */}
                    <div className="absolute -top-3 -left-3 z-20">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-2xl transition-transform duration-300 group-hover:scale-110 ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                        index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                        'bg-gradient-to-br from-slate-700 to-slate-900'
                      }`}>
                        #{index + 1}
                      </div>
                      {index < 3 && (
                        <div className={`absolute -inset-1 rounded-xl blur-lg animate-pulse ${
                          index === 0 ? 'bg-yellow-400/60' :
                          index === 1 ? 'bg-gray-300/60' :
                          'bg-amber-600/60'
                        }`}></div>
                      )}
                    </div>

                    {/* Hot Badge for Top 3 */}
                    {index < 3 && (
                      <div className="absolute top-3 right-3 z-20 px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 backdrop-blur-sm rounded-full text-white text-xs font-bold shadow-lg flex items-center gap-1 animate-pulse">
                        <span>🔥</span>
                        <span>HOT</span>
                      </div>
                    )}

                    <VideoCard video={video} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Enhanced Empty State */
            <div className="flex items-center justify-center py-16 md:py-24">
              <div className="max-w-xl w-full mx-auto">
                <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-3xl p-12 md:p-16 border border-slate-700/50 shadow-2xl overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  
                  <div className="relative z-10 text-center space-y-8">
                    {/* Icon */}
                    <div className="relative inline-flex">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-600 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                      <div className="relative w-28 h-28 bg-gradient-to-br from-red-400 via-orange-500 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/30">
                        <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                        </svg>
                      </div>
                    </div>

                    {/* Text Content */}
                    <div className="space-y-4">
                      <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                        No Trending Videos Yet
                      </h3>
                      <p className="text-slate-400 text-lg leading-relaxed max-w-md mx-auto">
                        Be the first to create viral content! Upload your video and start trending today.
                      </p>
                    </div>

                    {/* CTA Button */}
                    <a 
                      href="/upload" 
                      className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-600 text-white rounded-2xl font-bold shadow-2xl shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden relative"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload Your Video
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 5s ease infinite;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}