import React, { useEffect, useState } from 'react';
import EnhancedVideoPlayer from './EnhancedVideoPlayer';
import { SimpleVideoPlayer } from './SimpleVideoPlayer';

interface ConditionalVideoPlayerProps {
  url: string;
  title: string;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const ConditionalVideoPlayer: React.FC<ConditionalVideoPlayerProps> = ({
  url,
  title,
  containerRef,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      const isTouch = ('ontouchstart' in window) || 
                      (navigator.maxTouchPoints > 0);
      setIsMobile(userAgent && isTouch);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <EnhancedVideoPlayer 
        url={url} 
        title={title}
        containerRef={containerRef}
      />
    );
  }

  return <SimpleVideoPlayer url={url} title={title} />;
};
