import React, { useEffect, useRef, useState } from 'react';

// Type declarations for webkit prefixed properties
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

  const requestFullscreen = async (element: HTMLElement) => {
    try {
      const webkitElement = element as WebkitHTMLElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (webkitElement.webkitRequestFullscreen) {
        await webkitElement.webkitRequestFullscreen();
      }
      setAutoEnteredFullscreen(true);
    } catch (err) {
      console.error('Error requesting fullscreen:', err);
    }
  };

  const exitFullscreen = async () => {
    try {
      const webkitDoc = document as WebkitDocument;
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (webkitDoc.webkitFullscreenElement && webkitDoc.webkitExitFullscreen) {
        await webkitDoc.webkitExitFullscreen();
      }
      setAutoEnteredFullscreen(false);
    } catch (err) {
      console.error('Error exiting fullscreen:', err);
    }
  };

  const checkOrientation = () => {
    // Check screen.orientation.type first
    if (window.screen?.orientation?.type) {
      return window.screen.orientation.type.includes('landscape');
    }
    
    // Fallback to window.orientation
    if (window.orientation !== undefined) {
      return Math.abs(window.orientation) === 90;
    }
    
    // Default to false if neither method is available
    return false;
  };

  const handleOrientationChange = async () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (!isMobile || !containerRef.current) return;

    // Clear any existing timeout
    if (orientationChangeTimeoutRef.current) {
      clearTimeout(orientationChangeTimeoutRef.current);
    }

    // Add a small delay to ensure the orientation change is complete
    orientationChangeTimeoutRef.current = setTimeout(async () => {
      const nowLandscape = checkOrientation();
      setIsLandscape(nowLandscape);

      const webkitDoc = document as WebkitDocument;
      if (nowLandscape && !document.fullscreenElement && !webkitDoc.webkitFullscreenElement) {
        await requestFullscreen(containerRef.current!);
      } else if (!nowLandscape && autoEnteredFullscreen) {
        await exitFullscreen();
      }
    }, 150);
  };

  useEffect(() => {
    // Initial orientation check
    setIsLandscape(checkOrientation());

    // Setup orientation change detection using multiple approaches
    const screenOrientation = window.screen?.orientation;

    if (screenOrientation) {
      screenOrientation.addEventListener('change', handleOrientationChange);
    }

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    // Handle fullscreen changes
    const handleFullscreenChange = () => {
      const webkitDoc = document as WebkitDocument;
      if (!document.fullscreenElement && !webkitDoc.webkitFullscreenElement) {
        setAutoEnteredFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    // Cleanup
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
    };
  }, []);

  // Re-attempt fullscreen when url changes
  useEffect(() => {
    if (isLandscape) {
      const webkitDoc = document as WebkitDocument;
      if (!document.fullscreenElement && !webkitDoc.webkitFullscreenElement) {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile && containerRef.current) {
          requestFullscreen(containerRef.current);
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
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        style={{ border: 'none' }}
      />
    </div>
  );
};

export default EnhancedVideoPlayer;