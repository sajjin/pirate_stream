import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import EnhancedVideoPlayer from './EnhancedVideoPlayer';

interface TVShowPlayerProps {
  title: string;
  url: string;
  season: string;
  episode: string;
  episodeTitle?: string;
  onLoadPreviousEpisode: () => void;
  onLoadNextEpisode: () => void;
}

export const TVShowPlayer: React.FC<TVShowPlayerProps> = ({
  title,
  url,
  season,
  episode,
  episodeTitle,
  onLoadPreviousEpisode,
  onLoadNextEpisode,
}) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const overlayTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!(document.fullscreenElement || 
           (document as any).webkitFullscreenElement ||
           (document as any).mozFullScreenElement)
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const resetOverlayTimer = () => {
    if (overlayTimeoutRef.current) {
      clearTimeout(overlayTimeoutRef.current);
    }
    overlayTimeoutRef.current = setTimeout(() => {
      setShowOverlay(false);
    }, 3000);
  };

  const handleMouseMove = () => {
    setShowOverlay(true);
    resetOverlayTimer();
  };

  useEffect(() => {
    return () => {
      if (overlayTimeoutRef.current) {
        clearTimeout(overlayTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className="w-full bg-zinc-900 rounded-lg overflow-hidden"
      ref={playerContainerRef}
      onMouseMove={handleMouseMove}
      onTouchStart={handleMouseMove}
    >
      {!isFullscreen && (
        <>
          <div className="p-4">
            <h2 className="text-xl font-semibold">
              Now Playing: {title}
              <span className="hidden md:inline">
                {' '}- S{season}E{episode}
              </span>
            </h2>
          </div>
          
          <div className="mb-4 space-y-1 px-6">
            <div className="md:text-lg text-base font-medium">
              <span className="md:hidden">Season {season}, Episode {episode}</span>
            </div>
            <span className="md:text-lg text-base font-medium text-zinc-400">
              {episodeTitle}
            </span>
          </div>
        </>
      )}

      <div className="relative w-full">
        {/* Video Player */}
        <div className="relative w-full">
          <EnhancedVideoPlayer 
            url={url} 
            title={title}
            containerRef={playerContainerRef}
          />
        </div>

        {/* Separated Overlays */}
        {showOverlay && (
          <>
            {/* Title Bar Overlay */}
            <div 
              className="absolute top-0 left-0 right-0 pointer-events-none"
              style={{ zIndex: 2147483647 }}
            >
              <div className="bg-gradient-to-b from-black/50 to-transparent h-24" />
              <div className="absolute top-0 left-0 right-0 p-4">
              </div>
            </div>

            {/* Navigation Buttons - Separated from main overlay */}
            <div 
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ zIndex: 2147483647 }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLoadPreviousEpisode();
                }}
                className="p-3 bg-black/50 rounded-full hover:bg-black/75 transition-all transform hover:scale-110"
              >
                <ChevronLeft size={32} className="text-white" />
              </button>
            </div>

            <div 
              className="absolute right-4 top-1/2 -translate-y-1/2"
              style={{ zIndex: 2147483647 }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLoadNextEpisode();
                }}
                className="p-3 bg-black/50 rounded-full hover:bg-black/75 transition-all transform hover:scale-110"
              >
                <ChevronRight size={32} className="text-white" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};