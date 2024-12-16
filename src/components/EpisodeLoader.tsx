import { useCallback } from 'react';
import { VideoInfo, Episode, Season } from '../types';


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
        const response = await fetch(
          `https://api.themoviedb.org/3/tv/${currentVideo.tmdbId}/season/${selectedSeason}/episode/${episode.Episode}?api_key=${process.env.REACT_APP_TMDB_API_KEY}`
        );
        const data = await response.json();
        const runtime = data.runtime || 0;

        const newVideo: VideoInfo = {
          url: `https://vidsrc.xyz/embed/tv?imdb=${currentVideo.imdbID}&s=${selectedSeason}&e=${episode.Episode}&ds_lang=en`,
          title: currentVideo.title,
          type: 'series',
          imdbID: currentVideo.imdbID,
          season: selectedSeason,
          episode: episode.Episode,
          episodeTitle: episode.Title,
          timestamp: Date.now(),
          tmdbId: currentVideo.tmdbId,
          runtime: runtime,
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
  }, [currentVideo?.season, seasons, getCurrentEpisodeIndex, loadEpisode]);

  const loadPreviousEpisode = useCallback(() => {
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
  }, [currentVideo?.season, seasons, getCurrentEpisodeIndex, loadEpisode]);

  return {
    loadEpisode,
    loadNextEpisode,
    loadPreviousEpisode,
    getCurrentEpisodeIndex
  };
};
