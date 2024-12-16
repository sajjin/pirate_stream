import React, { useEffect, useRef } from 'react';
import { VideoInfo } from '../types';
import { getEpisodeId } from './videoplayer/videoHandlers';

interface TimerControllerProps {
    currentVideo: VideoInfo | null;
    episodeRuntime: number;
    isTimerActive: boolean;
    autoplayEnabled: boolean;
    episodeTimers: Record<string, number>;
    onTimerUpdate: React.Dispatch<React.SetStateAction<number | null>>;
    onTimerStateChange: (active: boolean) => void;
    onShowNextEpisodePrompt: (show: boolean) => void;
    onCancelAutoplayTimerChange: React.Dispatch<React.SetStateAction<number | null>>;
    onEpisodeTimersChange: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    onLoadNextEpisode: () => void;
  }  

  export const TimerController: React.FC<TimerControllerProps> = ({
    currentVideo,
    episodeRuntime,
    isTimerActive,
    autoplayEnabled,
    episodeTimers,
    onTimerUpdate,
    onTimerStateChange,
    onShowNextEpisodePrompt,
    onCancelAutoplayTimerChange,
    onEpisodeTimersChange,
    onLoadNextEpisode,
  }) => {
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (!isTimerActive && episodeRuntime > 0 && currentVideo) {
      const episodeId = getEpisodeId(currentVideo);
      const savedTime = episodeTimers[episodeId] || episodeRuntime * 60;
      
      onTimerUpdate(savedTime);
      onTimerStateChange(true);
      
      timerRef.current = setInterval(() => {
        onTimerUpdate(prev => {
          if (prev === null || prev <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            onTimerStateChange(false);
            
            const updatedTimers = { ...episodeTimers };
            delete updatedTimers[episodeId];
            onEpisodeTimersChange(updatedTimers);

            if (autoplayEnabled) {
              onShowNextEpisodePrompt(true);
              onCancelAutoplayTimerChange(15);
              
              const cancelInterval = setInterval(() => {
                onCancelAutoplayTimerChange(prevTimer => {
                  if (prevTimer === null || prevTimer <= 0) {
                    clearInterval(cancelInterval);
                    onLoadNextEpisode();
                    onShowNextEpisodePrompt(false);
                    return null;
                  }
                  return prevTimer - 1;
                });
              }, 1000);
            }

            return 0;
          }

          const newTime = prev - 1;
          onEpisodeTimersChange((current: Record<string, number>) => ({
            ...current,
            [episodeId]: newTime
          }));

          if (newTime === 30 && autoplayEnabled) {
            onShowNextEpisodePrompt(true);
            onCancelAutoplayTimerChange(15);
            
            const cancelInterval = setInterval(() => {
              onCancelAutoplayTimerChange(prevTimer => {
                if (prevTimer === null || prevTimer <= 0) {
                  clearInterval(cancelInterval);
                  onLoadNextEpisode();
                  onShowNextEpisodePrompt(false);
                  return null;
                }
                return prevTimer - 1;
              });
            }, 1000);
          }
          
          return newTime;
        });
      }, 1000);
    }
  };

  const cancelInterval = setInterval(() => {
    onCancelAutoplayTimerChange((prevTimer) => {
      if (prevTimer === null || prevTimer <= 0) {
        clearInterval(cancelInterval);
        onLoadNextEpisode();
        onShowNextEpisodePrompt(false);
        return null;
      }
      return prevTimer - 1;
    });
  }, 1000);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (autoplayRef.current) {
        clearTimeout(autoplayRef.current);
      }
    };
  }, []);

  return null; // This is a controller component, no UI needed
};