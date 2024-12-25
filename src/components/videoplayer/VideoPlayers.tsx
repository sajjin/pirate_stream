import React, { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  url: string;
  title: string;
  onTimeUpdate?: (time: number) => void;
  onDurationChange?: (duration: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  url, 
  title,
  onTimeUpdate,
  onDurationChange
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin matches your video source
      // Replace with your actual video source origin
      // if (event.origin !== "https://your-video-source.com") return;
      
      try {
        const data = event.data;
        
        // Handle different message types from the video player iframe
        if (typeof data === 'object' && data !== null) {
          if (data.type === 'timeupdate' && onTimeUpdate) {
            onTimeUpdate(data.currentTime);
          }
          if (data.type === 'durationchange' && onDurationChange) {
            onDurationChange(data.duration);
          }
        }
      } catch (error) {
        console.error('Error processing video player message:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onTimeUpdate, onDurationChange]);

  return (
    <div className="relative w-full bg-black" style={{ paddingTop: '56.25%' }}>
      <iframe 
        ref={iframeRef}
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