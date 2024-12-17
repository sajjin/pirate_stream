import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, signOut } from 'aws-amplify/auth';

interface HeaderProps {
  onSearch?: (results: any[]) => void;
}

const Header: React.FC<HeaderProps> = ({
  onSearch
}) => {
  const [searchQuery, setSearchQuery] = useState('');``
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const TMDB_API_KEY = 'de28a40a87b4fb9624452bb0ad02b724';
  const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      setUser(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      navigate('/');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const searchIMDb = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
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

      // Get external IDs for TV shows
      const tvShowsWithImdbIds = await Promise.all(
        tvData.results?.map(async (show: any) => {
          const externalIdsResponse = await fetch(
            `https://api.themoviedb.org/3/tv/${show.id}/external_ids?api_key=${TMDB_API_KEY}`
          );
          const externalIds = await externalIdsResponse.json();
          return {
            ...show,
            imdb_id: externalIds.imdb_id
          };
        }) || []
      );

      // Get external IDs for movies
      const moviesWithImdbIds = await Promise.all(
        movieData.results?.map(async (movie: any) => {
          const externalIdsResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${movie.id}/external_ids?api_key=${TMDB_API_KEY}`
          );
          const externalIds = await externalIdsResponse.json();
          return {
            ...movie,
            imdb_id: externalIds.imdb_id
          };
        }) || []
      );

      // Format results
      const formattedResults = [
        ...tvShowsWithImdbIds
          .filter(show => show.imdb_id)
          .map(show => ({
            imdbID: show.imdb_id,
            Title: show.name,
            Year: show.first_air_date?.split('-')[0] || 'N/A',
            Type: 'series',
            Poster: show.poster_path ? `${TMDB_IMAGE_BASE}${show.poster_path}` : 'N/A',
            tmdbId: show.id
          })),
        ...moviesWithImdbIds
          .filter(movie => movie.imdb_id)
          .map(movie => ({
            imdbID: movie.imdb_id,
            Title: movie.title,
            Year: movie.release_date?.split('-')[0] || 'N/A',
            Type: 'movie',
            Poster: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : 'N/A',
            tmdbId: movie.id
          }))
      ];

      // Update localStorage
      const storedState = JSON.parse(localStorage.getItem('videoAppState') || '{}');
      storedState.searchResults = formattedResults;
      localStorage.setItem('videoAppState', JSON.stringify(storedState));

      if (onSearch) {
        onSearch(formattedResults);
      }

      navigate('/');
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
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
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={searchIMDb}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Search'}
          </button>

           {user ? (
            <>
              <span className="text-white">
                {user.username}
              </span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/auth')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Sign Up
              </button>
            </>
          )} 
        </div>
      </div>
    </div>
  );
};

export default Header;