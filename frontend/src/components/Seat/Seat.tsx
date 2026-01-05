import { memo, useRef, useEffect, useState } from 'react';
import type { Seat as SeatType } from '../../types/index.js';

interface SeatProps {
  seat: SeatType;
  isSelected: boolean;
  onClick: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  seatRef?: (ref: SVGGElement | null) => void;
  showHeatMap?: boolean;
  isHighlighted?: boolean;
  statusChanged?: boolean;
}

function SeatComponent({ 
  seat, 
  isSelected, 
  onClick, 
  onFocus, 
  onBlur, 
  onKeyDown, 
  seatRef: setSeatRef,
  showHeatMap = false,
  isHighlighted = false,
  statusChanged = false,
}: SeatProps) {
  const isInteractive = seat.status === 'available';
  const statusLabel = seat.status.charAt(0).toUpperCase() + seat.status.slice(1);
  const seatRef = useRef<SVGGElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (setSeatRef) {
      setSeatRef(seatRef.current);
    }
  }, [setSeatRef]);

  // Detect mobile screen size for larger seats
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isInteractive) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    } else if (onKeyDown) {
      onKeyDown(e);
    }
  };

  // Animate on status change
  useEffect(() => {
    if (statusChanged) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [statusChanged]);

  const getColors = () => {
    if (isSelected) {
      return {
        base: '#3b82f6',
        cushion: '#60a5fa',
        dark: '#2563eb',
      };
    }

    // Heat map mode: color by price tier
    if (showHeatMap && seat.status === 'available') {
      const heatMapColors = [
        { base: '#fef3c7', cushion: '#fde68a', dark: '#f59e0b' }, // Tier 1 - Light yellow
        { base: '#fed7aa', cushion: '#fdba74', dark: '#f97316' }, // Tier 2 - Orange
        { base: '#fecaca', cushion: '#fca5a5', dark: '#ef4444' }, // Tier 3 - Red
        { base: '#e9d5ff', cushion: '#d8b4fe', dark: '#a855f7' }, // Tier 4+ - Purple
      ];
      const tierIndex = Math.min(seat.priceTier - 1, heatMapColors.length - 1);
      return heatMapColors[tierIndex] || heatMapColors[0];
    }

    if (isHighlighted && seat.status === 'available') {
      return { base: '#fbbf24', cushion: '#fcd34d', dark: '#f59e0b' };
    }
    
    switch (seat.status) {
      case 'available':
        return { base: '#22c55e', cushion: '#4ade80', dark: '#16a34a' };
      case 'reserved':
        return { base: '#eab308', cushion: '#fbbf24', dark: '#ca8a04' };
      case 'sold':
        return { base: '#ef4444', cushion: '#f87171', dark: '#dc2626' };
      case 'held':
        return { base: '#9ca3af', cushion: '#d1d5db', dark: '#6b7280' };
      default:
        return { base: '#e5e7eb', cushion: '#f3f4f6', dark: '#d1d5db' };
    }
  };

  const colors = getColors();
  // Larger scale on mobile for better touch targets
  const baseScale = isMobile ? 2.5 : 2;

  return (
    <g
      ref={seatRef}
      className={`
        transition-all duration-300
        ${isInteractive ? 'cursor-pointer hover:opacity-80 focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2' : 'cursor-not-allowed opacity-70'}
        ${isAnimating ? 'animate-pulse' : ''}
        ${isHighlighted ? 'animate-bounce' : ''}
      `}
      transform={`translate(${seat.x}, ${seat.y}) scale(${baseScale})`}
      onClick={isInteractive ? onClick : undefined}
      onFocus={isInteractive ? onFocus : undefined}
      onBlur={onBlur}
      onKeyDown={handleKeyDown}
      tabIndex={isInteractive ? 0 : -1}
      aria-label={`Seat ${seat.id}, ${statusLabel}, Price tier ${seat.priceTier}. ${isSelected ? 'Selected' : 'Available'}. Press Enter or Space to ${isSelected ? 'deselect' : 'select'}`}
      role={isInteractive ? 'button' : undefined}
      aria-pressed={isSelected ? 'true' : 'false'}
      style={{
        filter: isAnimating 
          ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' 
          : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
        opacity: isAnimating ? 0.8 : 1,
      }}
    >
      {/* Seat base/legs */}
      <rect
        x="-6"
        y="3"
        width="12"
        height="4"
        rx="1"
        fill={colors.dark}
      />
      
      {/* Seat cushion */}
      <rect
        x="-7"
        y="-2"
        width="14"
        height="6"
        rx="2"
        fill={colors.cushion}
        stroke={colors.dark}
        strokeWidth="0.5"
      />
      
      {/* Seat back */}
      <rect
        x="-7"
        y="-8"
        width="14"
        height="7"
        rx="2"
        fill={colors.base}
        stroke={colors.dark}
        strokeWidth="0.5"
      />
      
      {/* Armrest left */}
      <rect
        x="-8"
        y="-2"
        width="2"
        height="5"
        rx="0.5"
        fill={colors.dark}
      />
      
      {/* Armrest right */}
      <rect
        x="6"
        y="-2"
        width="2"
        height="5"
        rx="0.5"
        fill={colors.dark}
      />
    </g>
  );
}

export const Seat = memo(SeatComponent);
