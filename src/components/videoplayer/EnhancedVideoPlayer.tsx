import React, { useEffect, useRef, useState } from 'react';

interface EnhancedVideoPlayerProps {
  url: string;
  title: string;
  containerRef: React.RefObject<HTMLDivElement>;
  onNearEnd?: () => void; // Callback when video is near end
  nearEndThreshold?: number; // Percentage of video remaining to trigger onNearEnd
}

const EnhancedVideoPlayer: React.FC<EnhancedVideoPlayerProps> = ({
  url,
  title,
  containerRef,
  onNearEnd,
  nearEndThreshold = 5 // Default to 5% remaining
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [autoEnteredFullscreen, setAutoEnteredFullscreen] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const hasTriggeredNearEnd = useRef(false);

  useEffect(() => {
    // Setup message listener for iframe communication
    const handleMessage = (event: MessageEvent) => {
      // Verify message origin for security
      if (event.origin !== new URL(url).origin) return;

      try {
        const data = JSON.parse(event.data);
        
        // Handle different message types from the video player
        if (data.type === 'duration') {
          setDuration(data.value);
        } else if (data.type === 'timeupdate') {
          setCurrentTime(data.value);
          
          // Check if video is near end
          if (duration && !hasTriggeredNearEnd.current) {
            const percentageRemaining = ((duration - data.value) / duration) * 100;
            if (percentageRemaining <= nearEndThreshold) {
              hasTriggeredNearEnd.current = true;
              onNearEnd?.();
            }
          }
        }
      } catch (error) {
        console.error('Error processing video player message:', error);
      }
    };

    window.addEventListener('message', handleMessage);

    // Inject script to communicate with video player
    const injectPlayerScript = () => {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        const script = `
          // Monitor video element
          const video = document.querySelector('video');
          if (video) {
            // Send initial duration
            window.parent.postMessage(JSON.stringify({
              type: 'duration',
              value: video.duration
            }), '*');

            // Send time updates
            video.addEventListener('timeupdate', () => {
              window.parent.postMessage(JSON.stringify({
                type: 'timeupdate',
                value: video.currentTime
              }), '*');
            });
          }
        `;

        try {
          iframe.contentWindow.postMessage({ type: 'inject-script', script }, '*');
        } catch (error) {
          console.error('Error injecting player script:', error);
        }
      }
    };

    // Try to inject script after iframe loads
    if (iframeRef.current) {
      iframeRef.current.addEventListener('load', injectPlayerScript);
    }

    const handleOrientation = () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile && iframeRef.current) {
        if (Math.abs(window.orientation) === 90) {
          if (iframeRef.current.requestFullscreen) {
            iframeRef.current.requestFullscreen()
              .then(() => setAutoEnteredFullscreen(true))
              .catch(err => console.error('Fullscreen error:', err));
          } else if ((iframeRef.current as any).webkitRequestFullscreen) {
            (iframeRef.current as HTMLIFrameElement & { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen?.()
              .then(() => setAutoEnteredFullscreen(true))
              .catch(err => console.error('Webkit fullscreen error:', err));
          }
        } else if (autoEnteredFullscreen) {
          if (document.exitFullscreen) {
            document.exitFullscreen()
              .then(() => setAutoEnteredFullscreen(false))
              .catch(err => console.error('Exit fullscreen error:', err));
          } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen()
              .then(() => setAutoEnteredFullscreen(false))
              .catch((err: unknown) => console.error('Exit webkit fullscreen error:', err));
          }
        }
      }
    };

    window.addEventListener('orientationchange', handleOrientation);
    window.addEventListener('resize', handleOrientation);

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('orientationchange', handleOrientation);
      window.removeEventListener('resize', handleOrientation);
      if (iframeRef.current) {
        iframeRef.current.removeEventListener('load', injectPlayerScript);
      }
    };
  }, [url, duration, onNearEnd, nearEndThreshold, autoEnteredFullscreen]);

  // Reset near-end flag when URL changes
  useEffect(() => {
    hasTriggeredNearEnd.current = false;
  }, [url]);

  return (
    <div
      className="relative w-full bg-black"
      style={{ paddingTop: '56.25%' }}
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