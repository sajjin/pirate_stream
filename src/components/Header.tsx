import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { Clapperboard, Home, UserCircle } from 'lucide-react';
import { authPersistence } from '../auth/authPersistence';



interface HeaderProps {
  onSearch?: (results: any[]) => void;
}

const Header: React.FC<HeaderProps> = ({
  onSearch
}) => {
  const [searchQuery, setSearchQuery] = useState('');
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
      authPersistence.clearStoredAuth();
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
    <div className="fixed top-0 left-0 w-full top-nav shadow-2xl z-40">
      <div className="absolute top-0 left-4 py-2">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-3 py-2 rounded-lg btn-ghost text-sm"
          aria-label="Go home"
        >
          <Home className="w-4 h-4" />
          Home
        </button>
      </div>

      {/* Auth buttons container */}
      <div className="absolute top-0 right-4 py-2">
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity text-zinc-100"
            >
              <UserCircle size={32} className="text-white" />
            </button>
            
            {showDropdown && (
              <div 
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-56 frost-panel rounded-lg shadow-lg py-1 z-50"
              >
                <div className="px-4 py-2 border-b border-zinc-700/70">
                <p className="text-sm text-white">{user.signInDetails?.loginId}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-red-900/40 transition-colors"
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
              className="px-4 py-2 rounded-lg btn-primary transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="px-4 py-2 rounded-lg btn-ghost transition-colors"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
  
      {/* Search bar container */}
      <div className="max-w-6xl mx-auto p-4 mt-4 md:mt-6">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-zinc-100 hover:text-white transition-colors"
            aria-label="Go to home"
          >
            <Clapperboard className="w-5 h-5 text-cyan-300" />
            <span className="font-semibold tracking-wide">Pirate Stream</span>
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchIMDb()}
            placeholder="Enter movie or show name"
            className="px-4 py-2 rounded-xl frost-panel text-zinc-100 placeholder-zinc-400 flex-1 min-w-[200px] outline-none"
          />
          <button
            onClick={searchIMDb}
            disabled={loading}
            className="px-4 py-2 btn-primary rounded-xl transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;