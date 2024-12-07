import React, { useState, useEffect } from 'react';
import { SearchResult, VideoInfo } from './types';

interface Genre {
  id: number;
  name: string;
}

interface GenreBrowserProps {
  onItemClick: (item: SearchResult, type: 'movie' | 'series') => void;
}

export const GenreBrowser: React.FC<GenreBrowserProps> = ({ onItemClick }) => {
  const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
  const [tvGenres, setTvGenres] = useState<Genre[]>([]);
  const [selectedType, setSelectedType] = useState<'movie' | 'tv'>('movie');
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const TMDB_API_KEY = 'de28a40a87b4fb9624452bb0ad02b724';
  const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const [movieResponse, tvResponse] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}`),
          fetch(`https://api.themoviedb.org/3/genre/tv/list?api_key=${TMDB_API_KEY}`)
        ]);

        const movieData = await movieResponse.json();
        const tvData = await tvResponse.json();

        setMovieGenres(movieData.genres);
        setTvGenres(tvData.genres);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    fetchGenres();
  }, []);

  const fetchByGenre = async (genreId: number, mediaType: 'movie' | 'tv', page: number = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/${mediaType}?api_key=${TMDB_API_KEY}&with_genres=${genreId}&page=${page}`
      );
      const data = await response.json();

      // Get external IDs (IMDB IDs) for all items
      const itemsWithImdbIds = await Promise.all(
        data.results.map(async (item: any) => {
          try {
            const externalIdsResponse = await fetch(
              `https://api.themoviedb.org/3/${mediaType}/${item.id}/external_ids?api_key=${TMDB_API_KEY}`
            );
            const externalIds = await externalIdsResponse.json();

            return {
              imdbID: externalIds.imdb_id,
              Title: mediaType === 'movie' ? item.title : item.name,
              Year: mediaType === 'movie' ? 
                item.release_date?.split('-')[0] : 
                item.first_air_date?.split('-')[0],
              Type: mediaType === 'movie' ? 'movie' : 'series',
              Poster: item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : 'N/A',
              tmdbId: item.id
            };
          } catch (error) {
            console.error(`Error fetching external IDs for ${mediaType} ${item.id}:`, error);
            return null;
          }
        })
      );

      // Filter out items without IMDB IDs
      const validResults = itemsWithImdbIds.filter(item => item && item.imdbID);

      if (page === 1) {
        setResults(validResults);
      } else {
        setResults(prev => [...prev, ...validResults]);
      }

      setHasMore(data.page < data.total_pages);
      setPage(data.page);
    } catch (error) {
      console.error('Error fetching by genre:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreSelect = async (genre: Genre) => {
    setSelectedGenre(genre);
    setPage(1);
    await fetchByGenre(genre.id, selectedType);
  };

  const handleTypeChange = (type: 'movie' | 'tv') => {
    setSelectedType(type);
    setSelectedGenre(null);
    setResults([]);
    setPage(1);
  };

  const loadMore = () => {
    if (selectedGenre) {
      fetchByGenre(selectedGenre.id, selectedType, page + 1);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-6 px-4">
        <h2 className="text-2xl font-bold">Browse by Genre</h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleTypeChange('movie')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedType === 'movie'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 hover:bg-zinc-700'
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => handleTypeChange('tv')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedType === 'tv'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 hover:bg-zinc-700'
            }`}
          >
            TV Shows
          </button>
        </div>
      </div>

      {/* Genre Pills */}
      <div className="flex flex-wrap gap-2 mb-6 px-4">
        {(selectedType === 'movie' ? movieGenres : tvGenres).map(genre => (
          <button
            key={genre.id}
            onClick={() => handleGenreSelect(genre)}
            className={`px-4 py-2 rounded-full transition-colors ${
              selectedGenre?.id === genre.id
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 hover:bg-zinc-700'
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {/* Results Grid with Updated Styling */}
      {selectedGenre && (
        <div className="px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.map((item) => (
              <div
                key={item.imdbID}
                onClick={() => onItemClick(item, selectedType === 'movie' ? 'movie' : 'series')}
                className="transform transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <div className="relative pb-[150%] bg-zinc-800 rounded-lg overflow-hidden group">
                  <img
                    src={item.Poster !== "N/A" ? item.Poster : "/api/placeholder/192/288"}
                    alt={item.Title}
                    className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                  />
                  {/* Vignette overlay */}
                  <div 
                    className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-80"
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
                  
                  {/* Title and year overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-4 transform transition-all duration-300 translate-y-0 group-hover:-translate-y-1">
                    <h3 className="font-semibold text-sm mb-1 transition-colors duration-300 group-hover:text-blue-400">
                      {item.Title}
                    </h3>
                    <p className="text-xs text-zinc-300">
                      {item.Year}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};