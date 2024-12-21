import React, { useEffect, useRef, useState } from 'react';

interface WebkitDocument extends Document {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
}

interface WebkitHTMLElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
}

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
  const [isLandscape, setIsLandscape] = useState(false);
  const orientationChangeTimeoutRef = useRef<NodeJS.Timeout>();
  const fullscreenExitAttempted = useRef(false);

  const requestFullscreen = async (element: HTMLElement) => {
    try {
      const webkitElement = element as WebkitHTMLElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
        setAutoEnteredFullscreen(true);
      } else if (webkitElement.webkitRequestFullscreen) {
        await webkitElement.webkitRequestFullscreen();
        setAutoEnteredFullscreen(true);
      }
    } catch (err) {
      console.error('Error requesting fullscreen:', err);
    }
  };

  const exitFullscreen = async () => {
    try {
      const webkitDoc = document as WebkitDocument;
      fullscreenExitAttempted.current = true;

      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (webkitDoc.webkitFullscreenElement && webkitDoc.webkitExitFullscreen) {
        await webkitDoc.webkitExitFullscreen();
      }
    } catch (err) {
      console.error('Error exiting fullscreen:', err);
    } finally {
      setAutoEnteredFullscreen(false);
      setTimeout(() => {
        fullscreenExitAttempted.current = false;
      }, 300);
    }
  };

  const checkOrientation = () => {
    if (window.screen?.orientation?.type) {
      return window.screen.orientation.type.includes('landscape');
    }
    if (window.orientation !== undefined) {
      return Math.abs(window.orientation) === 90;
    }
    return false;
  };

  const handleOrientationChange = async () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (!isMobile || !containerRef.current) return;

    if (orientationChangeTimeoutRef.current) {
      clearTimeout(orientationChangeTimeoutRef.current);
    }

    orientationChangeTimeoutRef.current = setTimeout(async () => {
      const nowLandscape = checkOrientation();
      setIsLandscape(nowLandscape);

      // Try to use the iframe for fullscreen instead of the container
      const iframe = iframeRef.current;
      const webkitDoc = document as WebkitDocument;
      
      if (nowLandscape && !document.fullscreenElement && !webkitDoc.webkitFullscreenElement && iframe) {
        await requestFullscreen(iframe);
      } else if (!nowLandscape && autoEnteredFullscreen && !fullscreenExitAttempted.current) {
        await exitFullscreen();
      }
    }, 150);
  };

  useEffect(() => {
    setIsLandscape(checkOrientation());

    const screenOrientation = window.screen?.orientation;
    if (screenOrientation) {
      screenOrientation.addEventListener('change', handleOrientationChange);
    }

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    const handleFullscreenChange = () => {
      const webkitDoc = document as WebkitDocument;
      const isCurrentlyFullscreen = !!(document.fullscreenElement || webkitDoc.webkitFullscreenElement);
      
      if (!isCurrentlyFullscreen && autoEnteredFullscreen && !fullscreenExitAttempted.current) {
        setAutoEnteredFullscreen(false);
        const nowLandscape = checkOrientation();
        if (!nowLandscape) {
          exitFullscreen();
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      if (screenOrientation) {
        screenOrientation.removeEventListener('change', handleOrientationChange);
      }
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      
      if (orientationChangeTimeoutRef.current) {
        clearTimeout(orientationChangeTimeoutRef.current);
      }

      if (autoEnteredFullscreen) {
        exitFullscreen();
      }
    };
  }, []);

  useEffect(() => {
    if (isLandscape) {
      const webkitDoc = document as WebkitDocument;
      if (!document.fullscreenElement && !webkitDoc.webkitFullscreenElement) {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile && iframeRef.current) {
          requestFullscreen(iframeRef.current);
        }
      }
    }
  }, [url, isLandscape]);

  return (
    <div
      className="relative w-full bg-black"
      style={{
        paddingTop: '56.25%',
      }}
    >
      <iframe
        ref={iframeRef}
        src={url}
        title={title}
        className="absolute top-0 left-0 w-full h-full"
        allowFullScreen
        scrolling="no"
        allow="autoplay; fullscreen; picture-in-picture"
        style={{ 
          border: 'none',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
};

export default EnhancedVideoPlayer;