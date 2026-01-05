import { memo } from 'react';
import type { Seat as SeatType } from '../../types/index.js';

interface SeatProps {
  seat: SeatType;
  isSelected: boolean;
  onClick: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

function SeatComponent({ seat, isSelected, onClick, onFocus, onBlur }: SeatProps) {
  const isInteractive = seat.status === 'available';
  const statusLabel = seat.status.charAt(0).toUpperCase() + seat.status.slice(1);

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
  const scale = isSelected ? 1.15 : 1;

  return (
    <g
      className={`
        transition-all duration-200
        ${isInteractive ? 'cursor-pointer' : 'cursor-not-allowed'}
      `}
      transform={`translate(${seat.x}, ${seat.y}) scale(${scale})`}
      onClick={isInteractive ? onClick : undefined}
      onFocus={isInteractive ? onFocus : undefined}
      onBlur={onBlur}
      tabIndex={isInteractive ? 0 : -1}
      aria-label={`Seat ${seat.id}, ${statusLabel}, Price tier ${seat.priceTier}`}
      role={isInteractive ? 'button' : undefined}
      aria-pressed={isSelected ? 'true' : 'false'}
      style={{
        filter: isSelected 
          ? 'drop-shadow(0 2px 6px rgba(59, 130, 246, 0.5))' 
          : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
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

      {/* Selection indicator */}
      {isSelected && (
        <>
          <rect
            x="-9"
            y="-10"
            width="18"
            height="18"
            rx="3"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1.5"
            strokeDasharray="2,2"
          />
          <circle
            cx="6"
            cy="-7"
            r="2.5"
            fill="#3b82f6"
            stroke="#fff"
            strokeWidth="0.5"
          >
            <title>Selected</title>
          </circle>
          <text
            x="6"
            y="-6"
            fontSize="3"
            fontWeight="bold"
            fill="#fff"
            textAnchor="middle"
          >
            ✓
          </text>
        </>
      )}
      
      {/* Hover effect indicator - only for interactive seats */}
      {isInteractive && (
        <rect
          x="-9"
          y="-10"
          width="18"
          height="18"
          rx="3"
          fill="transparent"
          className="hover:fill-white hover:fill-opacity-20 transition-all"
        />
      )}
    </g>
  );
}

export const Seat = memo(SeatComponent);
