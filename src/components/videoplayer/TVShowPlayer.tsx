import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Timer, X } from 'lucide-react';

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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };


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
        <span className="md:text-lg text-base font-medium text-zinc-400">{episodeTitle}</span>
      </div>

      <div 
        className="relative w-full pt-[56.25%] mb-8 group"
        onMouseEnter={() => setShowOverlay(true)}
        onMouseLeave={() => setShowOverlay(false)}
        onTouchStart={() => setShowOverlay(true)}
        onTouchEnd={() => setTimeout(() => setShowOverlay(false), 3000)}
      >

        <iframe
          ref={iframeRef}
          src={url}
          className="absolute top-0 left-0 w-full h-full border-0"
          allowFullScreen
        />

        {/* Navigation overlay buttons */}
        {showOverlay && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onLoadPreviousEpisode();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-all transform hover:scale-110"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
            >
              <ChevronLeft size={32} />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onLoadNextEpisode();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-all transform hover:scale-110"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};