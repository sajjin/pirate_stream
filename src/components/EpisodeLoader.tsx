import React from 'react';
import { VideoInfo, Episode, Season } from './types';
import { fetchEpisodeRuntime } from './videoplayer/videoHandlers';


interface EpisodeLoaderProps {
    currentVideo: VideoInfo | null;
    seasons: Season[];
    selectedSeason: string;
    onVideoChange: (video: VideoInfo) => void;
    onLoadEpisode: (episode: Episode, autoClick?: boolean) => Promise<void>;
  }  

export const EpisodeLoader: React.FC<EpisodeLoaderProps> = ({
  currentVideo,
  seasons,
  selectedSeason,
  onVideoChange,
}) => {
  const getCurrentEpisodeIndex = () => {
    if (!currentVideo?.season || !currentVideo?.episode) return -1;
    const currentSeasonEpisodes = seasons
      .find(s => s.seasonNumber === currentVideo.season)
      ?.episodes || [];
    return currentSeasonEpisodes.findIndex(ep => ep.Episode === currentVideo.episode);
  };

  const loadNextEpisode = () => {
    if (!currentVideo?.season) return;
    
    const currentSeasonEpisodes = seasons
      .find(s => s.seasonNumber === currentVideo.season)
      ?.episodes || [];
    const currentIndex = getCurrentEpisodeIndex();
    
    if (currentIndex < currentSeasonEpisodes.length - 1) {
      loadEpisode(currentSeasonEpisodes[currentIndex + 1], true);
    } else {
      const nextSeason = (parseInt(currentVideo.season) + 1).toString();
      const nextSeasonEpisodes = seasons
        .find(s => s.seasonNumber === nextSeason)
        ?.episodes || [];
      
      if (nextSeasonEpisodes.length > 0) {
        loadEpisode(nextSeasonEpisodes[0], true);
      }
    }
  };

  const loadPreviousEpisode = () => {
    if (!currentVideo?.season) return;
    
    const currentSeasonEpisodes = seasons
      .find(s => s.seasonNumber === currentVideo.season)
      ?.episodes || [];
    const currentIndex = getCurrentEpisodeIndex();
    
    if (currentIndex > 0) {
      loadEpisode(currentSeasonEpisodes[currentIndex - 1]);
    } else if (parseInt(currentVideo.season) > 1) {
      const previousSeason = (parseInt(currentVideo.season) - 1).toString();
      const previousSeasonEpisodes = seasons
        .find(s => s.seasonNumber === previousSeason)
        ?.episodes || [];
      
      if (previousSeasonEpisodes.length > 0) {
        loadEpisode(previousSeasonEpisodes[previousSeasonEpisodes.length - 1]);
      }
    }
  };

  const loadEpisode = async (episode: Episode, autoClick: boolean = false) => {
    if (currentVideo?.imdbID && currentVideo.tmdbId) {
  
      try {
        const runtime = await fetchEpisodeRuntime(
          currentVideo.tmdbId,
          selectedSeason,
          episode.Episode
        );
        
        const newVideo: VideoInfo = {
          url: `https://vidsrc.xyz/embed/tv?imdb=${currentVideo.imdbID}&s=${selectedSeason}&e=${episode.Episode}`,
          title: currentVideo.title,
          type: 'series',
          imdbID: currentVideo.imdbID,
          season: selectedSeason,
          episode: episode.Episode,
          episodeTitle: episode.Title,
          timestamp: Date.now(),
          tmdbId: currentVideo.tmdbId,
          runtime: runtime
        };
  
        onVideoChange(newVideo);
      } catch (error) {
        console.error('Error loading episode:', error);
      }
    }
  };

  return null; // This is a controller component, no UI needed
};