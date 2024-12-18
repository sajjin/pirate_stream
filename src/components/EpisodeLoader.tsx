import React, { useCallback } from 'react';
import { VideoInfo, Episode, Season } from '../types';
import { 
  fetchEpisodeRuntime, 
  fetchSeasonData, 
  getEpisodeId, 
  formatTimeRemaining 
} from './videoplayer/videoHandlers';

interface EpisodeLoaderProps {
  currentVideo: VideoInfo | null;
  seasons: Season[];
  selectedSeason: string;
  onVideoChange: (video: VideoInfo) => void;
  scrollToVideo?: () => void;
}

export const useEpisodeLoader = ({
  currentVideo,
  seasons,
  selectedSeason,
  onVideoChange,
  scrollToVideo
}: EpisodeLoaderProps) => {
  const getCurrentEpisodeIndex = useCallback(() => {
    if (!currentVideo?.season || !currentVideo?.episode) return -1;
    const currentSeasonEpisodes = seasons
      .find(s => s.seasonNumber === currentVideo.season)
      ?.episodes || [];
    return currentSeasonEpisodes.findIndex(ep => ep.Episode === currentVideo.episode);
  }, [currentVideo?.season, currentVideo?.episode, seasons]);

  const loadEpisode = useCallback(async (episode: Episode, autoClick: boolean = false) => {
    if (currentVideo?.imdbID && currentVideo.tmdbId) {
      try {
        const runtime = await fetchEpisodeRuntime(
          currentVideo.tmdbId,
          selectedSeason,
          episode.Episode
        );

        const newVideo: VideoInfo = {
          url: `https://multiembed.mov/directstream.php?video_id=${currentVideo.imdbID}&s=${selectedSeason}&e=${episode.Episode}`,
          title: currentVideo.title,
          type: 'series',
          imdbID: currentVideo.imdbID,
          season: selectedSeason,
          episode: episode.Episode,
          episodeTitle: episode.Title,
          timestamp: Date.now(),
          tmdbId: currentVideo.tmdbId,
          runtime,
          poster: currentVideo.poster
        };

        onVideoChange(newVideo);
        if (scrollToVideo && !autoClick) {
          scrollToVideo();
        }
      } catch (error) {
        console.error('Error loading episode:', error);
      }
    }
  }, [currentVideo, selectedSeason, onVideoChange, scrollToVideo]);

  const loadNextEpisode = useCallback(() => {
    if (!currentVideo?.season) return;
    
    const currentSeasonEpisodes = seasons
      .find(s => s.seasonNumber === currentVideo.season)
      ?.episodes || [];
    const currentIndex = getCurrentEpisodeIndex();
    
    if (currentIndex < currentSeasonEpisodes.length - 1) {
      // Load next episode in current season
      loadEpisode(currentSeasonEpisodes[currentIndex + 1], true);
    } else {
      // Load first episode of next season
      const nextSeason = (parseInt(currentVideo.season) + 1).toString();
      const nextSeasonEpisodes = seasons
        .find(s => s.seasonNumber === nextSeason)
        ?.episodes || [];
      
      if (nextSeasonEpisodes.length > 0) {
        loadEpisode(nextSeasonEpisodes[0], true);
      }
    }
  }, [currentVideo?.season, seasons, getCurrentEpisodeIndex, loadEpisode]);

  const loadPreviousEpisode = useCallback(() => {
    if (!currentVideo?.season) return;
    
    const currentSeasonEpisodes = seasons
      .find(s => s.seasonNumber === currentVideo.season)
      ?.episodes || [];
    const currentIndex = getCurrentEpisodeIndex();
    
    if (currentIndex > 0) {
      // Load previous episode in current season
      loadEpisode(currentSeasonEpisodes[currentIndex - 1]);
    } else if (parseInt(currentVideo.season) > 1) {
      // Load last episode of previous season
      const previousSeason = (parseInt(currentVideo.season) - 1).toString();
      const previousSeasonEpisodes = seasons
        .find(s => s.seasonNumber === previousSeason)
        ?.episodes || [];
      
      if (previousSeasonEpisodes.length > 0) {
        loadEpisode(previousSeasonEpisodes[previousSeasonEpisodes.length - 1]);
      }
    }
  }, [currentVideo?.season, seasons, getCurrentEpisodeIndex, loadEpisode]);

  const getEpisodeDetails = useCallback((episodeId: string) => {
    if (!currentVideo) return null;
    const [, seasonNum, episodeNum] = episodeId.split('_');
    const season = seasons.find(s => s.seasonNumber === seasonNum.replace('s', ''));
    const episode = season?.episodes.find(e => e.Episode === episodeNum.replace('e', ''));
    return episode || null;
  }, [currentVideo, seasons]);

  return {
    loadEpisode,
    loadNextEpisode,
    loadPreviousEpisode,
    getCurrentEpisodeIndex,
    getEpisodeDetails,
    formatTimeRemaining,
    getEpisodeId: (video: VideoInfo) => getEpisodeId(video)
  };
};