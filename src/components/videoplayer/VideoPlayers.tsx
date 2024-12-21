import React from 'react';

interface VideoPlayerProps {
  url: string;
  title: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title }) => {
  return (
    <div className="relative w-full bg-black" style={{ paddingTop: '56.25%' }}>
      <iframe 
        allowFullScreen 
        scrolling="no" 
        src={url}
        title={title}
        className="absolute top-0 left-0 w-full h-full"
        style={{ border: 'none' }}
      />
    </div>
  );
};