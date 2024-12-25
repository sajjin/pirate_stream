import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { VideoPlayer } from './VideoPlayers';
import { videoProgressService } from '../../services/videoProgressService';
import { VideoInfo, VideoProgress } from '../../types';

interface TVShowPlayerProps {
  title: string;
  url: string;
  season: string;
  episode: string;
  episodeTitle?: string;
  imdbID: string;
  tmdbId?: number;
  poster?: string;
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
  imdbID,
  tmdbId,
  poster,
  onLoadPreviousEpisode,
  onLoadNextEpisode,
}) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Save episode progress when component mounts (starting episode)
  // and when it unmounts (finishing episode)
  useEffect(() => {
    const markEpisodeStarted = async () => {
      const progress: VideoProgress = {
        currentTime: 0,
        duration: 0, // We don't have actual duration, using 0 as starting point
        completed: false,
        lastWatched: Date.now()
      };

      const videoInfo: VideoInfo = {
        imdbID,
        title,
        type: 'series',
        season,
        episode,
        episodeTitle,
        poster,
        tmdbId,
        timestamp: Date.now(),
        progress
      };

      try {
        await videoProgressService.saveProgress(videoInfo, 0, 0);
      } catch (error) {
        console.error('Error saving initial progress:', error);
      }
    };

    markEpisodeStarted();

    // When component unmounts, mark episode as completed
    return () => {
      const markEpisodeCompleted = async () => {
        const progress: VideoProgress = {
          currentTime: 100, // Using 100 as completed
          duration: 100,
          completed: true,
          lastWatched: Date.now()
        };

        const videoInfo: VideoInfo = {
          imdbID,
          title,
          type: 'series',
          season,
          episode,
          episodeTitle,
          poster,
          tmdbId,
          timestamp: Date.now(),
          progress
        };

        try {
          await videoProgressService.saveProgress(videoInfo, 100, 100);
        } catch (error) {
          console.error('Error saving completion progress:', error);
        }
      };

      markEpisodeCompleted();
    };
  }, [imdbID, season, episode, title, episodeTitle, poster, tmdbId]);

  const handleEpisodeChange = async (direction: 'next' | 'prev') => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // Mark current episode as completed before changing
      const progress: VideoProgress = {
        currentTime: 100,
        duration: 100,
        completed: true,
        lastWatched: Date.now()
      };

      const videoInfo: VideoInfo = {
        imdbID,
        title,
        type: 'series',
        season,
        episode,
        episodeTitle,
        poster,
        tmdbId,
        timestamp: Date.now(),
        progress
      };

      await videoProgressService.saveProgress(videoInfo, 100, 100);
      
      if (direction === 'next') {
        await onLoadNextEpisode();
      } else {
        await onLoadPreviousEpisode();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show/hide overlay on mouse movement
  const handleMouseMove = () => {
    setShowOverlay(true);
    // Hide overlay after 3 seconds of no movement
    const timer = setTimeout(() => setShowOverlay(false), 3000);
    return () => clearTimeout(timer);
  };

  return (
    <div className="w-full bg-zinc-900 rounded-lg overflow-hidden">
      <div className="p-4">
        <h2 className="text-xl font-semibold truncate">
          {title}
          <span className="hidden md:inline text-zinc-400">
            {' '}- Season {season}, Episode {episode}
          </span>
        </h2>
      </div>
      
      <div className="mb-4 space-y-1 px-6">
        <div className="md:text-lg text-base font-medium">
          <span className="md:hidden">Season {season}, Episode {episode}</span>
        </div>
        {episodeTitle && (
          <span className="md:text-lg text-base font-medium text-zinc-400 line-clamp-2">
            {episodeTitle}
          </span>
        )}
      </div>

      <div 
        className="relative w-full"
        onMouseMove={handleMouseMove}
        onTouchStart={() => setShowOverlay(prev => !prev)}
      >
        <VideoPlayer url={url} title={title} />

        {showOverlay && (
          <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
            <button
              onClick={() => handleEpisodeChange('prev')}
              disabled={isLoading}
              className="p-3 bg-black bg-opacity-50 rounded-full transition-all transform hover:scale-110 hover:bg-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
              aria-label="Previous episode"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>

            <button
              onClick={() => handleEpisodeChange('next')}
              disabled={isLoading}
              className="p-3 bg-black bg-opacity-50 rounded-full transition-all transform hover:scale-110 hover:bg-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
              aria-label="Next episode"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TVShowPlayer;