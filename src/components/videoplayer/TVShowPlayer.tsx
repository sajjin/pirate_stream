import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { VideoPlayer } from './VideoPlayers';

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
}) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const overlayTimeoutRef = useRef<NodeJS.Timeout>();
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const isMouseMoving = useRef(false);

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
    const hasMoved = 
      Math.abs(clientX - lastMousePosRef.current.x) > 0 || 
      Math.abs(clientY - lastMousePosRef.current.y) > 0;

    if (hasMoved) {
      isMouseMoving.current = true;
      setShowOverlay(true);
      resetOverlayTimer();
      lastMousePosRef.current = { x: clientX, y: clientY };
      setTimeout(() => {
        isMouseMoving.current = false;
      }, 100);
    }
  };

  const handleTouchStart = () => {
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
    <div className="w-full bg-zinc-900 rounded-lg overflow-hidden">
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

      <div 
        className="relative w-full"
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
      >
        <VideoPlayer url={url} title={title} />

        {showOverlay && (
          <>
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