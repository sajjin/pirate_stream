import React from 'react';

export type VideoSource = {
  name: string;
  getUrl: (imdbId: string, season?: string, episode?: string) => string;
};

export const VIDEO_SOURCES: VideoSource[] = [
  {
    name: 'Source 1 (better quality but may hitch)',
    getUrl: (imdbId, season, episode) =>
      season && episode
        ? `https://vidsrc.dev/embed/tv/${imdbId}/${season}/${episode}`
        : `https://vidsrc.dev/embed/movie/${imdbId}`
  },
  {
    name: 'Source 2 (faster but lower quality)',
    getUrl: (imdbId, season, episode) =>
      season && episode
        ? `https://vidsrc.xyz/embed/tv?imdb=${imdbId}&s=${season}&e=${episode}`
        : `https://vidsrc.xyz/embed/movie?imdb=${imdbId}`
  }
];

const VideoSourceSelector = ({
  currentSource,
  onSourceChange
}: {
  currentSource: number;
  onSourceChange: (index: number) => void;
}) => {
  return (
    <select
      value={currentSource}
      onChange={(e) => onSourceChange(Number(e.target.value))}
      className="px-4 py-2 rounded-lg bg-zinc-700 text-white border border-zinc-600"
    >
      {VIDEO_SOURCES.map((source, index) => (
        <option key={index} value={index}>
          {source.name}
        </option>
      ))}
    </select>
  );
};

export default VideoSourceSelector;