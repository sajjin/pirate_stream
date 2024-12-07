import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Timer, X } from 'lucide-react';
import Footer from './footer';
import { MoviePlayer } from './videoplayer/MoviePlayer';
import { TVShowPlayer } from './videoplayer/TVShowPlayer';
import { EpisodesGrid } from './EpisodesGrid';


interface EpisodeDetails {
  runtime: number;
}

interface SearchResult {
  imdbID: string;
  Title: string;
  Year: string;
  Type: string;
  Poster: string;
  tmdbId?: number;
}

interface TMDBSearchResult {
  id: number;
  name: string;
  first_air_date: string;
  poster_path: string;
  media_type?: string;
}

interface VideoInfo {
  url: string;
  title: string;
  type: string;
  imdbID?: string;
  season?: string;
  episode?: string;
  episodeTitle?: string;
  timestamp?: number;
  tmdbId?: number;
  runtime?: number;
}

interface Episode {
  Title: string;
  Episode: string;
  imdbID: string;
  Released: string;
  Season: string;
}

interface Season {
  seasonNumber: string;
  episodes: Episode[];
  poster: string;
}

interface StoredState {
  currentVideo: VideoInfo | null;
  watchHistory: VideoInfo[];
  searchResults: SearchResult[];
  searchQuery: string;
  seasons: Season[];
  selectedSeason: string;
  castEnabled: boolean;
  autoplayEnabled: boolean;
}

