import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Trash2 } from 'lucide-react';
import { MoviePlayer } from '../components/videoplayer/MoviePlayer';
import { TVShowPlayer } from '../components/videoplayer/TVShowPlayer';
import { EpisodesGrid } from '../components/EpisodesGrid';
import Footer from '../components/footer';
import Header from '../components/Header';
import { VideoInfo, SearchResult, Season } from '../types';
import { GenreBrowser } from '../components/GenreBrowser';
import '../App.css';
import { useEpisodeLoader } from '../components/EpisodeLoader';
import { watchHistoryService } from '../services/watchHistoryService';



interface GroupedContent {
  [key: string]: VideoInfo[];
}

interface ContentRowProps {
  title: string;
  items: VideoInfo[] | SearchResult[];
  type: 'history' | 'movie' | 'series';
  onItemClick: (item: VideoInfo | SearchResult, type: 'history' | 'movie' | 'series') => void;
  onDeleteItem?: (item: VideoInfo) => void; // New prop for delete functionality
}

const Homepage = () => {
    // Existing homepage state
    const [recentlyWatched, setRecentlyWatched] = useState<VideoInfo[]>([]);
    const [movies, setMovies] = useState<SearchResult[]>([]);
    const [shows, setShows] = useState<SearchResult[]>([]);
    const [currentVideo, setCurrentVideo] = useState<VideoInfo | null>(null);
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [selectedSeason, setSelectedSeason] = useState('');

  
    const videoSectionRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
  
    const TMDB_API_KEY = 'de28a40a87b4fb9624452bb0ad02b724';
    const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

    // Scroll function
   const scrollToVideo = () => {
    if (videoSectionRef.current) {
      videoSectionRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

    const {
      loadEpisode,
      loadNextEpisode,
      loadPreviousEpisode,
      getCurrentEpisodeIndex
    } = useEpisodeLoader({
      currentVideo,
      seasons,
      selectedSeason,
      onVideoChange: (newVideo) => {
        updateWatchHistory(newVideo);
        setCurrentVideo(newVideo);
      },
      scrollToVideo
    });
    if (videoSectionRef.current) {
      videoSectionRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }


    useEffect(() => {
      const loadWatchHistory = async () => {
        try {
          const watchHistory = await watchHistoryService.getHistory();
          
          if (watchHistory.length > 0) {
            // Group content by show/movie
            const groupedContent: GroupedContent = {};
            
            watchHistory.forEach((item: VideoInfo) => {
              const key = item.type === 'series' ? item.imdbID! : `${item.imdbID}-${item.type}`;
              if (!groupedContent[key]) {
                groupedContent[key] = [];
              }
              groupedContent[key].push(item);
            });
  
            // Get latest episode/movie from each group
            const latestWatched = Object.values(groupedContent).map(items => {
              items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
              return items[0];
            });
  
            // Sort by timestamp
            latestWatched.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  
            setRecentlyWatched(latestWatched);
          }
        } catch (error) {
          console.error('Error loading watch history:', error);
        }
      };
  
      loadWatchHistory();
    }, []);
  
    // Update the watch history update function
    const updateWatchHistory = async (videoInfo: VideoInfo) => {
      try {
        await watchHistoryService.addToHistory(videoInfo);
        
        // Refresh the watch history
        const updatedHistory = await watchHistoryService.getHistory();
        
        // Group and sort the updated history
        const groupedContent: GroupedContent = {};
        updatedHistory.forEach((item: VideoInfo) => {
          const key = item.type === 'series' ? item.imdbID! : `${item.imdbID}-${item.type}`;
          if (!groupedContent[key]) {
            groupedContent[key] = [];
          }
          groupedContent[key].push(item);
        });
        
        const latestWatched = Object.values(groupedContent)
          .map(items => {
            items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            return items[0];
          })
          .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        setRecentlyWatched(latestWatched);
      } catch (error) {
        console.error('Error updating watch history:', error);
      }
    };
  
    // Update the delete from history function
    const handleDeleteFromHistory = async (itemToDelete: VideoInfo) => {
      try {
        await watchHistoryService.deleteFromHistory(itemToDelete);
        
        // Refresh the watch history
        const updatedHistory = await watchHistoryService.getHistory();
        
        // Group and sort the updated history
        const groupedContent: GroupedContent = {};
        updatedHistory.forEach((item: VideoInfo) => {
          const key = item.type === 'series' ? item.imdbID! : `${item.imdbID}-${item.type}`;
          if (!groupedContent[key]) {
            groupedContent[key] = [];
          }
          groupedContent[key].push(item);
        });
        
        const latestWatched = Object.values(groupedContent)
          .map(items => {
            items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            return items[0];
          })
          .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        setRecentlyWatched(latestWatched);
  
        // Close video player if needed
        if (currentVideo && currentVideo.type === 'series' && currentVideo.imdbID === itemToDelete.imdbID) {
          setCurrentVideo(null);
          window.history.replaceState({ isHomepage: true }, "", window.location.pathname);
        }
      } catch (error) {
        console.error('Error deleting from watch history:', error);
      }
    };
  

  const handleSearch = (results: SearchResult[]) => {
    const movies = results.filter(item => item.Type === 'movie');
    const shows = results.filter(item => item.Type === 'series');
    setMovies(movies);
    setShows(shows);
  };

  useEffect(() => {
    // Add initial history state for homepage
    window.history.replaceState({ isHomepage: true }, "", window.location.pathname);

    const handleBackButton = (event: PopStateEvent) => {
      // Close video player when back button is pressed
      if (currentVideo) {
        event.preventDefault(); // Prevent default back behavior
        setCurrentVideo(null);
        // Replace current history state with homepage state
        window.history.replaceState({ isHomepage: true }, "", window.location.pathname);
      }
    };

    // If video is opened, add a new history entry
    if (currentVideo) {
        window.history.pushState({ isHomepage: false }, "", window.location.pathname);
    }

    window.addEventListener('popstate', handleBackButton);

    return () => {
        window.removeEventListener('popstate', handleBackButton);
    };
}, [currentVideo]);

// Update the close button handler
const handleCloseVideo = () => {
    setCurrentVideo(null);
    // Replace current history state with homepage state
    window.history.replaceState({ isHomepage: true }, "", window.location.pathname);
};


  
  const handleItemClick = async (item: VideoInfo | SearchResult, type: 'history' | 'movie' | 'series') => {
    try {

      let videoInfo: VideoInfo;

      if (type === 'history') {
        const historyItem = item as VideoInfo;
        videoInfo = historyItem;
        if (historyItem.type === 'series') {
          let tmdbId = historyItem.tmdbId;
          if (!tmdbId) {
            const response = await fetch(
              `https://api.themoviedb.org/3/find/${historyItem.imdbID}?api_key=${TMDB_API_KEY}&external_source=imdb_id`
            );
            const data = await response.json();
            tmdbId = data.tv_results[0]?.id;
          }
          
          if (tmdbId) {
            const runtime = await fetchEpisodeRuntime(
              tmdbId,
              historyItem.season!,
              historyItem.episode!
            );

            videoInfo = {
              ...historyItem,
              tmdbId,
              runtime,
              url: `https://vidsrc.xyz/embed/tv?imdb=${historyItem.imdbID}&s=${historyItem.season}&e=${historyItem.episode}`
            };

            const seasonData = await fetchSeasonData(tmdbId);
            setSeasons(seasonData);
            setSelectedSeason(historyItem.season || '1');
          } else {
            videoInfo = historyItem;
          }
          updateWatchHistory(videoInfo);
        } else {
          videoInfo = {
            ...historyItem,
            url: `https://vidsrc.xyz/embed/movie?imdb=${historyItem.imdbID}`
          };
          updateWatchHistory(videoInfo);
        }
      } else if (type === 'movie') {
        const movieItem = item as SearchResult;
        videoInfo = {
          url: `https://vidsrc.xyz/embed/movie?imdb=${movieItem.imdbID}&ds_lang=en`,
          title: movieItem.Title,
          type: 'movie',
          imdbID: movieItem.imdbID,
          poster: movieItem.Poster
        };
        updateWatchHistory(videoInfo);
      } else {
        const seriesItem = item as SearchResult;
        const seasonData = await fetchSeasonData(seriesItem.tmdbId!);
        videoInfo = {
          url: '',
          title: seriesItem.Title,
          type: 'series',
          imdbID: seriesItem.imdbID,
          tmdbId: seriesItem.tmdbId
        };
        setSeasons(seasonData);
        setSelectedSeason('1');
      }

      setCurrentVideo(videoInfo);
      scrollToVideo();
      
    } catch (error) {
      console.error('Error handling item click:', error);
    }
  };

    const fetchEpisodeRuntime = async (tmdbId: number, season: string, episode: string) => {
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

  const fetchSeasonData = async (tmdbId: number) => {
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

// Add a message to show what will be deleted
const handleDeleteClick = (item: VideoInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (item.type === 'series') {
        if (window.confirm(`Remove all watched episodes of "${item.title}" from Continue Watching?`)) {
            handleDeleteFromHistory(item);
        }
    } else {
        handleDeleteFromHistory(item);
    }
};

  const ContentRow: React.FC<ContentRowProps> = ({ title, items, type, onItemClick, onDeleteItem  }) => {
    const [isScrolling, setIsScrolling] = useState(false);
    const [showLeftButton, setShowLeftButton] = useState(false);
    const [showRightButton, setShowRightButton] = useState(true);
    const rowRef = React.useRef<HTMLDivElement>(null);
    const scrollTimeout = React.useRef<NodeJS.Timeout>();
  
    // Check scroll position and update button visibility
    const updateScrollButtons = () => {
      if (rowRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
        setShowLeftButton(scrollLeft > 0);
        setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };
  
    // Enhanced scroll function with smooth acceleration
    const scroll = (direction: 'left' | 'right') => {
      const container = rowRef.current;
      if (container && !isScrolling) {
        setIsScrolling(true);
        
        // Calculate scroll amount based on container width
        const scrollAmount = direction === 'left' 
          ? -container.offsetWidth + 100 // Overlap by 100px
          : container.offsetWidth - 100;
        
        // Calculate current scroll position
        const currentScroll = container.scrollLeft;
        const targetScroll = currentScroll + scrollAmount;
        
        // Animate scroll with easing
        const startTime = performance.now();
        const duration = 600; // Animation duration in ms
  
        const animateScroll = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Easing function (easeInOutCubic)
          const easeProgress = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          
          const newPosition = currentScroll + (scrollAmount * easeProgress);
          container.scrollLeft = newPosition;
          
          if (progress < 1) {
            requestAnimationFrame(animateScroll);
          } else {
            setIsScrolling(false);
            updateScrollButtons();
          }
        };
  
        requestAnimationFrame(animateScroll);
      }
    };
  
    // Handle scroll events for button visibility
    useEffect(() => {
      const handleScroll = () => {
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }
        
        updateScrollButtons();
        
        scrollTimeout.current = setTimeout(() => {
          setIsScrolling(false);
        }, 150);
      };
  
      const container = rowRef.current;
      if (container) {
        container.addEventListener('scroll', handleScroll);
        updateScrollButtons(); // Initial check
      }
  
      return () => {
        if (container) {
          container.removeEventListener('scroll', handleScroll);
        }
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }
      };
    }, []);
  
    if (!items || items.length === 0) return null;


    return (
      <div className="mb-6 md:mb-8">
      <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 px-4">{title}</h2>
      <div className="relative group">
          {/* Left scroll button */}
          <button 
            onClick={() => scroll('left')}
            className={`
              hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10
              w-12 h-12 items-center justify-center
              bg-black bg-opacity-50 rounded-full
              transform transition-all duration-300
              ${showLeftButton ? 'opacity-0 group-hover:opacity-100 translate-x-2' : 'opacity-0 -translate-x-full'}
              hover:bg-opacity-75 hover:scale-110
            `}
            disabled={isScrolling || !showLeftButton}
          >
            <ChevronLeft size={24} className="transform transition-transform group-hover:scale-110" />
          </button>
          
          {/* Content container */}
          <div 
            ref={rowRef}
            className="flex overflow-x-auto overflow-y-hidden scrollbar-hide gap-3 md:gap-4 px-4 pb-4"
            style={{
              scrollBehavior: 'smooth'
            }}
          >
            {items.map((item) => (
              <div 
                key={type === 'history' ? 
                  `${(item as VideoInfo).imdbID}-${(item as VideoInfo).season}-${(item as VideoInfo).episode}` : 
                  (item as SearchResult).imdbID}
                  className="flex-none w-32 md:w-48 transform transition-all duration-300 hover:scale-105 cursor-pointer"
                  onClick={() => onItemClick(item, type)}
              >
                <div className="relative pb-[150%] bg-zinc-800 rounded-lg overflow-hidden group">
                {type === 'history' ? (
                    <>
                      {(item as VideoInfo).poster ? (
                        <img 
                          src={(item as VideoInfo).poster}
                          alt={(item as VideoInfo).title}
                          className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-zinc-900" />
                      )}
                      <div className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-80" 
                        style={{
                          background: `
                            radial-gradient(circle at center, 
                              transparent 0%, 
                              rgba(0,0,0,0.4) 60%,
                              rgba(0,0,0,0.8) 100%
                            ),
                            linear-gradient(
                              0deg,
                              rgba(0,0,0,0.9) 0%,
                              rgba(0,0,0,0.6) 30%,
                              rgba(0,0,0,0.3) 60%,
                              rgba(0,0,0,0.1) 100%
                            )
                          `
                        }} 
                      />
                      
                      <div className="absolute inset-x-0 bottom-0 p-2 md:p-4 transform transition-all duration-300 translate-y-0 group-hover:-translate-y-1">
                      <h3 className="font-semibold text-xs md:text-sm mb-1 transition-colors duration-300 group-hover:text-blue-400">
                      {(item as VideoInfo).title}
                        </h3>
                        {(item as VideoInfo).season && (item as VideoInfo).episode && (
                          <div className="text-xs md:text-sm text-zinc-300">
                            <div>S{(item as VideoInfo).season} E{(item as VideoInfo).episode}</div>
                            <p className="text-xs mt-1 line-clamp-2">{(item as VideoInfo).episodeTitle}</p>
                          </div>
                        )}
                        <p className="text-xs text-zinc-400 mt-1">
                          {new Date((item as VideoInfo).timestamp || 0).toLocaleDateString()}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <img 
                        src={(item as SearchResult).Poster !== "N/A" ? (item as SearchResult).Poster : "/api/placeholder/192/288"}
                        alt={(item as SearchResult).Title}
                        className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-80" 
                        style={{
                          background: `
                            radial-gradient(circle at center, 
                              transparent 0%, 
                              rgba(0,0,0,0.4) 60%,
                              rgba(0,0,0,0.8) 100%
                            ),
                            linear-gradient(
                              0deg,
                              rgba(0,0,0,0.9) 0%,
                              rgba(0,0,0,0.6) 30%,
                              rgba(0,0,0,0.3) 60%,
                              rgba(0,0,0,0.1) 100%
                            )
                          `
                        }} 
                      />
                      
                      <div className="absolute inset-x-0 bottom-0 p-2 md:p-4 transform transition-all duration-300 translate-y-0 group-hover:-translate-y-1">
                        <h3 className="font-semibold text-xs md:text-sm mb-1 transition-colors duration-300 group-hover:text-blue-400">
                          {(item as SearchResult).Title}
                        </h3>
                        <p className="text-xs text-zinc-300">
                          {(item as SearchResult).Year}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                {/* Updated delete button with mobile visibility */}
                {type === 'history' && onDeleteItem && (
                  <button
                      onClick={(e) => handleDeleteClick(item as VideoInfo, e)}
                      className="absolute top-2 right-2 p-2 bg-black bg-opacity-75 rounded-full md:hidden md:group-hover:flex flex items-center justify-center hover:bg-red-600 transition-colors duration-200 z-20"
                      aria-label={`Delete ${(item as VideoInfo).type === 'series' ? 'series' : 'movie'} from history`}
                  >
                      <Trash2 className="w-4 h-4" />
                  </button>
              )}
              </div>
              
            ))}
          </div>
          
          {/* Right scroll button */}
          <button 
            onClick={() => scroll('right')}
            className={`
              hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10
              w-12 h-12 items-center justify-center
              bg-black bg-opacity-50 rounded-full
              transform transition-all duration-300
              ${showRightButton ? 'opacity-0 group-hover:opacity-100 -translate-x-2' : 'opacity-0 translate-x-full'}
              hover:bg-opacity-75 hover:scale-110
            `}
            disabled={isScrolling || !showRightButton}
          >
            <ChevronRight size={24} className="transform transition-transform group-hover:scale-110" />
          </button>
        </div>
      </div>
    );
  };
  

  return (
    <div className="min-h-screen bg-black text-white">
      <Header onSearch={handleSearch} />
      
      {/* Video Player Overlay */}
      {currentVideo && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 overflow-y-auto pt-16 md:pt-24">
          {/* Close button */}
          <button 
            onClick={handleCloseVideo}
            className="absolute top-20 md:top-28 right-4 p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors"
          >
            <X size={24} />
          </button>
  
          <div ref={videoSectionRef} className="max-w-7xl mx-auto px-2 md:px-4">
            {currentVideo.type === 'movie' ? (
              <MoviePlayer
                title={currentVideo.title}
                url={currentVideo.url || ''}
              />
            ) : (
              <>
                <TVShowPlayer
                  title={currentVideo.title}
                  url={currentVideo.url || ''}
                  season={currentVideo.season || ''}
                  episode={currentVideo.episode || ''}
                  episodeTitle={currentVideo.episodeTitle}
                  onLoadPreviousEpisode={loadPreviousEpisode}
                  onLoadNextEpisode={loadNextEpisode}
                />
  
                {/* Season selector and episode grid */}
                {seasons.length > 0 && (
                  <div className="mt-4">
                    <select
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(e.target.value)}
                      className="px-4 py-2 rounded-lg bg-zinc-700 text-white border border-zinc-600 mb-4"
                    >
                      {seasons.map((season) => (
                        <option key={season.seasonNumber} value={season.seasonNumber}>
                          Season {season.seasonNumber}
                        </option>
                      ))}
                    </select>
  
                    <EpisodesGrid
                      season={seasons.find(s => s.seasonNumber === selectedSeason)}
                      selectedSeason={selectedSeason}
                      currentEpisode={currentVideo.episode}
                      currentSeason={currentVideo.season}
                      onEpisodeSelect={loadEpisode}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
  
      {/* Main Content */}
      <div className="max-w-7xl mx-auto pt-16 md:pt-24">
        <br>
        </br>
        <br>
        </br>
        <br>
        </br>
        <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 px-4">Home</h1>
        
        <ContentRow 
                title="Continue Watching" 
                items={recentlyWatched} 
                type="history" 
                onItemClick={handleItemClick}
                onDeleteItem={handleDeleteFromHistory}
          />
        
        <ContentRow 
          title="Movies" 
          items={movies} 
          type="movie" 
          onItemClick={handleItemClick}
        />
        
        <ContentRow 
          title="TV Shows" 
          items={shows} 
          type="series" 
          onItemClick={handleItemClick}
        />

        <GenreBrowser onItemClick={handleItemClick} />
        
        {!recentlyWatched.length && !movies.length && !shows.length && (
          <div className="flex flex-col items-center justify-center h-48 md:h-64 text-zinc-500">
            <p className="text-lg md:text-xl mb-3 md:mb-4">No content yet</p>
            <p className="text-xs md:text-sm">Search for movies and TV shows to get started</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Homepage;