import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import Footer from '../components/footer';
import Header from '../components/Header';
import { GenreBrowser } from '../components/GenreBrowser';
import { SearchResult, VideoInfo } from '../types';
import { watchHistorySync } from '../services/watchHistorySync';
import { myListService } from '../services/myListService';
import '../App.css';

interface ContentRowProps {
  title: string;
  items: Array<SearchResult | VideoInfo>;
  type: 'history' | 'movie' | 'series' | 'my-list';
  onItemClick: (item: SearchResult | VideoInfo, type: 'history' | 'movie' | 'series' | 'my-list') => void;
  onDeleteItem?: (item: VideoInfo) => void;
}

const TMDB_FALLBACK = '/api/placeholder/192/288';

const toDetailsPath = (itemType: 'movie' | 'series', imdbID: string) => `/watch/${itemType}/${imdbID}`;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [recentlyWatched, setRecentlyWatched] = useState<VideoInfo[]>([]);
  const [movies, setMovies] = useState<SearchResult[]>([]);
  const [shows, setShows] = useState<SearchResult[]>([]);
  const [myList, setMyList] = useState<SearchResult[]>([]);

  useEffect(() => {
    const loadPageData = async () => {
      try {
        const watchHistory = await watchHistorySync.loadWatchHistory();
        setRecentlyWatched(watchHistory);
      } catch (error) {
        console.error('Error loading watch history:', error);
      }

      const storedState = JSON.parse(localStorage.getItem('videoAppState') || '{}');
      const storedResults = Array.isArray(storedState.searchResults) ? storedState.searchResults : [];
      setMovies(storedResults.filter((item: SearchResult) => item.Type === 'movie'));
      setShows(storedResults.filter((item: SearchResult) => item.Type === 'series'));
      const syncedMyList = await myListService.load();
      setMyList(syncedMyList);
    };

    loadPageData();
  }, []);

  const handleSearch = (results: SearchResult[]) => {
    setMovies(results.filter((item) => item.Type === 'movie'));
    setShows(results.filter((item) => item.Type === 'series'));
  };

  const handleOpenDetails = (
    item: SearchResult | VideoInfo,
    rowType: 'history' | 'movie' | 'series' | 'my-list'
  ) => {
    const normalizedType: 'movie' | 'series' =
      rowType === 'history'
        ? (item as VideoInfo).type
        : ((item as SearchResult).Type === 'series' ? 'series' : 'movie');

    const payload =
      rowType === 'history'
        ? {
            imdbID: (item as VideoInfo).imdbID,
            title: (item as VideoInfo).title,
            poster: (item as VideoInfo).poster,
            type: normalizedType,
            tmdbId: (item as VideoInfo).tmdbId
          }
        : {
            imdbID: (item as SearchResult).imdbID,
            title: (item as SearchResult).Title,
            poster: (item as SearchResult).Poster,
            year: (item as SearchResult).Year,
            type: normalizedType,
            tmdbId: (item as SearchResult).tmdbId
          };

    navigate(toDetailsPath(normalizedType, payload.imdbID), {
      state: payload
    });
  };

  const deleteFromHistory = async (videoInfo: VideoInfo) => {
    try {
      await watchHistorySync.deleteFromHistory(videoInfo.imdbID, videoInfo.type);
      setRecentlyWatched((prev) => prev.filter((item) => item.imdbID !== videoInfo.imdbID));
    } catch (error) {
      console.error('Error deleting from watch history:', error);
    }
  };

  const hasAnyContent = useMemo(
    () => recentlyWatched.length > 0 || movies.length > 0 || shows.length > 0 || myList.length > 0,
    [recentlyWatched.length, movies.length, shows.length, myList.length]
  );

  const ContentRow: React.FC<ContentRowProps> = ({ title, items, type, onItemClick, onDeleteItem }) => {
    if (!items.length) {
      return null;
    }

    return (
      <section className="mb-8 px-4">
        <h2 className="text-2xl font-bold mb-4 section-title">{title}</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {items.map((item) => {
            const isHistory = type === 'history';
            const imdbID = isHistory ? (item as VideoInfo).imdbID : (item as SearchResult).imdbID;
            const titleText = isHistory ? (item as VideoInfo).title : (item as SearchResult).Title;
            const poster = isHistory ? (item as VideoInfo).poster : (item as SearchResult).Poster;

            return (
              <div
                key={`${type}-${imdbID}`}
                className="relative w-32 md:w-44 shrink-0 cursor-pointer transition-transform duration-300"
                onClick={() => onItemClick(item, type)}
              >
                <div className="relative pb-[150%] rounded-xl overflow-hidden media-card transition-all duration-300">
                  <img
                    src={poster && poster !== 'N/A' ? poster : TMDB_FALLBACK}
                    alt={titleText}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = TMDB_FALLBACK;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-xs md:text-sm font-semibold line-clamp-2">{titleText}</p>
                    {isHistory && (item as VideoInfo).season && (item as VideoInfo).episode && (
                      <p className="text-[11px] text-zinc-300 mt-1">
                        S{(item as VideoInfo).season} E{(item as VideoInfo).episode}
                      </p>
                    )}
                  </div>
                </div>

                {isHistory && onDeleteItem && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item as VideoInfo);
                    }}
                    className="absolute top-2 right-2 p-2 rounded-full btn-danger transition-colors"
                    aria-label="Delete from history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div className="app-shell text-white">
      <Header onSearch={handleSearch} />

      <main className="max-w-7xl mx-auto pt-28 md:pt-32 pb-10">
        <div className="px-4 mb-8">
          <div className="frost-panel rounded-2xl p-6 md:p-8">
            <div className="chip-label inline-flex mb-4 text-xs uppercase tracking-[0.18em]">Streaming Dashboard</div>
            <h1 className="text-4xl md:text-5xl font-bold section-title">Home</h1>
            <p className="muted-copy mt-3 max-w-2xl">
              Track episodes, jump back into what you watched, and keep your personal list all in one place.
            </p>
          </div>
        </div>

        {!hasAnyContent && (
          <div className="frost-panel rounded-2xl flex flex-col items-center justify-center h-64 text-zinc-400 px-4 mx-4">
            <p className="text-xl mb-4">No content yet</p>
            <p className="text-sm">Search for movies and TV shows to get started.</p>
          </div>
        )}

        <ContentRow
          title="Continue Watching"
          items={recentlyWatched}
          type="history"
          onItemClick={handleOpenDetails}
          onDeleteItem={deleteFromHistory}
        />

        <ContentRow
          title="My List"
          items={myList}
          type="my-list"
          onItemClick={handleOpenDetails}
        />

        <ContentRow
          title="Movies"
          items={movies}
          type="movie"
          onItemClick={handleOpenDetails}
        />

        <ContentRow
          title="TV Shows"
          items={shows}
          type="series"
          onItemClick={handleOpenDetails}
        />

        <GenreBrowser onItemClick={(item, type) => handleOpenDetails(item as SearchResult, type as 'movie' | 'series')} />
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
