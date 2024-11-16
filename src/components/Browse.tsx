import React, { useState, useEffect, useRef } from 'react';

interface MediaItem {
  imdb_id: string;
  title: string;
  tmdb_id: string;
  embed_url: string;
  // OMDB additional fields
  Poster?: string;
  Year?: string;
  Type?: string;
}

interface OmdbResponse {
  Title: string;
  Year: string;
  Poster: string;
  Type: string;
  Response: string;
}

interface VideoInfo {
  url: string;
  title: string;
  type: string;
}

function Browse() {
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [tvShows, setTvShows] = useState<MediaItem[]>([]);
  const [moviePage, setMoviePage] = useState(1);
  const [tvPage, setTvPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'movies' | 'tv'>('movies');
  const [currentVideo, setCurrentVideo] = useState<VideoInfo | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const fetchOmdbDetails = async (imdbId: string): Promise<OmdbResponse | null> => {
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=775f5bf1&i=${imdbId}`
      );
      const data = await response.json();
      if (data.Response === "True") {
        return data;
      }
      return null;
    } catch (err) {
      console.error('Error fetching OMDB details:', err);
      return null;
    }
  };

  const fetchMedia = async (type: 'movies' | 'tv', page: number) => {
    setLoading(true);
    setError('');
    
    try {
      const url = type === 'movies'
        ? `https://vidsrc.xyz/movies/latest/page-${page}.json`
        : `https://vidsrc.xyz/tvshows/latest/page-${page}.json`;
        
      const response = await fetch(url);
      const text = await response.text();
            
      try {
        const data = JSON.parse(text);
        const mediaList = data.result || [];
        console.log('Fetched media:', mediaList);

        // Fetch OMDB details for each item
        const itemsWithDetails = await Promise.all(
          mediaList.map(async (item: MediaItem) => {
            const omdbDetails = await fetchOmdbDetails(item.imdb_id);
            return {
              ...item,
              Poster: omdbDetails?.Poster || 'N/A',
              Year: omdbDetails?.Year || 'N/A',
              Type: omdbDetails?.Type || type
            };
          })
        );

        if (type === 'movies') {
          setMovies(prev => [...prev, ...itemsWithDetails]);
        } else {
          setTvShows(prev => [...prev, ...itemsWithDetails]);
        }
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        setError('Failed to parse response data');
      }
    } catch (err) {
      setError('Failed to load content. Please try again later.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia('movies', 1);
    fetchMedia('tv', 1);
  }, []);

  const loadMore = () => {
    if (activeTab === 'movies') {
      setMoviePage(prev => prev + 1);
      fetchMedia('movies', moviePage + 1);
    } else {
      setTvPage(prev => prev + 1);
      fetchMedia('tv', tvPage + 1);
    }
  };

  const handlePlayMedia = (imdbId: string, title: string, mediaType: 'movies' | 'tv') => {
    const embedUrl = mediaType === 'movies'
      ? `https://vidsrc.xyz/embed/movie?imdb=${imdbId}`
      : `https://vidsrc.xyz/embed/tv?imdb=${imdbId}`;

    setCurrentVideo({
      url: embedUrl,
      title: title,
      type: mediaType === 'movies' ? 'movie' : 'series'
    });

    // Scroll to video
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleCast = () => {
    if (window.confirm("Warning: By pressing this you will allow the player to open tabs to POTENTIALLY DANGEROUS WEBSITES. Do you want to proceed?")) {
      if (iframeRef.current) {
        const currentSandbox = iframeRef.current.getAttribute("sandbox");
        if (currentSandbox) {
          iframeRef.current.removeAttribute("sandbox");
        } else {
          iframeRef.current.setAttribute("sandbox", "allow-same-origin allow-scripts allow-forms");
        }
      }
    }
  };

  const handleNewSearch = () => {
    setCurrentVideo(null);
  };

  const currentItems = activeTab === 'movies' ? movies : tvShows;

  return (
    <div className="max-w-6xl mx-auto p-4 pt-20">
      {/* Video Player */}
      {currentVideo && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Now Playing: {currentVideo.title} ({currentVideo.type})
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={toggleCast}
                className="px-4 py-2 bg-transparent border border-white text-white rounded-lg hover:bg-white hover:text-black transition-colors"
              >
                Toggle Cast
              </button>
              <button
                onClick={handleNewSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close Video
              </button>
            </div>
          </div>
          <div className="relative w-full pt-[56.25%]">
            <iframe
              ref={iframeRef}
              src={currentVideo.url}
              className="absolute top-0 left-0 w-full h-full border-0"
              allowFullScreen
              sandbox="allow-same-origin allow-scripts allow-forms"
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('movies')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'movies'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-white hover:bg-zinc-700'
          }`}
        >
          Movies
        </button>
        <button
          onClick={() => setActiveTab('tv')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'tv'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-white hover:bg-zinc-700'
          }`}
        >
          TV Shows
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500 text-white rounded-lg">
          {error}
        </div>
      )}

      {/* Grid of media items */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {currentItems.map((item, index) => (
          <div
            key={`${item.imdb_id}-${index}`}
            className="bg-zinc-900 rounded-lg overflow-hidden cursor-pointer hover:bg-zinc-800 transition-colors"
            onClick={() => handlePlayMedia(item.imdb_id, item.title, activeTab)}
          >
            <div className="relative pb-[150%]">
              <img
                src={item.Poster !== "N/A" ? item.Poster : "https://via.placeholder.com/300x450?text=No+Image"}
                alt={item.title}
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>
              <p className="text-zinc-400">{item.Year}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && currentItems.length === 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-zinc-900 rounded-lg overflow-hidden animate-pulse">
              <div className="relative pb-[150%] bg-zinc-800" />
              <div className="p-4">
                <div className="h-4 bg-zinc-800 rounded mb-2" />
                <div className="h-4 bg-zinc-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load more button */}
      {currentItems.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className={`px-6 py-3 rounded-lg ${
              loading
                ? 'bg-zinc-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors`}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}

export default Browse;