function Search() {
  // Load initial state from localStorage
  const loadStoredState = (): StoredState => {
    const storedState = localStorage.getItem('videoAppState');
    if (storedState) {
      return JSON.parse(storedState);
    }
    return {
      currentVideo: null,
      watchHistory: [],
      searchResults: [],
      searchQuery: '',
      seasons: [],
      selectedSeason: '',
      castEnabled: false,
      autoplayEnabled: false
    };
  };

  const initialState = loadStoredState();

  const [searchQuery, setSearchQuery] = useState(initialState.searchQuery);
  const [searchResults, setSearchResults] = useState<SearchResult[]>(initialState.searchResults);
  const [currentVideo, setCurrentVideo] = useState<VideoInfo | null>(initialState.currentVideo);
  const [error, setError] = useState('');
  const [castEnabled, setCastEnabled] = useState(initialState.castEnabled);
  const [seasons, setSeasons] = useState<Season[]>(initialState.seasons);
  const [selectedSeason, setSelectedSeason] = useState(initialState.selectedSeason);
  const [loading, setLoading] = useState(false);
  const [watchHistory, setWatchHistory] = useState<VideoInfo[]>(initialState.watchHistory);
  const [showHistory, setShowHistory] = useState(false);
  const [autoplayEnabled, setAutoplayEnabled] = useState(initialState.autoplayEnabled);
  const [episodeRuntime, setEpisodeRuntime] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [episodeTimers, setEpisodeTimers] = useState<Record<string, number>>({});


  const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
  const TMDB_API_KEY = 'de28a40a87b4fb9624452bb0ad02b724';
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);




   // Scroll function
   const scrollToVideo = () => {
    if (videoSectionRef.current) {
      videoSectionRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const searchIMDb = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a movie or show name.');
      return;
    }
  
    setLoading(true);
    try {
      // Search both movies and TV shows
      const [tvResponse, movieResponse] = await Promise.all([
        fetch(
          `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}`
        ),
        fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}`
        )
      ]);
  
      const tvData = await tvResponse.json();
      const movieData = await movieResponse.json();
  
      // Get external IDs (including IMDB IDs) for all TV shows
      const tvShowsWithImdbIds = await Promise.all(
        tvData.results?.map(async (show: TMDBSearchResult) => {
          try {
            const externalIdsResponse = await fetch(
              `https://api.themoviedb.org/3/tv/${show.id}/external_ids?api_key=${TMDB_API_KEY}`
            );
            const externalIds = await externalIdsResponse.json();
            return {
              ...show,
              imdb_id: externalIds.imdb_id
            };
          } catch (error) {
            console.error(`Error fetching external IDs for TV show ${show.id}:`, error);
            return { ...show, imdb_id: null };
          }
        }) || []
      );
  
      // Get external IDs for all movies
      const moviesWithImdbIds = await Promise.all(
        movieData.results?.map(async (movie: any) => {
          try {
            const externalIdsResponse = await fetch(
              `https://api.themoviedb.org/3/movie/${movie.id}/external_ids?api_key=${TMDB_API_KEY}`
            );
            const externalIds = await externalIdsResponse.json();
            return {
              ...movie,
              imdb_id: externalIds.imdb_id
            };
          } catch (error) {
            console.error(`Error fetching external IDs for movie ${movie.id}:`, error);
            return { ...movie, imdb_id: null };
          }
        }) || []
      );
  
      // Format TV shows with IMDB IDs
      const tvResults = tvShowsWithImdbIds
        .filter(show => show.imdb_id) // Only include shows with valid IMDB IDs
        .map(show => ({
          imdbID: show.imdb_id,
          Title: show.name,
          Year: show.first_air_date?.split('-')[0] || 'N/A',
          Type: 'series',
          Poster: show.poster_path ? `${TMDB_IMAGE_BASE}${show.poster_path}` : 'N/A',
          tmdbId: show.id
        }));
  
      // Format movies with IMDB IDs
      const movieResults = moviesWithImdbIds
        .filter(movie => movie.imdb_id) // Only include movies with valid IMDB IDs
        .map(movie => ({
          imdbID: movie.imdb_id,
          Title: movie.title,
          Year: movie.release_date?.split('-')[0] || 'N/A',
          Type: 'movie',
          Poster: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : 'N/A',
          tmdbId: movie.id
        }));
  
      // Combine and sort results
      const allResults = [...tvResults, ...movieResults];
  
      if (allResults.length > 0) {
        setSearchResults(allResults);
        setError('');
        setCurrentVideo(null);
        setSeasons([]);
        setSelectedSeason('');
      } else {
        setSearchResults([]);
        setError('No results found.');
      }
    } catch (err) {
      setError('Error fetching data.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

    // Function to fetch episode runtime
    const fetchEpisodeRuntime = async (tmdbId: number, season: string, episode: string) => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/tv/${tmdbId}/season/${season}/episode/${episode}?api_key=${TMDB_API_KEY}`
        );
        const data = await response.json();
        return data.runtime || 0; // Return 0 if runtime is not available
      } catch (error) {
        console.error('Error fetching episode runtime:', error);
        return 0;
      }
    };

  // Function to format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const cancelAutoplay = () => {
    if (autoplayRef.current) {
      clearTimeout(autoplayRef.current);
      autoplayRef.current = null;
    }
  };


  // Function to generate unique episode ID
  const getEpisodeId = (video: VideoInfo) => {
    if (!video) return '';
    return `${video.imdbID}_s${video.season}_e${video.episode}`;
  };

  // Load episode timers from localStorage
  useEffect(() => {
    const storedTimers = localStorage.getItem('episodeTimers');
    if (storedTimers) {
      setEpisodeTimers(JSON.parse(storedTimers));
    }
  }, []);

  // Save timers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('episodeTimers', JSON.stringify(episodeTimers));
  }, [episodeTimers]);

  // Modified timer start function

  // Cleanup effect for timers
useEffect(() => {
  return () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (autoplayRef.current) {
      clearTimeout(autoplayRef.current);
    }
  };
}, [currentVideo]);

  const fetchSeasonData = async (tmdbId: number, totalSeasons: number) => {
    const seasonData: Season[] = [];
    
    for (let i = 1; i <= totalSeasons; i++) {
      try {
        // Fetch season details from TMDB
        const seasonResponse = await fetch(
          `https://api.themoviedb.org/3/tv/${tmdbId}/season/${i}?api_key=${TMDB_API_KEY}`
        );
        const seasonDetails = await seasonResponse.json();
        
        if (seasonDetails.episodes) {
          const episodes = seasonDetails.episodes.map((ep: any) => ({
            Title: ep.name,
            Episode: ep.episode_number.toString(),
            imdbID: `${tmdbId}_s${i}_e${ep.episode_number}`, // Create unique ID
            Released: ep.air_date,
            Season: i.toString()
          }));
          
          seasonData.push({
            seasonNumber: i.toString(),
            episodes: episodes,
            poster: seasonDetails.poster_path 
              ? `${TMDB_IMAGE_BASE}${seasonDetails.poster_path}`
              : 'N/A'
          });
        }
      } catch (err) {
        console.error(`Error fetching season ${i}:`, err);
      }
    }
    
    return seasonData;
  };

  useEffect(() => {
    const storedState = localStorage.getItem('videoAppState');
    if (!storedState) return;

    const state = JSON.parse(storedState);
    if (state.currentVideo && state.currentVideo.type === 'series' && state.currentVideo.imdbID) {
      // Update current video state
      setCurrentVideo(state.currentVideo);

      // Set episode runtime if available
      if (state.currentVideo.runtime) {
        setEpisodeRuntime(state.currentVideo.runtime);
      } else if (state.currentVideo.tmdbId) {
        // Fetch runtime if not available
        fetchEpisodeRuntime(
          state.currentVideo.tmdbId,
          state.currentVideo.season || '1',
          state.currentVideo.episode || '1'
        ).then(runtime => {
          if (runtime > 0) {
            setEpisodeRuntime(runtime);
          }
        });
      }
      
      // Check if we already have seasons data
      if (state.seasons && state.seasons.length > 0) {
        setSeasons(state.seasons);
        setSelectedSeason(state.selectedSeason || '1');
      } else {
        // Need to fetch seasons data
        const fetchTVShowData = async () => {
          try {
            // First, get the TMDB ID for the show
            const externalIdsResponse = await fetch(
              `https://api.themoviedb.org/3/find/${state.currentVideo.imdbID}?api_key=${TMDB_API_KEY}&external_source=imdb_id`
            );
            const externalIdsData = await externalIdsResponse.json();
            const tvShow = externalIdsData.tv_results[0];
            
            if (tvShow) {
              const tmdbId = tvShow.id;
              // Get show details to get number of seasons
              const response = await fetch(
                `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_API_KEY}`
              );
              const data = await response.json();
              
              if (data.number_of_seasons) {
                const seasonData = await fetchSeasonData(tmdbId, data.number_of_seasons);
                setSeasons(seasonData);
                setSelectedSeason('1');
                
                // Update localStorage with the new seasons data
                const updatedState = JSON.parse(localStorage.getItem('videoAppState') || '{}');
                updatedState.seasons = seasonData;
                updatedState.selectedSeason = '1';
                localStorage.setItem('videoAppState', JSON.stringify(updatedState));
              }
            }
          } catch (error) {
            console.error('Error fetching TV show data:', error);
            setError('Error loading TV show data.');
          }
        };

        fetchTVShowData();
      }
    } else if (state.currentVideo) {
      // For movies or direct video links
      setCurrentVideo(state.currentVideo);
    }

    // Set other states from storage
    if (state.watchHistory) setWatchHistory(state.watchHistory);
    if (state.searchResults) setSearchResults(state.searchResults);
    if (state.searchQuery) setSearchQuery(state.searchQuery);
    if (state.castEnabled !== undefined) setCastEnabled(state.castEnabled);
  }, []);
  


  const loadTVShow = async (tmdbId: number, title: string, imdbId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_API_KEY}`
      );
      const data = await response.json();
      
      if (data.number_of_seasons) {
        const seasonData = await fetchSeasonData(tmdbId, data.number_of_seasons);
        setSeasons(seasonData);
        setSelectedSeason('1');
        setCurrentVideo({
          url: '',
          title,
          type: 'series',
          imdbID: imdbId,
          tmdbId: tmdbId // Store TMDB ID for future use
        });

        // Update localStorage
        const storedState = JSON.parse(localStorage.getItem('videoAppState') || '{}');
        storedState.seasons = seasonData;
        storedState.selectedSeason = '1';
        storedState.currentVideo = {
          url: '',
          title,
          type: 'series',
          imdbID: imdbId,
          tmdbId: tmdbId
        };
        localStorage.setItem('videoAppState', JSON.stringify(storedState));
      }
    } catch (err) {
      setError('Error fetching TV show data.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadVideo = (result: SearchResult) => {
    if (result.Type === 'movie') {
      const embedUrl = `https://vidsrc.xyz/embed/movie?imdb=${result.imdbID}`;
      setCurrentVideo({ url: embedUrl, title: result.Title, type: 'movie' });
      setSeasons([]);
      setSelectedSeason('');
    } else if (result.Type === 'series' && result.tmdbId) {
      loadTVShow(result.tmdbId, result.Title, result.imdbID);
    } else {
      setError('Only movies and series are supported.');
    }
  };

  const getCurrentEpisodeIndex = () => {
    if (!currentVideo?.season || !currentVideo?.episode) return -1;
    const currentSeasonEpisodes = seasons
      .find(s => s.seasonNumber === currentVideo.season)
      ?.episodes || [];
    return currentSeasonEpisodes.findIndex(ep => ep.Episode === currentVideo.episode);
  };

  const loadPreviousEpisode = () => {
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
        setSelectedSeason(previousSeason);
        loadEpisode(previousSeasonEpisodes[previousSeasonEpisodes.length - 1]);
      }
    }
  };

  const loadNextEpisode = () => {
    if (!currentVideo?.season) return;
    
    const currentSeasonEpisodes = seasons
      .find(s => s.seasonNumber === currentVideo.season)
      ?.episodes || [];
    const currentIndex = getCurrentEpisodeIndex();
    
    if (currentIndex < currentSeasonEpisodes.length - 1) {
      // Load next episode in current season
      loadEpisode(currentSeasonEpisodes[currentIndex + 1], true); // Added true for autoClick
    } else {
      // Load first episode of next season
      const nextSeason = (parseInt(currentVideo.season) + 1).toString();
      const nextSeasonEpisodes = seasons
        .find(s => s.seasonNumber === nextSeason)
        ?.episodes || [];
      
      if (nextSeasonEpisodes.length > 0) {
        setSelectedSeason(nextSeason);
        loadEpisode(nextSeasonEpisodes[0], true); // Added true for autoClick
      }
    }
  };

  // Modified loadEpisode function
  const loadEpisode = async (episode: Episode, autoClick: boolean = false) => {
    if (currentVideo?.imdbID && currentVideo.tmdbId) {
      // Clear all existing timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (autoplayRef.current) {
        clearTimeout(autoplayRef.current);
      }
      
      // Reset all timer states
      setIsTimerActive(false);
  
      try {
        const runtime = await fetchEpisodeRuntime(
          currentVideo.tmdbId,
          selectedSeason,
          episode.Episode
        );
        console.log('Fetched episode runtime:', runtime);
        
        if (runtime > 0) {
          setEpisodeRuntime(runtime);
        } else {
          console.log('No runtime available for episode');
        }
  
        const newVideo: VideoInfo = {
          url: `https://vidsrc.xyz/embed/tv?imdb=${currentVideo.imdbID}&s=${selectedSeason}&e=${episode.Episode}`,
          title: currentVideo.title,
          type: 'series',
          imdbID: currentVideo.imdbID,
          season: selectedSeason,
          episode: episode.Episode,
          episodeTitle: episode.Title,
          timestamp: Date.now(),
          tmdbId: currentVideo.tmdbId
        };
  
        // Check for saved timer
        const episodeId = getEpisodeId(newVideo);
        const savedTimer = episodeTimers[episodeId];
  
        // Add to history if it's a new episode
        const isNewEpisode = !watchHistory.some(
          v => v.imdbID === newVideo.imdbID && 
               v.season === newVideo.season && 
               v.episode === newVideo.episode
        );
  
        if (isNewEpisode) {
          setWatchHistory(prev => [newVideo, ...prev]);
        }
  
        setCurrentVideo(newVideo);
        setShowHistory(false);
        
        setTimeout(() => {
          scrollToVideo();
          

        }, 100);
      } catch (error) {
        console.error('Error loading episode:', error);
      }
    }
  };

   // Add function to clear all episode timers
   const clearAllTimers = () => {
    setEpisodeTimers({});
    localStorage.removeItem('episodeTimers');
  };


  const toggleCast = () => {
    if (window.confirm("Warning: By pressing this you will allow the player to open tabs to POTENTIALLY DANGEROUS WEBSITES. Do you want to proceed?")) {
      setCastEnabled(!castEnabled);
      
      if (iframeRef.current && currentVideo?.url) {
        const iframe = iframeRef.current;
        const currentSrc = iframe.src;
        iframe.src = 'about:blank';
        setTimeout(() => {
          iframe.src = currentSrc;
        }, 100);
      }
    }
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

// Update playFromHistory function
const playFromHistory = async (video: VideoInfo) => {
  if (video.type === 'series' && video.tmdbId) {
    // Fetch runtime when playing from history
    const runtime = await fetchEpisodeRuntime(
      video.tmdbId,
      video.season!,
      video.episode!
    );
    if (runtime > 0) {
      setEpisodeRuntime(runtime);
    }
  }
  setCurrentVideo(video);
  setShowHistory(false);
};

  const clearHistory = () => {
    setWatchHistory([]);
    setShowHistory(false);
  };

    // Save state to localStorage whenever it changes
    useEffect(() => {
      const stateToStore: StoredState = {
        currentVideo,
        watchHistory,
        searchResults,
        searchQuery,
        seasons,
        selectedSeason,
        castEnabled,
        autoplayEnabled
      };
      localStorage.setItem('videoAppState', JSON.stringify(stateToStore));
    }, [currentVideo, watchHistory, searchResults, searchQuery, seasons, selectedSeason, castEnabled, autoplayEnabled]);
  
  
    // Modify clearStoredData to include clearing timers
  const clearStoredData = () => {
    localStorage.removeItem('videoAppState');
    localStorage.removeItem('episodeTimers');
    setCurrentVideo(null);
    setWatchHistory([]);
    setSearchResults([]);
    setSearchQuery('');
    setSeasons([]);
    setSelectedSeason('');
    setCastEnabled(false);
    setShowHistory(false);
    setEpisodeTimers({});
  };



    const HeaderButtons = () => (
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={searchIMDb}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Search'}
        </button>
        {watchHistory.length > 0 && (
          <button
            onClick={toggleHistory}
            className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors whitespace-nowrap"
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
        )}
        <button 
          onClick={toggleCast}
          className={`px-4 py-2 border rounded-lg transition-colors whitespace-nowrap ${
            castEnabled 
              ? 'bg-white text-black border-white' 
              : 'bg-transparent text-white border-white hover:bg-white hover:text-black'
          }`}
        >
          Cast: {castEnabled ? 'Enabled' : 'Disabled'}
        </button>
        <button 
        className={`px-4 py-2 border rounded-lg transition-colors whitespace-nowrap ${
          autoplayEnabled 
            ? 'bg-white text-black border-white' 
            : 'bg-transparent text-white border-white hover:bg-white hover:text-black'
        }`}
      >
        Autoplay: {autoplayEnabled ? 'Enabled' : 'Disabled'}
      </button>
        <button
          onClick={clearStoredData}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
        >
          Clear Data
        </button>
      </div>
    );



  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="fixed top-[56px] left-0 w-full bg-zinc-800 shadow-lg p-4 z-40">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchIMDb()}
            placeholder="Enter movie or show name"
            className="px-4 py-2 rounded-lg bg-white text-black flex-1 min-w-[200px]"
          />
          <HeaderButtons />
        </div>
      </div>

      <div className="flex-1 pt-36 px-4">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-500 text-white rounded-lg">
              {error}
            </div>
          )}

          {showHistory ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Watch History</h2>
                {watchHistory.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Clear History
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {watchHistory.map((video, index) => (
                  <div
                    key={`${video.imdbID}-${video.season}-${video.episode}-${index}`}
                    onClick={() => playFromHistory(video)}
                    className="bg-zinc-900 rounded-lg overflow-hidden cursor-pointer hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center p-4 gap-4">
                      <div className="w-[100px] h-[148px] bg-zinc-800 rounded flex items-center justify-center text-3xl font-bold text-zinc-600">
                        {video.episode}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{video.title}</h3>
                        <p className="text-zinc-400">
                          Season {video.season}, Episode {video.episode}
                        </p>
                        <p className="text-zinc-500">{video.episodeTitle}</p>
                        <p className="text-zinc-600 text-sm">
                          {new Date(video.timestamp || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : currentVideo && (
            <>
              <div ref={videoSectionRef}>
                {/* Mobile-optimized episode info */}
                {currentVideo.type === 'series' && currentVideo.season && currentVideo.episode && (
                  <div className="mb-4 space-y-1">
                    <div className="md:text-lg text-base font-medium">
                      <span className="md:hidden">Season {currentVideo.season}, Episode {currentVideo.episode}</span>
                    </div>
                  </div>
                )}

                {currentVideo && (
                  <>
                    {currentVideo.type === 'movie' ? (
                      <MoviePlayer
                        title={currentVideo.title}
                        url={currentVideo.url}
                      />
                    ) : (
                      <TVShowPlayer
                        title={currentVideo.title}
                        url={currentVideo.url}
                        season={currentVideo.season || ''}
                        episode={currentVideo.episode || ''}
                        episodeTitle={currentVideo.episodeTitle}
                        onLoadPreviousEpisode={loadPreviousEpisode}
                        onLoadNextEpisode={loadNextEpisode}
                      />
                    )}
                  </>
                )}
              </div>

              {currentVideo.type === 'series' && seasons.length > 0 && (
                    <select
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(e.target.value)}
                      className="px-4 py-2 rounded-lg bg-zinc-700 text-white border border-zinc-600"
                    >
                      {seasons.map((season) => (
                        <option key={season.seasonNumber} value={season.seasonNumber}>
                          Season {season.seasonNumber}
                        </option>
                      ))}
                    </select>
                  )}

              {/* Updated Episodes Grid */}
              {currentVideo.type === 'series' && selectedSeason && !showHistory && (
                <EpisodesGrid
                  season={seasons.find(s => s.seasonNumber === selectedSeason)}
                  selectedSeason={selectedSeason}
                  currentEpisode={currentVideo.episode}
                  currentSeason={currentVideo.season}
                  onEpisodeSelect={loadEpisode}
                />
              )}
            </>
          )}

          {!currentVideo && !showHistory && searchResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {searchResults.map((result) => (
                <div
                  key={result.imdbID}
                  className="bg-zinc-900 rounded-lg overflow-hidden cursor-pointer hover:bg-zinc-800 transition-colors"
                  onClick={() => loadVideo(result)}
                >
                  <div className="flex items-center p-4 gap-4">
                    <img
                      src={result.Poster !== "N/A" ? result.Poster : "https://via.placeholder.com/151x221?text=No+Image"}
                      alt={`${result.Title} poster`}
                      className="w-[100px] h-[148px] object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{result.Title}</h3>
                      <p className="text-zinc-400">{result.Year}</p>
                      <p className="text-zinc-500 capitalize">{result.Type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Search;