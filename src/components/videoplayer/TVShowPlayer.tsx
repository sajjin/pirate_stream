import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import EnhancedVideoPlayer from './EnhancedVideoPlayer';

interface TVShowPlayerProps {
  title: string;
  url: string;
  season: string;
  episode: string;
  episodeTitle?: string;
  onLoadPreviousEpisode: () => void;
  onLoadNextEpisode: () => void;
  currentSource: number;
}

export const TVShowPlayer: React.FC<TVShowPlayerProps> = ({
  title,
  url,
  season,
  episode,
  episodeTitle,
  onLoadPreviousEpisode,
  onLoadNextEpisode,
  currentSource,
}) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const overlayTimeoutRef = useRef<NodeJS.Timeout>();
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const isMouseMoving = useRef(false);

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
      if (!isMouseMoving.current) {
        setShowOverlay(false);
      }
    }, 3000);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    
    // Check if mouse has actually moved from its last position
    const hasMoved = 
      Math.abs(clientX - lastMousePosRef.current.x) > 0 || 
      Math.abs(clientY - lastMousePosRef.current.y) > 0;

    if (hasMoved) {
      isMouseMoving.current = true;
      setShowOverlay(true);
      resetOverlayTimer();

      // Update last known position
      lastMousePosRef.current = { x: clientX, y: clientY };

      // Reset the moving flag after a short delay
      setTimeout(() => {
        isMouseMoving.current = false;
      }, 100);
    }
  };

  const handleTouchStart = () => {
    setShowOverlay(true);
    resetOverlayTimer();
  };

  const handleFullscreen = async () => {
    if (!iframeContainerRef.current) return;

    try {
      if (!isFullscreen) {
        if (iframeContainerRef.current.requestFullscreen) {
          await iframeContainerRef.current.requestFullscreen();
        } else if ((iframeContainerRef.current as any).webkitRequestFullscreen) {
          await (iframeContainerRef.current as any).webkitRequestFullscreen();
        } else if ((iframeContainerRef.current as any).mozRequestFullScreen) {
          await (iframeContainerRef.current as any).mozRequestFullScreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        }
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
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

      <div 
        className="relative w-full" 
        ref={iframeContainerRef}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
      >
        {/* Video Player */}
        <div className="relative w-full">
          <EnhancedVideoPlayer 
            url={url} 
            title={title}
            containerRef={playerContainerRef}
          />
        </div>

        {/* Overlays */}
        {showOverlay && (
          <>
            {/* Navigation Buttons */}
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

            {/* Fullscreen Button - Only show for Source 1 */}
            {currentSource === 0 && (
              <div 
                className="absolute bottom-4 right-4"
                style={{ zIndex: 2147483647 }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFullscreen();
                  }}
                  className="p-3 bg-black/50 rounded-full hover:bg-black/75 transition-all transform hover:scale-110"
                >
                  <Maximize2 size={24} className="text-white" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};