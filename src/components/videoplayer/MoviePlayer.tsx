import React from 'react';
import EnhancedVideoPlayer from './EnhancedVideoPlayer';


interface MoviePlayerProps {
  title: string;
  url: string;
}

export const MoviePlayer: React.FC<MoviePlayerProps> = ({ title, url }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="w-full bg-zinc-900 rounded-lg overflow-hidden" ref={containerRef}>
      <div className="p-4">
      </div>
      <EnhancedVideoPlayer 
          url={url} 
          title={title}
          containerRef={containerRef}
        />
    </div>
  );
};