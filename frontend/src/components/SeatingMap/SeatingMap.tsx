import { memo, useCallback } from 'react';
import type { Venue, SelectedSeat } from '../../types/index.js';
import { Seat } from '../Seat/Seat.js';

interface SeatingMapProps {
  venue: Venue;
  selectedSeatIds: Set<string>;
  onSeatClick: (seat: SelectedSeat) => void;
  onSeatFocus?: (seat: SelectedSeat) => void;
}

function SeatingMapComponent({
  venue,
  selectedSeatIds,
  onSeatClick,
  onSeatFocus,
}: SeatingMapProps) {
  const handleSeatClick = useCallback(
    (seatId: string, sectionId: string, rowIndex: number) => {
      const section = venue.sections.find((s) => s.id === sectionId);
      if (!section) return;

      const row = section.rows.find((r) => r.index === rowIndex);
      if (!row) return;

      const seat = row.seats.find((s) => s.id === seatId);
      if (!seat) return;

      onSeatClick({
        ...seat,
        sectionId,
        rowIndex,
      });
    },
    [venue, onSeatClick]
  );

  const handleSeatFocus = useCallback(
    (seatId: string, sectionId: string, rowIndex: number) => {
      if (!onSeatFocus) return;

      const section = venue.sections.find((s) => s.id === sectionId);
      if (!section) return;

      const row = section.rows.find((r) => r.index === rowIndex);
      if (!row) return;

      const seat = row.seats.find((s) => s.id === seatId);
      if (!seat) return;

      onSeatFocus({
        ...seat,
        sectionId,
        rowIndex,
      });
    },
    [venue, onSeatFocus]
  );

  return (
    <div className="w-full h-full overflow-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl shadow-inner relative">
      {/* Stage indicator */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full font-bold text-sm tracking-wider shadow-lg z-10">
        🎭 STAGE
      </div>
      
      <svg
        className="w-full min-h-[500px] block drop-shadow-md"
        viewBox={`0 0 ${venue.map.width} ${venue.map.height}`}
        preserveAspectRatio="xMidYMid meet"
        aria-label={`Seating map for ${venue.name}`}
        role="img"
      >
        <title>{venue.name} Seating Map</title>
        {venue.sections.map((section) =>
          section.rows.map((row) =>
            row.seats.map((seat) => (
              <Seat
                key={seat.id}
                seat={seat}
                isSelected={selectedSeatIds.has(seat.id)}
                onClick={() => handleSeatClick(seat.id, section.id, row.index)}
                onFocus={() => handleSeatFocus(seat.id, section.id, row.index)}
              />
            ))
          )
        )}
      </svg>
    </div>
  );
}

export const SeatingMap = memo(SeatingMapComponent);
