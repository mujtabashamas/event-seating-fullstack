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
        fill: '#667eea',
        stroke: '#5568d3',
      };
    }
    
    switch (seat.status) {
      case 'available':
        return { fill: '#10b981', stroke: '#059669' };
      case 'reserved':
        return { fill: '#f59e0b', stroke: '#d97706' };
      case 'sold':
        return { fill: '#ef4444', stroke: '#dc2626' };
      case 'held':
        return { fill: '#6b7280', stroke: '#4b5563' };
      default:
        return { fill: '#e0e0e0', stroke: '#bbb' };
    }
  };

  const colors = getColors();

  return (
    <g
      className={`
        transition-all duration-300 ease-out
        ${isInteractive ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}
      `}
      transform={`translate(${seat.x}, ${seat.y})`}
      style={{
        filter: isSelected ? 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.4))' : 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.1))',
      }}
    >
      <circle
        r={isSelected ? "9" : "8"}
        cx="0"
        cy="0"
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth="1.5"
        onClick={isInteractive ? onClick : undefined}
        onFocus={isInteractive ? onFocus : undefined}
        onBlur={onBlur}
        tabIndex={isInteractive ? 0 : -1}
        aria-label={`Seat ${seat.id}, ${statusLabel}, Price tier ${seat.priceTier}`}
        role={isInteractive ? 'button' : undefined}
        aria-pressed={isSelected ? 'true' : 'false'}
        className={`
          transition-all duration-300
          ${isInteractive ? 'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2' : ''}
        `}
      />
      {isSelected && (
        <circle
          r="11"
          cx="0"
          cy="0"
          fill="none"
          stroke="#667eea"
          strokeWidth="2"
          strokeDasharray="6,3"
          aria-hidden="true"
          className="animate-spin"
          style={{ animationDuration: '3s' }}
        />
      )}
    </g>
  );
}

export const Seat = memo(SeatComponent);
