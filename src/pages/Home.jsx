import React, { useState, useEffect } from "react";
import { videoAPI } from "../api/video";
import Loader from "../components/Loader";
import VideoCard from "../components/VideoCard";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [displayedVideos, setDisplayedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const VIDEOS_PER_PAGE = 9;

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    // Update displayed videos when currentPage or videos change
    const startIndex = 0;
    const endIndex = currentPage * VIDEOS_PER_PAGE;
    const slicedVideos = videos.slice(startIndex, endIndex);
    setDisplayedVideos(slicedVideos);
    
    console.log('📊 Pagination Debug:', {
      totalVideos: videos.length,
      currentPage,
      videosPerPage: VIDEOS_PER_PAGE,
      startIndex,
      endIndex,
      displayedCount: slicedVideos.length,
      allVideoIds: videos.map(v => v._id),
      displayedVideoIds: slicedVideos.map(v => v._id)
    });
  }, [currentPage, videos]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching videos from backend...');
      // Fetch videos sorted by views (trending logic)
      const response = await videoAPI.getAllVideos({ 
        limit: 100, // Fetch more videos to sort
        sortBy: 'views',
        sortType: 'desc' 
      });
      
      console.log('✅ Backend response received:', response);
      console.log('✅ Full response structure:', {
        hasData: !!response.data,
        hasDataData: !!response.data?.data,
        hasDataDataVideos: !!response.data?.data?.videos,
        hasDataVideos: !!response.data?.videos
      });
      
      let fetchedVideos = response.data?.data?.videos || response.data?.videos || [];
      
      console.log('📹 Videos extracted from backend:', fetchedVideos.length, 'videos');
      
      // Sort by time (createdAt) after fetching
      if (fetchedVideos.length > 0) {
        fetchedVideos = fetchedVideos.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        console.log('🎬 First video after time sorting:', {
          id: fetchedVideos[0]._id,
          title: fetchedVideos[0].title,
          thumbnail: fetchedVideos[0].thumbnail,
          createdAt: fetchedVideos[0].createdAt,
          views: fetchedVideos[0].views
        });
        console.log('🎬 Last video after time sorting:', {
          id: fetchedVideos[fetchedVideos.length - 1]._id,
          title: fetchedVideos[fetchedVideos.length - 1].title,
          thumbnail: fetchedVideos[fetchedVideos.length - 1].thumbnail,
          createdAt: fetchedVideos[fetchedVideos.length - 1].createdAt,
          views: fetchedVideos[fetchedVideos.length - 1].views
        });
      }
      
      setVideos(fetchedVideos);
      console.log('✅ Videos state updated with', fetchedVideos.length, 'videos');
      
    } catch (err) {
      console.error('❌ Error fetching videos:', err);
      console.error('❌ Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError("Failed to fetch videos. Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    console.log('🔽 Load More clicked, current page:', currentPage);
    setCurrentPage(prev => prev + 1);
  };

  const hasMoreVideos = displayedVideos.length < videos.length;
  
  console.log('🎯 Render state:', {
    totalVideos: videos.length,
    displayedVideos: displayedVideos.length,
    hasMoreVideos,
    currentPage
  });

  if (loading) return <Loader />;
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 flex items-center justify-center p-3 sm:p-4 md:p-8">
        <div className="max-w-md w-full bg-gradient-to-br from-red-950/30 to-slate-900/50 backdrop-blur-xl rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 border border-red-500/20 shadow-2xl">
          <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl md:rounded-2xl mx-auto mb-3 sm:mb-4 md:mb-6 shadow-lg shadow-red-500/30">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-center bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent mb-2 md:mb-3">
            Connection Error
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm md:text-base text-center leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <div className="relative w-full px-3 sm:px-4 md:px-6 lg:px-8 pt-8 sm:pt-12 md:pt-16 lg:pt-24 pb-6 sm:pb-8 md:pb-12 lg:pb-16">
        <div className="text-center space-y-3 sm:space-y-4 md:space-y-6">
          {/* Main Heading */}
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black tracking-tight">
              <span className="block bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-1 sm:mb-2 md:mb-3">
                Discover
              </span>
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient">
                Amazing Content
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-slate-400 font-light max-w-3xl mx-auto leading-relaxed px-3 sm:px-4">
              Explore premium videos from talented creators around the world
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-12 pt-4 sm:pt-6 md:pt-8">
            <div className="group cursor-default">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                HD
              </div>
              <div className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 sm:mt-1">Quality</div>
            </div>
            <div className="w-px h-8 sm:h-10 md:h-12 bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>
            <div className="group cursor-default">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                24/7
              </div>
              <div className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 sm:mt-1">Streaming</div>
            </div>
            <div className="w-px h-8 sm:h-10 md:h-12 bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>
            <div className="group cursor-default">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                4K
              </div>
              <div className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 sm:mt-1">Ready</div>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Grid Section */}
      <div className="relative w-full px-3 sm:px-4 md:px-6 lg:px-8 pb-8 sm:pb-12 md:pb-16 lg:pb-24">
        {videos.length > 0 ? (
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            {/* Videos Grid - Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8">
              {displayedVideos.map((video, index) => (
                <div 
                  key={video._id} 
                  className="group transform transition-all duration-500 hover:-translate-y-2"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards',
                    opacity: 0
                  }}
                >
                  <VideoCard video={video} />
                </div>
              ))}
            </div>

            {/* Load More Section */}
            {hasMoreVideos && (
              <div className="flex justify-center pt-6 sm:pt-8 md:pt-10 lg:pt-12">
                <button 
                  onClick={handleLoadMore}
                  className="group relative px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm md:text-base text-white shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 overflow-hidden border border-slate-600/50 hover:border-cyan-500/50 active:scale-95"
                >
                  <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                    Load More Videos
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Enhanced Empty State */
          <div className="flex items-center justify-center py-8 sm:py-12 md:py-16 lg:py-24">
            <div className="max-w-xl w-full mx-auto px-3 sm:px-4">
              <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 lg:p-16 border border-slate-700/50 shadow-2xl overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="relative z-10 text-center space-y-4 sm:space-y-6 md:space-y-8">
                  {/* Icon */}
                  <div className="relative inline-flex">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full blur-xl md:blur-2xl opacity-50 animate-pulse"></div>
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/30">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      No Videos Yet
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed max-w-md mx-auto px-2">
                      Be the first to share amazing content with the world. Upload your video now!
                    </p>
                  </div>

                  {/* CTA Button */}
                  <a 
                    href="/upload" 
                    className="group inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm md:text-base shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden relative"
                  >
                    <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload Your First Video
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </a>

                  {/* Status Indicator */}
                  <div className="pt-3 sm:pt-4 md:pt-6 flex items-center justify-center gap-2 sm:gap-3 text-[10px] sm:text-xs md:text-sm">
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-slate-800/50 rounded-full border border-slate-700/50">
                      <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 rounded-full ${error ? 'bg-red-400' : 'bg-green-400 animate-pulse'}`}></div>
                      <span className="text-slate-300 font-medium">
                        Backend {error ? 'Disconnected' : 'Connected'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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