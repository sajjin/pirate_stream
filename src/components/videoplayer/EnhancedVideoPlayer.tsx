import React, { useEffect, useRef, useState } from 'react';

interface EnhancedVideoPlayerProps {
  url: string;
  title: string;
  containerRef: React.RefObject<HTMLDivElement>;
}

const EnhancedVideoPlayer: React.FC<EnhancedVideoPlayerProps> = ({
  url,
  title,
  containerRef
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [autoEnteredFullscreen, setAutoEnteredFullscreen] = useState(false);

  useEffect(() => {
    const handleOrientation = () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile && iframeRef.current) {
        if (Math.abs(window.orientation) === 90) {
          // Request fullscreen on the iframe directly
          if (iframeRef.current.requestFullscreen) {
            iframeRef.current.requestFullscreen()
              .then(() => {
                setAutoEnteredFullscreen(true);
              })
              .catch((err: Error) => {
                console.log('Error attempting to enable fullscreen:', err);
              });
          } else if ((iframeRef.current as any).webkitRequestFullscreen) {
            (iframeRef.current as any).webkitRequestFullscreen()
              .then(() => {
                setAutoEnteredFullscreen(true);
              })
              .catch((err: Error) => {
                console.log('Error attempting to enable webkit fullscreen:', err);
              });
          }
        } else if (autoEnteredFullscreen) {
          // Only exit if we auto-entered fullscreen
          if (document.fullscreenElement) {
            document.exitFullscreen()
              .then(() => {
                setAutoEnteredFullscreen(false);
              })
              .catch((err: Error) => {
                console.log('Error attempting to exit fullscreen:', err);
              });
          } else if ((document as any).webkitFullscreenElement) {
            (document as any).webkitExitFullscreen()
              .then(() => {
                setAutoEnteredFullscreen(false);
              })
              .catch((err: Error) => {
                console.log('Error attempting to exit webkit fullscreen:', err);
              });
          }
        }
      }
    };

    const handleFullscreenChange = () => {
      // Reset auto-entered state if user exits fullscreen manually
      if (!document.fullscreenElement) {
        setAutoEnteredFullscreen(false);
      }
    };

    window.addEventListener('orientationchange', handleOrientation);
    window.addEventListener('resize', handleOrientation);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientation);
      window.removeEventListener('resize', handleOrientation);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [autoEnteredFullscreen]);

  return (
    <div 
      className="relative w-full bg-black"
      style={{
        paddingTop: '56.25%'
      }}
    >
      <iframe
        ref={iframeRef}
        src={url}
        title={title}
        className="absolute top-0 left-0 w-full h-full"
        allowFullScreen
        allow="fullscreen"
      />
    </div>
  );
};

export default EnhancedVideoPlayer;