import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { VideoPlayer } from './VideoPlayers';
import { videoProgressService } from '../../services/videoProgressService';
import { VideoInfo, VideoProgress } from '../../types';

interface TVShowPlayerProps extends Omit<VideoInfo, 'type' | 'progress'> {
  url: string;
  onLoadPreviousEpisode: () => void;
  onLoadNextEpisode: () => void;
  currentSource: number;
  onProgressUpdate?: (progress: VideoProgress) => void;
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
  onProgressUpdate,
}) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<VideoProgress | null>(null);
  const overlayTimeoutRef = useRef<NodeJS.Timeout>();
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMouseMoving = useRef(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const progressSaveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const loadSavedProgress = async () => {
      try {
        const videoInfo: VideoInfo = {
          imdbID,
          title,
          type: 'series',
          season,
          episode,
          episodeTitle,
          poster,
          tmdbId,
          timestamp: Date.now()
        };
        
        const savedProgress = await videoProgressService.getProgress(videoInfo);
        if (savedProgress) {
          setCurrentProgress(savedProgress);
          if (!savedProgress.completed && savedProgress.currentTime < savedProgress.duration * 0.9) {
            // Seek to saved position if video ref is available
            if (videoRef.current) {
              if (videoRef.current instanceof HTMLVideoElement) {
                videoRef.current.currentTime = savedProgress.currentTime;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading saved progress:', error);
      }
    };

    loadSavedProgress();
  }, [imdbID, season, episode, title]);

  const saveWatchProgress = async (currentTime: number, duration: number) => {
    try {
      const progress: VideoProgress = {
        currentTime,
        duration,
        completed: (currentTime / duration) > 0.9,
        lastWatched: Date.now()
      };

      setCurrentProgress(progress);

      const videoInfo: VideoInfo = {
        imdbID,
        title,
        type: 'series',
        season,
        episode,
        episodeTitle,
        poster,
        tmdbId,
        runtime: duration,
        timestamp: Date.now(),
        progress
      };
      
      await videoProgressService.saveProgress(videoInfo, currentTime, duration);
      
      if (onProgressUpdate) {
        onProgressUpdate(progress);
      }
    } catch (error) {
      console.error('Error saving watch progress:', error);
    }
  };

  const handleEpisodeChange = async (direction: 'next' | 'prev') => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // Mark current episode as completed if we have duration info
      if (currentProgress?.duration) {
        await saveWatchProgress(currentProgress.duration, currentProgress.duration);
      }
      
      if (direction === 'next') {
        await onLoadNextEpisode();
      } else {
        await onLoadPreviousEpisode();
      }
      
      // Reset progress for new episode
      if (currentProgress?.duration) {
        await saveWatchProgress(0, currentProgress.duration);
      }
    } finally {
      setIsLoading(false);
    }
  };

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
      Math.abs(clientX - lastMousePosRef.current.x) > 5 || 
      Math.abs(clientY - lastMousePosRef.current.y) > 5;

    if (hasMoved) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      isMouseMoving.current = true;
      setShowOverlay(true);
      resetOverlayTimer();
      lastMousePosRef.current = { x: clientX, y: clientY };

      debounceTimeoutRef.current = setTimeout(() => {
        isMouseMoving.current = false;
      }, 150);
    }
  };

  const handleTouchStart = () => {
    setShowOverlay(prev => !prev);
    resetOverlayTimer();
  };

  useEffect(() => {
    return () => {
      if (overlayTimeoutRef.current) {
        clearTimeout(overlayTimeoutRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (progressSaveTimeoutRef.current) {
        clearTimeout(progressSaveTimeoutRef.current);
      }
    };
  }, []);

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
        className="relative w-full aspect-video"
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
      >
        <VideoPlayer 
          url={url} 
          title={title} 
          onTimeUpdate={(currentTime: number) => {
            if (currentProgress) {
              setCurrentProgress({
                ...currentProgress,
                currentTime,
                lastWatched: Date.now()
              });

              // Debounce progress updates to avoid too many DB writes
              if (progressSaveTimeoutRef.current) {
                clearTimeout(progressSaveTimeoutRef.current);
              }
              
              progressSaveTimeoutRef.current = setTimeout(() => {
                if (currentProgress.duration) {
                  saveWatchProgress(currentTime, currentProgress.duration);
                }
              }, 1000);
            }
          }}
          onDurationChange={(duration: number) => {
            if (!currentProgress || currentProgress.duration !== duration) {
              setCurrentProgress(prev => ({
                currentTime: prev?.currentTime || 0,
                duration,
                completed: false,
                lastWatched: Date.now()
              }));
            }
          }}
        />

        {showOverlay && (
          <div className="absolute inset-0 flex items-center justify-between px-4">
            <button
              onClick={() => handleEpisodeChange('prev')}
              disabled={isLoading}
              className="p-3 bg-black bg-opacity-50 rounded-full transition-all transform hover:scale-110 hover:bg-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous episode"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>

            <button
              onClick={() => handleEpisodeChange('next')}
              disabled={isLoading}
              className="p-3 bg-black bg-opacity-50 rounded-full transition-all transform hover:scale-110 hover:bg-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
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