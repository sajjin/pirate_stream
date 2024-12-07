import React from 'react';

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
      <div className="relative w-full pt-[56.25%] mb-8">
        <iframe
          src={url}
          className="absolute top-0 left-0 w-full h-full border-0"
          allowFullScreen
        />
      </div>
    </div>
  );
};