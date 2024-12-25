import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { VideoPlayer } from './VideoPlayers';
import { videoProgressService } from '../../services/videoProgressService';
import { VideoInfo, VideoProgress } from '../../types';
import { VIDEO_SOURCES } from '../VideoSourceSelector';

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

const TVShowPlayer: React.FC<TVShowPlayerProps> = ({
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
  currentSource,
}) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [startTime] = useState(Date.now());
  const [overlayTimer, setOverlayTimer] = useState<NodeJS.Timeout | null>(null);

  // Save initial progress when episode starts
  useEffect(() => {
    const saveInitialProgress = async () => {
      const progress: VideoProgress = {
        currentTime: 0,
        duration: 3600, // Default duration of 1 hour in seconds
        completed: false,
        lastWatched: Date.now()
      };

      const videoInfo: VideoInfo = {
        imdbID,
        title,
        type: 'series' as const,
        season,
        episode,
        episodeTitle,
        poster,
        tmdbId,
        timestamp: Date.now(),
        progress
      };

      try {
        await videoProgressService.saveProgress(videoInfo, 0, 3600);
      } catch (error) {
        console.error('Error saving initial progress:', error);
      }
    };

    saveInitialProgress();
  }, [imdbID, season, episode, title, episodeTitle, poster, tmdbId]);

  // Handle episode navigation
  const handleEpisodeChange = async (direction: 'next' | 'prev') => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // Calculate watch time in seconds
      const watchTime = Math.floor((Date.now() - startTime) / 1000);
      const isShortView = watchTime < 30; // Less than 30 seconds viewed
      
      // Only mark as completed if they watched for more than 30 seconds
      if (!isShortView) {
        const progress: VideoProgress = {
          currentTime: 3600, // Mark as finished
          duration: 3600,
          completed: true,
          lastWatched: Date.now()
        };

        const videoInfo: VideoInfo = {
          imdbID,
          title,
          type: 'series' as const,
          season,
          episode,
          episodeTitle,
          poster,
          tmdbId,
          timestamp: Date.now(),
          progress
        };

        await videoProgressService.saveProgress(videoInfo, 3600, 3600);
      }

      // Navigate to next/previous episode
      if (direction === 'next') {
        onLoadNextEpisode();
      } else {
        onLoadPreviousEpisode();
      }
    } catch (error) {
      console.error('Error handling episode change:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMouseMove = () => {
    setShowOverlay(true);
    
    if (overlayTimer) {
      clearTimeout(overlayTimer);
    }
    
    const timer = setTimeout(() => {
      setShowOverlay(false);
    }, 3000);
    
    setOverlayTimer(timer);
  };

  // Save progress on unmount if they watched for a meaningful duration
  useEffect(() => {
    return () => {
      if (overlayTimer) {
        clearTimeout(overlayTimer);
      }

      const cleanup = async () => {
        const watchTime = Math.floor((Date.now() - startTime) / 1000);
        if (watchTime >= 30) { // Only save if they watched for at least 30 seconds
          const progress: VideoProgress = {
            currentTime: 3600,
            duration: 3600,
            completed: true,
            lastWatched: Date.now()
          };

          const videoInfo: VideoInfo = {
            imdbID,
            title,
            type: 'series' as const,
            season,
            episode,
            episodeTitle,
            poster,
            tmdbId,
            timestamp: Date.now(),
            progress
          };

          try {
            await videoProgressService.saveProgress(videoInfo, 3600, 3600);
          } catch (error) {
            console.error('Error saving final progress:', error);
          }
        }
      };

      cleanup();
    };
  }, [imdbID, season, episode, title, episodeTitle, poster, tmdbId, startTime]);

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
          <div 
            className="absolute inset-0 flex items-center justify-between px-4"
            style={{ pointerEvents: 'none' }}
          >
            <button
              onClick={() => handleEpisodeChange('prev')}
              disabled={isLoading}
              className="p-3 bg-black bg-opacity-50 rounded-full transition-all transform hover:scale-110 hover:bg-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ pointerEvents: 'auto' }}
              aria-label="Previous episode"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>

            <button
              onClick={() => handleEpisodeChange('next')}
              disabled={isLoading}
              className="p-3 bg-black bg-opacity-50 rounded-full transition-all transform hover:scale-110 hover:bg-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ pointerEvents: 'auto' }}
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