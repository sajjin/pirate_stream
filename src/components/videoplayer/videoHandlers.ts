import { VideoInfo, Episode, Season } from '../../types';

const TMDB_API_KEY = 'de28a40a87b4fb9624452bb0ad02b724';

export const fetchEpisodeRuntime = async (tmdbId: number, season: string, episode: string) => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${tmdbId}/season/${season}/episode/${episode}?api_key=${TMDB_API_KEY}`
    );
    const data = await response.json();
    return data.runtime || 0;
  } catch (error) {
    console.error('Error fetching episode runtime:', error);
    return 0;
  }
};

export const fetchSeasonData = async (tmdbId: number) => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_API_KEY}`
    );
    const data = await response.json();
    
    const seasonData = [];
    
    for (let i = 1; i <= data.number_of_seasons; i++) {
      try {
        const seasonResponse = await fetch(
          `https://api.themoviedb.org/3/tv/${tmdbId}/season/${i}?api_key=${TMDB_API_KEY}`
        );
        const seasonDetails = await seasonResponse.json();
        
        if (seasonDetails.episodes) {
          const episodes = seasonDetails.episodes.map((ep: any) => ({
            Title: ep.name,
            Episode: ep.episode_number.toString(),
            imdbID: `${tmdbId}_s${i}_e${ep.episode_number}`,
            Released: ep.air_date,
            Season: i.toString()
          }));
          
          seasonData.push({
            seasonNumber: i.toString(),
            episodes: episodes,
            poster: seasonDetails.poster_path 
              ? `https://image.tmdb.org/t/p/w500${seasonDetails.poster_path}`
              : 'N/A'
          });
        }
      } catch (err) {
        console.error(`Error fetching season ${i}:`, err);
      }
    }
    
    return seasonData;
  } catch (error) {
    console.error('Error fetching TV show data:', error);
    return [];
  }
};

export const getEpisodeId = (video: VideoInfo) => {
  if (!video) return '';
  return `${video.imdbID}_s${video.season}_e${video.episode}`;
};

export const formatTimeRemaining = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};