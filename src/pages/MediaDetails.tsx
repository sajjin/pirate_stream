import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/footer';
import VideoSourceSelector, { VIDEO_SOURCES } from '../components/VideoSourceSelector';
import { MoviePlayer } from '../components/videoplayer/MoviePlayer';
import { TVShowPlayer } from '../components/videoplayer/TVShowPlayer';
import { EpisodesGrid } from '../components/EpisodesGrid';
import { Episode, SearchResult, Season, VideoInfo } from '../types';
import { fetchEpisodeRuntime, fetchMovieRuntime, fetchSeasonData } from '../components/videoplayer/videoHandlers';
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

const formatLastPlayedLabel = (timestamp?: number) => {
  if (!timestamp) {
    return 'Not played yet';
  }

  return new Date(timestamp).toLocaleString();
};

const formatRuntimeLabel = (seconds: number) => {
  const clampedSeconds = Math.max(0, seconds);
  const hours = Math.floor(clampedSeconds / 3600);
  const minutes = Math.floor((clampedSeconds % 3600) / 60);
  const remainingSeconds = clampedSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds}s`;
};

const getVideoTrackingKey = (video: VideoInfo | null) => {
  if (!video) {
    return '';
  }

  if (video.type === 'series') {
    return `${video.imdbID}::${video.type}::${video.season || '0'}::${video.episode || '0'}`;
  }

  return `${video.imdbID}::${video.type}`;
};

const PLAY_SIGNAL_PATTERN = /\b(play|playing|resume|resumed|start|started|timeupdate|progress)\b/i;
const PAUSE_SIGNAL_PATTERN = /\b(pause|paused|stop|stopped|ended|idle)\b/i;

const stringifyMessagePayload = (payload: unknown): string => {
  if (typeof payload === 'string') {
    return payload.toLowerCase();
  }

  if (payload && typeof payload === 'object') {
    try {
      return JSON.stringify(payload).toLowerCase();
    } catch {
      return '';
    }
  }

  return '';
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
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const playbackSecondsRef = useRef(0);
  const autoAdvancedRef = useRef(false);
  const hasHeardAudioRef = useRef(false);
  const [tempSeconds, setTempSeconds] = useState(0);
  const [usesTempTimer, setUsesTempTimer] = useState(false);
  const [lastPlayedAt, setLastPlayedAt] = useState<number | undefined>(undefined);
  const [isTabActive, setIsTabActive] = useState(document.visibilityState === 'visible' && document.hasFocus());
  const [isPlayerPlaying, setIsPlayerPlaying] = useState(false);
  const [hasPlaybackSignal, setHasPlaybackSignal] = useState(false);
  const [manualPlaying, setManualPlaying] = useState(false);
  const [isProgressHydrated, setIsProgressHydrated] = useState(false);
  const [extensionBridgeActive, setExtensionBridgeActive] = useState(false);
  const [extensionAudible, setExtensionAudible] = useState(false);

  const trackingKey = getVideoTrackingKey(currentVideo);
  const isUsingExtensionClock = extensionBridgeActive;
  const isPlaybackClockRunning =
    isTabActive &&
    (isUsingExtensionClock ? extensionAudible : hasPlaybackSignal ? isPlayerPlaying : manualPlaying);

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

    const loadAll = async () => {
      setIsInList(await myListService.isInList(imdbID));
      await fetchMediaDetails();
      await refreshEpisodeTracking();
    };

    loadAll();
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

  const persistTrackedProgress = async (videoInfo: VideoInfo, watchedSeconds: number) => {
    try {
      await watchHistorySync.saveProgress(videoInfo, watchedSeconds);
      setLastPlayedAt(Date.now());
    } catch (error) {
      console.error('Failed to persist tracked progress:', error);
    }
  };

  const handlePlayMovie = async () => {
    const runtime = details.tmdbId ? await fetchMovieRuntime(details.tmdbId) : 0;

    const videoInfo: VideoInfo = {
      imdbID,
      title: details.title,
      type: 'movie',
      tmdbId: details.tmdbId,
      poster: details.poster,
      runtime,
      timestamp: Date.now(),
      url: VIDEO_SOURCES[currentSource].getUrl(imdbID)
    };

    setCurrentVideo(videoInfo);
    setManualPlaying(true);
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
    setManualPlaying(true);

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

  const toggleMyList = async () => {
    if (isInList) {
      await myListService.remove(imdbID);
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

    await myListService.add(item);
    setIsInList(true);
  };

  useEffect(() => {
    const updateActiveState = () => {
      setIsTabActive(document.visibilityState === 'visible' && document.hasFocus());
    };

    document.addEventListener('visibilitychange', updateActiveState);
    window.addEventListener('focus', updateActiveState);
    window.addEventListener('blur', updateActiveState);

    return () => {
      document.removeEventListener('visibilitychange', updateActiveState);
      window.removeEventListener('focus', updateActiveState);
      window.removeEventListener('blur', updateActiveState);
    };
  }, []);

  useEffect(() => {
    if (!currentVideo) {
      return;
    }

    const currentVideoOrigin = (() => {
      try {
        return new URL(currentVideo.url || '').origin;
      } catch {
        return '';
      }
    })();

    const handleMessage = (event: MessageEvent) => {
      if (!currentVideoOrigin) {
        return;
      }

      const isLikelyPlayerOrigin =
        event.origin === currentVideoOrigin ||
        event.origin.endsWith('.vidsrc.xyz') ||
        event.origin.endsWith('.multiembed.mov');

      if (!isLikelyPlayerOrigin) {
        return;
      }

      const payloadText = stringifyMessagePayload(event.data);
      if (!payloadText) {
        return;
      }

      const hasPlaySignal = PLAY_SIGNAL_PATTERN.test(payloadText);
      const hasPauseSignal = PAUSE_SIGNAL_PATTERN.test(payloadText);

      if (!hasPlaySignal && !hasPauseSignal) {
        return;
      }

      setHasPlaybackSignal(true);

      if (hasPauseSignal && !hasPlaySignal) {
        setIsPlayerPlaying(false);
        return;
      }

      if (hasPlaySignal) {
        setIsPlayerPlaying(true);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [currentVideo?.url]);

  useEffect(() => {
    if (!currentVideo) {
      setIsPlayerPlaying(false);
      setHasPlaybackSignal(false);
      setManualPlaying(false);
      setIsProgressHydrated(false);
      setPlaybackSeconds(0);
      setExtensionBridgeActive(false);
      setExtensionAudible(false);
      return;
    }

    setIsPlayerPlaying(false);
    setHasPlaybackSignal(false);
    setManualPlaying(true);
    setIsProgressHydrated(false);
    setPlaybackSeconds(0);
    setExtensionBridgeActive(false);
    setExtensionAudible(false);
  }, [currentVideo?.imdbID, currentVideo?.type, currentVideo?.season, currentVideo?.episode, currentVideo?.url]);

  useEffect(() => {
    if (!currentVideo) {
      return;
    }

    let isSubscribed = true;
    setIsProgressHydrated(false);

    const hydrateProgress = async () => {
      const existing = await watchHistorySync.getProgressForVideo(currentVideo);
      if (!isSubscribed) {
        return;
      }

      const savedSeconds = Math.max(0, Number(existing?.progressSeconds || 0));
      setPlaybackSeconds(savedSeconds);
      setLastPlayedAt(existing?.lastPlayedAt);
      setIsProgressHydrated(true);
    };

    hydrateProgress();

    return () => {
      isSubscribed = false;
    };
  }, [currentVideo?.imdbID, currentVideo?.type, currentVideo?.season, currentVideo?.episode]);

  useEffect(() => {
    if (!currentVideo || !trackingKey || !isProgressHydrated) {
      return;
    }

    window.postMessage(
      {
        type: 'PS_TRACK_START',
        key: trackingKey,
        initialSeconds: playbackSeconds,
        runtimeSeconds: (currentVideo.runtime || 0) * 60
      },
      '*'
    );

    return () => {
      window.postMessage(
        {
          type: 'PS_TRACK_STOP',
          key: trackingKey
        },
        '*'
      );
    };
  }, [trackingKey, currentVideo?.url, isProgressHydrated]);

  useEffect(() => {
    const handleExtensionMessage = (event: MessageEvent) => {
      if (event.source !== window) {
        return;
      }

      const data = event.data;
      if (!data || typeof data !== 'object') {
        return;
      }

      if (data.type !== 'PS_EXTENSION_AUDIO_RUNTIME_UPDATE') {
        return;
      }

      const messageKey = typeof data.key === 'string' ? data.key : '';
      if (!messageKey || messageKey !== trackingKey) {
        return;
      }

      setExtensionBridgeActive(true);
      setExtensionAudible(Boolean(data.audible));
      setUsesTempTimer(Boolean(data.usesTempTimer));
      setTempSeconds(Number(data.tempSeconds || 0));

      const extensionSeconds = Number(data.seconds || 0);
      if (Number.isFinite(extensionSeconds) && extensionSeconds >= 0) {
        // Clamp to runtime to prevent display overage
        const cappedSeconds = currentVideo?.runtime
          ? Math.min(extensionSeconds, currentVideo.runtime * 60)
          : extensionSeconds;
        setPlaybackSeconds(cappedSeconds);
      }
    };

    window.addEventListener('message', handleExtensionMessage);

    return () => {
      window.removeEventListener('message', handleExtensionMessage);
    };
  }, [trackingKey, currentVideo?.runtime]);

  // Reset the auto-advance guard AND playback seconds ref whenever the episode changes,
  // so the auto-advance effect won't see stale seconds from the previous episode.
  useEffect(() => {
    autoAdvancedRef.current = false;
    playbackSecondsRef.current = 0;
    hasHeardAudioRef.current = false;
    setTempSeconds(0);
    setUsesTempTimer(false);
  }, [currentVideo?.imdbID, currentVideo?.season, currentVideo?.episode]);

  const clickPageCenter = async (times: number) => {
    for (let i = 0; i < times; i++) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      const element = document.elementFromPoint(centerX, centerY);
      if (element) {
        element.dispatchEvent(new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        }));
      }
      
      // Small delay between clicks
      if (i < times - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  };

  // Auto-advance to next episode when extension goes silent after 90% of runtime
  useEffect(() => {
    // Track that audio was detected at least once for this episode
    if (extensionBridgeActive && extensionAudible) {
      hasHeardAudioRef.current = true;
    }

    if (
      !currentVideo ||
      currentVideo.type !== 'series' ||
      !extensionBridgeActive ||
      extensionAudible ||
      !hasHeardAudioRef.current ||
      autoAdvancedRef.current
    ) {
      return;
    }

    const runtimeSeconds = (currentVideo.runtime || 0) * 60;
    // Use tempSeconds if we've switched to the session timer, otherwise use the main timer
    const checkSeconds = usesTempTimer ? tempSeconds : playbackSecondsRef.current;
    
    if (runtimeSeconds <= 0 || checkSeconds < runtimeSeconds * 0.9) {
      return;
    }

    autoAdvancedRef.current = true;
    
    // Determine click count based on source: Source 1 (index 0) = 2 clicks, Source 2 (index 1) = 1 click
    const clickCount = currentSource === 0 ? 2 : 1;
    
    // Click and then advance
    clickPageCenter(clickCount).then(() => {
      handleLoadNextEpisode();
    });
  }, [extensionAudible, extensionBridgeActive, currentVideo, seasons, usesTempTimer, tempSeconds, currentSource]);

  useEffect(() => {
    if (!currentVideo || !isPlaybackClockRunning || isUsingExtensionClock) {
      return;
    }

    const interval = window.setInterval(() => {
      setPlaybackSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [currentVideo, isPlaybackClockRunning, isUsingExtensionClock]);

  useEffect(() => {
    playbackSecondsRef.current = playbackSeconds;
  }, [playbackSeconds]);

  useEffect(() => {
    if (!currentVideo || !isProgressHydrated) {
      return;
    }

    if (playbackSeconds <= 0) {
      return;
    }

    if (playbackSeconds % 10 !== 0) {
      return;
    }

    persistTrackedProgress(currentVideo, playbackSeconds);
  }, [playbackSeconds, currentVideo, isProgressHydrated]);

  useEffect(() => {
    if (!currentVideo) {
      return;
    }

    if (!isPlaybackClockRunning) {
      if (playbackSecondsRef.current <= 0) {
        return;
      }

      persistTrackedProgress(currentVideo, playbackSecondsRef.current);
    }
  }, [isPlaybackClockRunning, currentVideo]);

  useEffect(() => {
    return () => {
      if (!currentVideo || playbackSecondsRef.current <= 0) {
        return;
      }

      persistTrackedProgress(currentVideo, playbackSecondsRef.current);
    };
  }, [currentVideo]);

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
            <div className="mb-3 px-1 text-sm muted-copy">
              <p>
                Last played: {formatLastPlayedLabel(lastPlayedAt)}
              </p>
              <p>
                Watched in this tab: {formatRuntimeLabel(
                  usesTempTimer
                    ? tempSeconds
                    : currentVideo.runtime
                      ? Math.min(playbackSeconds, currentVideo.runtime * 60)
                      : playbackSeconds
                )}
                {currentVideo.runtime ? ` / Runtime: ${currentVideo.runtime}m` : ''}
              </p>
              {!isTabActive && <p>Playback tracking paused because tab is not active.</p>}
              {isUsingExtensionClock && isTabActive && !extensionAudible && (
                <p>Playback tracking paused because tab audio is not active.</p>
              )}
              {!isUsingExtensionClock && isTabActive && !isPlayerPlaying && hasPlaybackSignal && (
                <p>Playback tracking paused because player is paused.</p>
              )}
              {!isUsingExtensionClock && !hasPlaybackSignal && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <p>Source did not send play/pause events. Use manual tracking:</p>
                  <button
                    onClick={() => setManualPlaying((prev) => !prev)}
                    className="px-3 py-1 rounded-md btn-ghost transition-colors"
                  >
                    {manualPlaying ? 'Pause Tracking' : 'Start Tracking'}
                  </button>
                </div>
              )}
              {isUsingExtensionClock && <p>Tracking source: Chrome audio extension</p>}
            </div>
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
