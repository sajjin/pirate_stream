import React, { useState, useEffect } from 'react';
import { SearchResult, VideoInfo } from '../types';

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
  const [sortBy, setSortBy] = useState<'popularity.desc' | 'release_date.desc'>('popularity.desc');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [allResults, setAllResults] = useState<SearchResult[]>([]); // Store all fetched results
  const [displayedCount, setDisplayedCount] = useState(0); // Track number of displayed items


  const ITEMS_PER_PAGE = 10;
  const TMDB_API_KEY = 'de28a40a87b4fb9624452bb0ad02b724';
  const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

  // Generate array of years from 1900 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => String(currentYear - i));

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

  useEffect(() => {
    if (selectedGenre) {
      setPage(1);
      setResults([]);
      fetchByGenre(selectedGenre.id, selectedType);
    }
  }, [selectedYear]);

  const fetchByGenre = async (genreId: number, mediaType: 'movie' | 'tv', page: number = 1) => {
    setLoading(true);
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      const releaseDateField = mediaType === 'movie' ? 'release_date' : 'first_air_date';
      
      let queryParams = new URLSearchParams({
        api_key: TMDB_API_KEY,
        with_genres: String(genreId),
        page: String(page),
        sort_by: sortBy,
        include_null_first_air_dates: 'false'
      });

      if (selectedYear) {
        queryParams.append(`${releaseDateField}.gte`, `${selectedYear}-01-01`);
        queryParams.append(`${releaseDateField}.lte`, `${selectedYear}-12-31`);
      } else {
        queryParams.append(`${releaseDateField}.lte`, currentDate);
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/discover/${mediaType}?${queryParams}`
      );

      const data = await response.json();

      const itemsWithImdbIds = await Promise.all(
        data.results.map(async (item: any) => {
          try {
            const releaseDate = mediaType === 'movie' ? item.release_date : item.first_air_date;
            
            if (!releaseDate) return null;

            const releaseYear = releaseDate.split('-')[0];
            if (selectedYear && releaseYear !== selectedYear) {
              return null;
            }

            if (!selectedYear && new Date(releaseDate) > new Date()) {
              return null;
            }

            const externalIdsResponse = await fetch(
              `https://api.themoviedb.org/3/${mediaType}/${item.id}/external_ids?api_key=${TMDB_API_KEY}`
            );
            const externalIds = await externalIdsResponse.json();

            if (!externalIds.imdb_id) return null;

            return {
              imdbID: externalIds.imdb_id,
              Title: mediaType === 'movie' ? item.title : item.name,
              Year: releaseYear,
              Type: mediaType === 'movie' ? 'movie' : 'series',
              Poster: item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : 'N/A',
              tmdbId: item.id,
              popularity: item.popularity
            };
          } catch (error) {
            console.error(`Error fetching external IDs for ${mediaType} ${item.id}:`, error);
            return null;
          }
        })
      );

      const validResults = itemsWithImdbIds.filter(item => {
        if (!item || !item.imdbID) return false;
        if (selectedYear && item.Year !== selectedYear) return false;
        return true;
      });

      if (page === 1) {
        setAllResults(validResults);
        setResults(validResults.slice(0, ITEMS_PER_PAGE));
        setDisplayedCount(Math.min(ITEMS_PER_PAGE, validResults.length));
      } else {
        setAllResults(prev => [...prev, ...validResults]);
      }

      setHasMore(validResults.length > 0 && data.page < data.total_pages);
      setPage(data.page);
    } catch (error) {
      console.error('Error fetching by genre:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextCount = displayedCount + ITEMS_PER_PAGE;
    
    // If we need more results
    if (nextCount > allResults.length && hasMore) {
      if (selectedGenre) {
        fetchByGenre(selectedGenre.id, selectedType, page + 1);
      }
    }
    
    // Update displayed results
    setResults(allResults.slice(0, nextCount));
    setDisplayedCount(nextCount);
  };

  useEffect(() => {
    if (allResults.length > displayedCount) {
      setResults(allResults.slice(0, displayedCount));
    }
  }, [allResults, displayedCount]);

  const handleGenreSelect = async (genre: Genre) => {
    setSelectedGenre(genre);
    setPage(1);
    setResults([]);
    setAllResults([]);
    setDisplayedCount(0);
    await fetchByGenre(genre.id, selectedType);
  };

  const handleTypeChange = (type: 'movie' | 'tv') => {
    setSelectedType(type);
    setSelectedGenre(null);
    setResults([]);
    setAllResults([]);
    setDisplayedCount(0);
    setPage(1);
  };

  const handleSortChange = async (newSortBy: 'popularity.desc' | 'release_date.desc') => {
    setSortBy(newSortBy);
    if (selectedGenre) {
      setPage(1);
      setResults([]);
      setAllResults([]);
      setDisplayedCount(0);
      await fetchByGenre(selectedGenre.id, selectedType);
    }
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setDisplayedCount(0);
    setAllResults([]);
  };

  
  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4 px-4">
        <div className="flex items-center gap-4">
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

        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as 'popularity.desc' | 'release_date.desc')}
              className="bg-zinc-800 px-3 py-2 rounded-lg text-sm"
            >
              <option value="popularity.desc">Most Popular</option>
              <option value="release_date.desc">Release Date</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="bg-zinc-800 px-3 py-2 rounded-lg text-sm"
            >
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 mt-4 px-4">
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