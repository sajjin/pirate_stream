import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/footer';
import VideoSourceSelector, { VIDEO_SOURCES } from '../components/VideoSourceSelector';
import { MoviePlayer } from '../components/videoplayer/MoviePlayer';
import { TVShowPlayer } from '../components/videoplayer/TVShowPlayer';
import { EpisodesGrid } from '../components/EpisodesGrid';
import { Episode, SearchResult, Season, VideoInfo } from '../types';
import { fetchEpisodeRuntime, fetchSeasonData } from '../components/videoplayer/videoHandlers';
import { watchHistorySync } from '../services/watchHistorySync';
import { myListService } from '../services/myListService';

interface MediaState {
  imdbID?: string;
  title?: string;
  poster?: string;
  year?: string;
  type?: 'movie' | 'series';
  tmdbId?: number;
}

interface MediaDetails {
  title: string;
  poster: string;
  year: string;
  overview: string;
  tmdbId?: number;
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const FALLBACK_POSTER = '/api/placeholder/192/288';

const parseEpisodeKey = (value: string): { season: string; episode: string } | null => {
  const [season, episode] = value.split('-');
  if (!season || !episode) {
    return null;
  }

  return { season, episode };
};

const MediaDetailsPage: React.FC = () => {
  const { imdbID = '', type = 'movie' } = useParams<{ imdbID: string; type: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state || {}) as MediaState;
  const normalizedType: 'movie' | 'series' = type === 'series' ? 'series' : 'movie';

  const [details, setDetails] = useState<MediaDetails>({
    title: state.title || 'Loading...',
    poster: state.poster || FALLBACK_POSTER,
    year: state.year || 'N/A',
    overview: 'Loading description...',
    tmdbId: state.tmdbId
  });
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState('1');
  const [currentVideo, setCurrentVideo] = useState<VideoInfo | null>(null);
  const [currentSource, setCurrentSource] = useState(0);
  const [watchedEpisodeKeys, setWatchedEpisodeKeys] = useState<Set<string>>(new Set());
  const [lastWatchedEpisodeKey, setLastWatchedEpisodeKey] = useState<string | undefined>(undefined);
  const [isInList, setIsInList] = useState(false);

  const selectedSeasonData = useMemo(
    () => seasons.find((season) => season.seasonNumber === selectedSeason),
    [seasons, selectedSeason]
  );

  const fetchMediaDetails = async () => {
    setIsLoadingDetails(true);

    try {
      const findResponse = await fetch(
        `https://api.themoviedb.org/3/find/${imdbID}?api_key=${process.env.REACT_APP_TMDB_API_KEY}&external_source=imdb_id`
      );
      const findData = await findResponse.json();

      const sourceData = normalizedType === 'movie' ? findData.movie_results?.[0] : findData.tv_results?.[0];

      const mergedDetails: MediaDetails = {
        title: state.title || sourceData?.title || sourceData?.name || 'Unknown title',
        poster:
          state.poster && state.poster !== 'N/A'
            ? state.poster
            : sourceData?.poster_path
              ? `${TMDB_IMAGE_BASE}${sourceData.poster_path}`
              : FALLBACK_POSTER,
        year:
          state.year ||
          sourceData?.release_date?.split('-')[0] ||
          sourceData?.first_air_date?.split('-')[0] ||
          'N/A',
        overview: sourceData?.overview || 'No description available yet.',
        tmdbId: state.tmdbId || sourceData?.id
      };

      setDetails(mergedDetails);

      if (normalizedType === 'series' && mergedDetails.tmdbId) {
        const seasonData = await fetchSeasonData(mergedDetails.tmdbId);
        setSeasons(seasonData);
      }
    } catch (error) {
      console.error('Failed to fetch media details:', error);
      setDetails((prev) => ({
        ...prev,
        overview: 'Unable to load description right now.'
      }));
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const refreshEpisodeTracking = async () => {
    if (normalizedType !== 'series') {
      return;
    }

    try {
      const history = await watchHistorySync.loadWatchHistory();
      const watchedEpisodes = history.filter(
        (item) => item.imdbID === imdbID && item.type === 'series' && item.season && item.episode
      );

      const watchedKeys = watchedEpisodes.map((item) => `${item.season}-${item.episode}`);
      setWatchedEpisodeKeys(new Set(watchedKeys));

      const latest = watchedEpisodes
        .slice()
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))[0];

      if (latest?.season && latest?.episode) {
        setSelectedSeason(latest.season);
        setLastWatchedEpisodeKey(`${latest.season}-${latest.episode}`);
      }
    } catch (error) {
      console.error('Failed to load watch tracking:', error);
    }
  };

  useEffect(() => {
    if (!imdbID) {
      return;
    }

    setIsInList(myListService.isInList(imdbID));
    fetchMediaDetails();
    refreshEpisodeTracking();
  }, [imdbID, normalizedType]);

  useEffect(() => {
    const handleBrowserBack = () => {
      navigate('/', { replace: true });
    };

    window.addEventListener('popstate', handleBrowserBack);

    return () => {
      window.removeEventListener('popstate', handleBrowserBack);
    };
  }, [navigate]);

  const persistWatchEntry = async (videoInfo: VideoInfo) => {
    try {
      await watchHistorySync.saveProgress(videoInfo);
    } catch (error) {
      console.error('Failed to update watch history:', error);
    }
  };

  const handlePlayMovie = async () => {
    const videoInfo: VideoInfo = {
      imdbID,
      title: details.title,
      type: 'movie',
      tmdbId: details.tmdbId,
      poster: details.poster,
      timestamp: Date.now(),
      url: VIDEO_SOURCES[currentSource].getUrl(imdbID)
    };

    setCurrentVideo(videoInfo);
    await persistWatchEntry(videoInfo);
  };

  const handleEpisodeSelect = async (episode: Episode) => {
    const runtime = details.tmdbId
      ? await fetchEpisodeRuntime(details.tmdbId, selectedSeason, episode.Episode)
      : 0;

    const videoInfo: VideoInfo = {
      imdbID,
      title: details.title,
      type: 'series',
      tmdbId: details.tmdbId,
      poster: details.poster,
      season: selectedSeason,
      episode: episode.Episode,
      episodeTitle: episode.Title,
      runtime,
      timestamp: Date.now(),
      url: VIDEO_SOURCES[currentSource].getUrl(imdbID, selectedSeason, episode.Episode)
    };

    setCurrentVideo(videoInfo);
    await persistWatchEntry(videoInfo);

    const episodeKey = `${selectedSeason}-${episode.Episode}`;
    setWatchedEpisodeKeys((prev) => new Set(prev).add(episodeKey));
    setLastWatchedEpisodeKey(episodeKey);
  };

  const handleResumeSeries = async () => {
    if (seasons.length === 0) {
      return;
    }

    const parsed = lastWatchedEpisodeKey ? parseEpisodeKey(lastWatchedEpisodeKey) : null;
    const seasonToUse = parsed?.season || seasons[0].seasonNumber;
    const seasonData = seasons.find((season) => season.seasonNumber === seasonToUse);

    if (!seasonData || seasonData.episodes.length === 0) {
      return;
    }

    const episodeToUse =
      seasonData.episodes.find((episode) => episode.Episode === (parsed?.episode || '1')) || seasonData.episodes[0];

    setSelectedSeason(seasonToUse);
    await handleEpisodeSelect(episodeToUse);
  };

  const handleLoadNextEpisode = async () => {
    if (!currentVideo?.season || !currentVideo?.episode) {
      return;
    }

    const currentSeasonData = seasons.find((season) => season.seasonNumber === currentVideo.season);
    if (!currentSeasonData) {
      return;
    }

    const currentIndex = currentSeasonData.episodes.findIndex(
      (episode) => episode.Episode === currentVideo.episode
    );

    if (currentIndex >= 0 && currentIndex < currentSeasonData.episodes.length - 1) {
      setSelectedSeason(currentVideo.season);
      await handleEpisodeSelect(currentSeasonData.episodes[currentIndex + 1]);
      return;
    }

    const nextSeasonNumber = String(Number(currentVideo.season) + 1);
    const nextSeasonData = seasons.find((season) => season.seasonNumber === nextSeasonNumber);
    if (nextSeasonData?.episodes.length) {
      setSelectedSeason(nextSeasonNumber);
      await handleEpisodeSelect(nextSeasonData.episodes[0]);
    }
  };

  const handleLoadPreviousEpisode = async () => {
    if (!currentVideo?.season || !currentVideo?.episode) {
      return;
    }

    const currentSeasonData = seasons.find((season) => season.seasonNumber === currentVideo.season);
    if (!currentSeasonData) {
      return;
    }

    const currentIndex = currentSeasonData.episodes.findIndex(
      (episode) => episode.Episode === currentVideo.episode
    );

    if (currentIndex > 0) {
      setSelectedSeason(currentVideo.season);
      await handleEpisodeSelect(currentSeasonData.episodes[currentIndex - 1]);
      return;
    }

    const previousSeasonNumber = String(Math.max(1, Number(currentVideo.season) - 1));
    const previousSeasonData = seasons.find((season) => season.seasonNumber === previousSeasonNumber);
    if (previousSeasonData?.episodes.length) {
      setSelectedSeason(previousSeasonNumber);
      await handleEpisodeSelect(previousSeasonData.episodes[previousSeasonData.episodes.length - 1]);
    }
  };

  const toggleMyList = () => {
    if (isInList) {
      myListService.remove(imdbID);
      setIsInList(false);
      return;
    }

    const item: SearchResult = {
      imdbID,
      Title: details.title,
      Year: details.year,
      Type: normalizedType,
      Poster: details.poster,
      tmdbId: details.tmdbId
    };

    myListService.add(item);
    setIsInList(true);
  };

  return (
    <div className="app-shell text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 pt-28 md:pt-32 pb-16">
        <section className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 mb-8 items-start frost-panel rounded-2xl p-5 md:p-7">
          <img
            src={details.poster || FALLBACK_POSTER}
            alt={details.title}
            className="w-full max-w-[220px] rounded-xl object-cover media-card"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_POSTER;
            }}
          />

          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h1 className="text-3xl md:text-4xl font-bold section-title">{details.title}</h1>
              <span className="chip-label text-sm">{details.year}</span>
            </div>

