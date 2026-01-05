import { memo, useRef, useEffect } from 'react';
import type { Seat as SeatType } from '../../types/index.js';

interface SeatProps {
  seat: SeatType;
  isSelected: boolean;
  onClick: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  seatRef?: (ref: SVGGElement | null) => void;
}

function SeatComponent({ seat, isSelected, onClick, onFocus, onBlur, onKeyDown, seatRef: setSeatRef }: SeatProps) {
  const isInteractive = seat.status === 'available';
  const statusLabel = seat.status.charAt(0).toUpperCase() + seat.status.slice(1);
  const seatRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (setSeatRef) {
      setSeatRef(seatRef.current);
    }
  }, [setSeatRef]);

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

  const getColors = () => {
    if (isSelected) {
      return {
        base: '#3b82f6',
        cushion: '#60a5fa',
        dark: '#2563eb',
      };
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
  const baseScale = 2;

  return (
    <g
      ref={seatRef}
      className={`
        transition-opacity duration-150
        ${isInteractive ? 'cursor-pointer hover:opacity-80 focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2' : 'cursor-not-allowed opacity-70'}
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
        filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
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
