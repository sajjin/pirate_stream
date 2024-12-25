import React from 'react';
import { VideoPlayer } from './VideoPlayers';

interface MoviePlayerProps {
  title: string;
  url: string;
}

export const MoviePlayer: React.FC<MoviePlayerProps> = ({ title, url }) => {
  return (
    <div className="w-full bg-zinc-900 rounded-lg overflow-hidden">
      <div className="p-4">
        <h2 className="text-xl font-semibold">Now Playing: {title}</h2>
      </div>
      <VideoPlayer url={url} title={title} />
    </div>
  );
};