import React from 'react';
import { ConditionalVideoPlayer } from './ConditionalVideoPlayer';

interface MoviePlayerProps {
  title: string;
  url: string;
}

export const MoviePlayer: React.FC<MoviePlayerProps> = ({ title, url }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="w-full bg-zinc-900 rounded-lg overflow-hidden" ref={containerRef}>
      <div className="p-4">
        <h2 className="text-xl font-semibold">Now Playing: {title}</h2>
      </div>
      <ConditionalVideoPlayer 
        url={url} 
        title={title}
        containerRef={containerRef}
      />
    </div>
  );
};
