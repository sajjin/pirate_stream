import React from 'react';

interface SimpleVideoPlayerProps {
  url: string;
  title: string;
}

export const SimpleVideoPlayer: React.FC<SimpleVideoPlayerProps> = ({ url, title }) => {
  return (
    <div className="relative w-full bg-black" style={{ paddingTop: '56.25%' }}>
      <iframe
        src={url}
        title={title}
        className="absolute top-0 left-0 w-full h-full"
        allowFullScreen
        scrolling="no"
        allow="autoplay; fullscreen; picture-in-picture"
        style={{ border: 'none' }}
      />
    </div>
  );
};