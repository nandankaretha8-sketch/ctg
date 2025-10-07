import { useState, useEffect } from 'react';
import { Play, ExternalLink } from 'lucide-react';

import { API_URL } from '@/lib/api';
interface YouTubeVideo {
  _id: string;
  title: string;
  url: string;
  thumbnail: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

const YouTubeVideosSection = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch(`${API_URL}/youtube-videos`);
      const data = await response.json();
      
      if (data.success) {
        setVideos(data.data.filter((video: YouTubeVideo) => video.isActive));
      }
    } catch (error) {
      // Error handling:'Error fetching YouTube videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getThumbnailUrl = (url: string, customThumbnail?: string) => {
    if (customThumbnail) {
      return customThumbnail;
    }
    
    const videoId = extractVideoId(url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    
    return '/placeholder-video.jpg'; // Fallback placeholder
  };

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              <span style={{
                background: 'linear-gradient(135deg, #ffffff, #6b7280)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Explore Our Videos
              </span>
            </h2>
            <p className="text-gray-300 text-lg">
              Learn from our expert trading tutorials and strategies
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-pulse bg-gray-600 h-8 w-48 rounded"></div>
          </div>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return null; // Don't show section if no videos
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            <span style={{
              background: 'linear-gradient(135deg, #ffffff, #6b7280)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Explore Our Videos
            </span>
          </h2>
          <p className="text-gray-300 text-lg">
            Learn from our expert trading tutorials and strategies
          </p>
        </div>

        {/* Video Carousel */}
        <div className="relative overflow-hidden">
          <div 
            className="flex gap-4 overflow-x-auto scrollbar-hide justify-center"
            style={{
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {/* Show all videos */}
            {videos.map((video, index) => (
              <div
                key={video._id}
                className="flex-shrink-0 cursor-pointer group"
                onClick={() => handleVideoClick(video.url)}
              >
                <div className="relative w-80 h-48 rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10">
                  {/* Video Thumbnail */}
                  <img
                    src={getThumbnailUrl(video.url, video.thumbnail)}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-video.jpg';
                    }}
                  />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="bg-red-600 rounded-full p-4">
                      <Play className="h-6 w-6 text-white ml-1" fill="currentColor" />
                    </div>
                  </div>
                  
                  {/* Click to watch overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-400 text-xs">Click to watch</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default YouTubeVideosSection;
