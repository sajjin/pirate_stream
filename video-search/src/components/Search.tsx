import React, { useState, useRef } from 'react';

interface SearchResult {
  imdbID: string;
  Title: string;
  Year: string;
  Type: string;
  Poster: string;
}

interface VideoInfo {
  url: string;
  title: string;
  type: string;
}

function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentVideo, setCurrentVideo] = useState<VideoInfo | null>(null);
  const [error, setError] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const searchIMDb = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a movie or show name.');
      return;
    }

    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=775f5bf1&s=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data.Response === "True" && data.Search?.length > 0) {
        setSearchResults(data.Search);
        setError('');
        setCurrentVideo(null);
      } else {
        setSearchResults([]);
        setError('No results found.');
      }
    } catch (err) {
      setError('Error fetching data.');
      console.error('Error fetching data:', err);
    }
  };

  const loadVideo = (imdbID: string, title: string, type: string) => {
    if (type !== 'movie' && type !== 'series') {
      setError('Only movies and series are supported.');
      return;
    }

    const embedUrl = type === 'movie'
      ? `https://vidsrc.xyz/embed/movie?imdb=${imdbID}`
      : `https://vidsrc.xyz/embed/tv?imdb=${imdbID}`;

    setCurrentVideo({ url: embedUrl, title, type });
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
    setSearchQuery('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Fixed header */}
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
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={searchIMDb}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Search
            </button>
            {currentVideo && (
              <button
                onClick={handleNewSearch}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                New Search
              </button>
            )}
            <button 
              onClick={toggleCast}
              className="px-4 py-2 bg-transparent border border-white text-white rounded-lg hover:bg-white hover:text-black transition-colors whitespace-nowrap"
            >
              Toggle Cast
            </button>
          </div>
        </div>
      </div>

      {/* Main content with padding for fixed header */}
      <div className="flex-1 pt-36 px-4">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-500 text-white rounded-lg">
              {error}
            </div>
          )}

          {currentVideo ? (
            <>
              <h2 className="text-xl font-semibold mb-4">
                Now Playing: {currentVideo.title} ({currentVideo.type})
              </h2>
              <div className="relative w-full pt-[56.25%] mb-8">
                <iframe
                  ref={iframeRef}
                  src={currentVideo.url}
                  className="absolute top-0 left-0 w-full h-full border-0"
                  allowFullScreen
                  sandbox="allow-same-origin allow-scripts allow-forms"
                />
              </div>
            </>
          ) : (
            searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {searchResults.map((result) => (
                  <div
                    key={result.imdbID}
                    className="bg-zinc-900 rounded-lg overflow-hidden cursor-pointer hover:bg-zinc-800 transition-colors"
                    onClick={() => loadVideo(result.imdbID, result.Title, result.Type)}
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
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;