            <p className="muted-copy leading-relaxed mb-4">
              {isLoadingDetails ? 'Loading description...' : details.overview}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={toggleMyList}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isInList ? 'btn-danger' : 'btn-primary'
                }`}
              >
                {isInList ? 'Remove from My List' : 'Add to My List'}
              </button>

              {normalizedType === 'movie' ? (
                <button
                  onClick={handlePlayMovie}
                  className="px-4 py-2 rounded-lg btn-ghost transition-colors"
                >
                  Play Movie
                </button>
              ) : (
                <button
                  onClick={handleResumeSeries}
                  className="px-4 py-2 rounded-lg btn-ghost transition-colors"
                >
                  {lastWatchedEpisodeKey ? 'Resume Last Watched' : 'Start Series'}
                </button>
              )}

              <VideoSourceSelector
                currentSource={currentSource}
                onSourceChange={(index) => {
                  setCurrentSource(index);
                  if (!currentVideo) {
                    return;
                  }

                  setCurrentVideo({
                    ...currentVideo,
                    url: VIDEO_SOURCES[index].getUrl(
                      currentVideo.imdbID,
                      currentVideo.season,
                      currentVideo.episode
                    )
                  });
                }}
              />
            </div>

            {normalizedType === 'series' && lastWatchedEpisodeKey && (
              <p className="mt-4 text-sm muted-copy">Last watched episode: {lastWatchedEpisodeKey}</p>
            )}
          </div>
        </section>

        {currentVideo && (
          <section className="mb-8">
            {currentVideo.type === 'movie' ? (
              <MoviePlayer title={currentVideo.title} url={currentVideo.url || ''} />
            ) : (
              <TVShowPlayer
                title={currentVideo.title}
                url={currentVideo.url || ''}
                season={currentVideo.season || ''}
                episode={currentVideo.episode || ''}
                episodeTitle={currentVideo.episodeTitle}
                imdbID={currentVideo.imdbID}
                tmdbId={currentVideo.tmdbId}
                poster={currentVideo.poster}
                onLoadPreviousEpisode={handleLoadPreviousEpisode}
                onLoadNextEpisode={handleLoadNextEpisode}
                currentSource={currentSource}
              />
            )}
          </section>
        )}

        {normalizedType === 'series' && seasons.length > 0 && (
          <section>
            <div className="mb-4">
              <select
                value={selectedSeason}
                onChange={(event) => setSelectedSeason(event.target.value)}
                className="px-4 py-2 rounded-lg frost-panel text-white border border-zinc-600"
              >
                {seasons.map((season) => (
                  <option key={season.seasonNumber} value={season.seasonNumber}>
                    Season {season.seasonNumber}
                  </option>
                ))}
              </select>
            </div>

            <EpisodesGrid
              season={selectedSeasonData}
              selectedSeason={selectedSeason}
              currentEpisode={currentVideo?.episode}
              currentSeason={currentVideo?.season}
              onEpisodeSelect={handleEpisodeSelect}
              watchedEpisodes={watchedEpisodeKeys}
              lastWatchedEpisodeKey={lastWatchedEpisodeKey}
            />
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MediaDetailsPage;
