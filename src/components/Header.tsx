import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { UserCircle } from 'lucide-react';
import { clearStoredAuth } from '../auth/authHelper';


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
  const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

// Close dropdown when clicking outside
useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setShowDropdown(false);
    }
  }

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);


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
      clearStoredAuth(); // Clear stored auth data
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
          `https://api.themoviedb.org/3/search/tv?api_key=${process.env.REACT_APP_TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}`
        ),
        fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${process.env.REACT_APP_TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}`
        )
      ]);

      const tvData = await tvResponse.json();
      const movieData = await movieResponse.json();

      // Get external IDs for TV shows
      const tvShowsWithImdbIds = await Promise.all(
        tvData.results?.map(async (show: any) => {
          const externalIdsResponse = await fetch(
            `https://api.themoviedb.org/3/tv/${show.id}/external_ids?api_key=${process.env.REACT_APP_TMDB_API_KEY}`
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
            `https://api.themoviedb.org/3/movie/${movie.id}/external_ids?api_key=${process.env.REACT_APP_TMDB_API_KEY}`
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
    <div className="fixed top-0 left-0 w-full bg-zinc-800 shadow-lg z-40">
      {/* Auth buttons container */}
      <div className="absolute top-0 right-4 py-2">
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <UserCircle size={32} className="text-white" />
            </button>
            
            {showDropdown && (
              <div 
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-48 bg-zinc-800 rounded-lg shadow-lg py-1 z-50"
              >
                <div className="px-4 py-2 border-b border-zinc-700">
                <p className="text-sm text-white">{user.signInDetails?.loginId}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
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
          </div>
        )}
      </div>
  
      {/* Search bar container */}
      <div className="max-w-6xl mx-auto p-4 mt-12">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchIMDb()}
            placeholder="Enter movie or show name"
            className="px-4 py-2 rounded-lg bg-white text-black flex-1 min-w-[200px]"
          />
          <button
            onClick={searchIMDb}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;