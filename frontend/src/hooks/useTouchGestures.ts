import { useRef, useEffect } from 'react';

interface TouchGesturesOptions {
  onZoom?: (scale: number) => void;
  onPan?: (x: number, y: number) => void;
  minScale?: number;
  maxScale?: number;
  maxPanX?: number;
  maxPanY?: number;
  maxPanLeft?: number;   // Max pan to the left (negative X)
  maxPanRight?: number;  // Max pan to the right (positive X)
  maxPanUp?: number;     // Max pan up (negative Y)
  maxPanDown?: number;   // Max pan down (positive Y)
}

export function useTouchGestures({
  onZoom,
  onPan,
  minScale = 0.5,
  maxScale = 3,
  maxPanX = 500,
  maxPanY = 500,
  maxPanLeft,
  maxPanRight,
  maxPanUp,
  maxPanDown,
}: TouchGesturesOptions) {
  // Use asymmetric limits if provided, otherwise fall back to symmetric
  const panLeftLimit = maxPanLeft ?? maxPanX;
  const panRightLimit = maxPanRight ?? maxPanX;
  const panUpLimit = maxPanUp ?? maxPanY;
  const panDownLimit = maxPanDown ?? maxPanY;
  const containerRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(1);
  const translateRef = useRef({ x: 0, y: 0 });
  const lastTouchDistanceRef = useRef<number | null>(null);
  const lastTouchCenterRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch gesture
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        lastTouchDistanceRef.current = distance;

        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        lastTouchCenterRef.current = { x: centerX, y: centerY };
      } else if (e.touches.length === 1) {
        // Pan gesture
        const touch = e.touches[0];
        lastTouchCenterRef.current = { x: touch.clientX, y: touch.clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();

      if (e.touches.length === 2 && lastTouchDistanceRef.current !== null) {
        // Pinch zoom
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );

        const scaleChange = distance / lastTouchDistanceRef.current;
        const newScale = Math.max(
          minScale,
          Math.min(maxScale, scaleRef.current * scaleChange)
        );

        scaleRef.current = newScale;
        lastTouchDistanceRef.current = distance;

        if (onZoom) {
          onZoom(newScale);
        }
      } else if (e.touches.length === 1 && lastTouchCenterRef.current) {
        // Pan
        const touch = e.touches[0];
        const deltaX = touch.clientX - lastTouchCenterRef.current.x;
        const deltaY = touch.clientY - lastTouchCenterRef.current.y;

        // Apply asymmetric constraints to prevent infinite panning
        const newX = translateRef.current.x + deltaX;
        const newY = translateRef.current.y + deltaY;

        // Clamp X: negative = pan left (show right content), positive = pan right (show left content)
        translateRef.current.x = Math.max(-panLeftLimit, Math.min(panRightLimit, newX));
        // Clamp Y: negative = pan up (show bottom content), positive = pan down (show top content)
        translateRef.current.y = Math.max(-panUpLimit, Math.min(panDownLimit, newY));

        lastTouchCenterRef.current = { x: touch.clientX, y: touch.clientY };

        if (onPan) {
          onPan(translateRef.current.x, translateRef.current.y);
        }
      }
    };

    const handleTouchEnd = () => {
      lastTouchDistanceRef.current = null;
      lastTouchCenterRef.current = null;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onZoom, onPan, minScale, maxScale, panLeftLimit, panRightLimit, panUpLimit, panDownLimit]);

  return containerRef;
}

