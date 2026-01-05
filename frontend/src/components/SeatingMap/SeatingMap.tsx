import { memo, useCallback, useRef } from 'react';
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
  const seatRefs = useRef<Map<string, SVGGElement>>(new Map());

  // Find next seat in a direction for keyboard navigation
  const findNextSeat = useCallback((currentSeatId: string, direction: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight'): string | null => {
    let currentSeat: { sectionId: string; rowIndex: number; col: number } | null = null;
    let currentSection: typeof venue.sections[0] | null = null;
    let currentRow: typeof venue.sections[0]['rows'][0] | null = null;

    // Find current seat
    for (const section of venue.sections) {
      for (const row of section.rows) {
        const seat = row.seats.find(s => s.id === currentSeatId);
        if (seat) {
          currentSeat = { sectionId: section.id, rowIndex: row.index, col: seat.col };
          currentSection = section;
          currentRow = row;
          break;
        }
      }
      if (currentSeat) break;
    }

    if (!currentSeat || !currentSection || !currentRow) return null;

    const { sectionId, rowIndex, col } = currentSeat;
    const section = venue.sections.find(s => s.id === sectionId);
    if (!section) return null;

    let nextSeatId: string | null = null;

    switch (direction) {
      case 'ArrowLeft':
        // Find seat to the left in same row
        const leftSeat = currentRow.seats.find(s => s.col === col - 1);
        if (leftSeat && leftSeat.status === 'available') nextSeatId = leftSeat.id;
        break;
      case 'ArrowRight':
        // Find seat to the right in same row
        const rightSeat = currentRow.seats.find(s => s.col === col + 1);
        if (rightSeat && rightSeat.status === 'available') nextSeatId = rightSeat.id;
        break;
      case 'ArrowUp':
        // Find seat in row above (same column)
        const prevRow = section.rows.find(r => r.index === rowIndex - 1);
        if (prevRow) {
          const upSeat = prevRow.seats.find(s => s.col === col);
          if (upSeat && upSeat.status === 'available') nextSeatId = upSeat.id;
        }
        break;
      case 'ArrowDown':
        // Find seat in row below (same column)
        const nextRow = section.rows.find(r => r.index === rowIndex + 1);
        if (nextRow) {
          const downSeat = nextRow.seats.find(s => s.col === col);
          if (downSeat && downSeat.status === 'available') nextSeatId = downSeat.id;
        }
        break;
    }

    return nextSeatId;
  }, [venue]);
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

  const handleSeatKeyDown = useCallback(
    (e: React.KeyboardEvent, seatId: string) => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        return;
      }

      e.preventDefault();
      const nextSeatId = findNextSeat(seatId, e.key as 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight');
      
      if (nextSeatId) {
        const nextSeatElement = seatRefs.current.get(nextSeatId);
        if (nextSeatElement) {
          nextSeatElement.focus();
        }
      }
    },
    [findNextSeat]
  );

  return (
    <div className="w-full h-full flex flex-col">
      {/* Stage indicator */}
      <div className="flex justify-center mb-4">
        <div className="bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold text-sm shadow-md border-2 border-gray-700">
          🎭 STAGE
        </div>
      </div>
      
      {/* Seating map */}
      <div className="flex-1 overflow-auto bg-gray-50 rounded-lg border-2 border-gray-200 relative touch-pan-x touch-pan-y">
        <svg
          className="w-full h-auto min-h-[400px] sm:min-h-[500px] lg:h-[700px] block"
          viewBox={`0 0 ${venue.map.width * 0.8} ${venue.map.height * 0.8}`}
          preserveAspectRatio="xMidYMid meet"
          aria-label={`Seating map for ${venue.name}`}
          role="img"
        >
          <title>{venue.name} Seating Map</title>
          
          {/* Section labels and seats */}
          {venue.sections.map((section) => {
            // Calculate section boundaries for label placement
            const firstRow = section.rows[0];
            const firstSeat = firstRow?.seats[0];
            const lastSeat = firstRow?.seats[firstRow.seats.length - 1];
            const sectionCenterX = firstSeat && lastSeat ? (firstSeat.x + lastSeat.x) / 2 : 0;
            const sectionTopY = firstSeat?.y || 0;

            return (
              <g key={section.id}>
                {/* Section label */}
                <text
                  x={sectionCenterX}
                  y={sectionTopY - 50}
                  fontSize="20"
                  fontWeight="bold"
                  fill="#374151"
                  textAnchor="middle"
                  className="select-none"
                >
                  {section.label}
                </text>
                
                {/* Rows with row numbers */}
                {section.rows.map((row) => {
                  const firstSeatInRow = row.seats[0];
                  const lastSeatInRow = row.seats[row.seats.length - 1];
                  
                  return (
                    <g key={`${section.id}-${row.index}`}>
                      {/* Left row number */}
                      <text
                        x={firstSeatInRow.x - 50}
                        y={firstSeatInRow.y + 5}
                        fontSize="16"
                        fontWeight="600"
                        fill="#6b7280"
                        textAnchor="middle"
                        className="select-none"
                      >
                        {row.index}
                      </text>
                      
                      {/* Seats in row */}
                      {row.seats.map((seat) => (
                        <Seat
                          key={seat.id}
                          seat={seat}
                          isSelected={selectedSeatIds.has(seat.id)}
                          onClick={() => handleSeatClick(seat.id, section.id, row.index)}
                          onFocus={() => handleSeatFocus(seat.id, section.id, row.index)}
                          onKeyDown={(e) => handleSeatKeyDown(e, seat.id)}
                          seatRef={(ref) => {
                            if (ref) {
                              seatRefs.current.set(seat.id, ref);
                            } else {
                              seatRefs.current.delete(seat.id);
                            }
                          }}
                        />
                      ))}
                      
                      {/* Right row number */}
                      <text
                        x={lastSeatInRow.x + 50}
                        y={lastSeatInRow.y + 5}
                        fontSize="16"
                        fontWeight="600"
                        fill="#6b7280"
                        textAnchor="middle"
                        className="select-none"
                      >
                        {row.index}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 relative">
            <svg viewBox="0 0 20 20" className="w-full h-full">
              <rect x="3" y="10" width="14" height="4" rx="1" fill="#16a34a"/>
              <rect x="2" y="6" width="16" height="6" rx="2" fill="#4ade80" stroke="#16a34a" strokeWidth="0.5"/>
              <rect x="2" y="1" width="16" height="7" rx="2" fill="#22c55e" stroke="#16a34a" strokeWidth="0.5"/>
              <rect x="1" y="6" width="2" height="5" rx="0.5" fill="#16a34a"/>
              <rect x="17" y="6" width="2" height="5" rx="0.5" fill="#16a34a"/>
            </svg>
          </div>
          <span className="font-medium text-gray-700">Available</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 relative">
            <svg viewBox="0 0 20 20" className="w-full h-full">
              <rect x="3" y="10" width="14" height="4" rx="1" fill="#2563eb"/>
              <rect x="2" y="6" width="16" height="6" rx="2" fill="#60a5fa" stroke="#2563eb" strokeWidth="0.5"/>
              <rect x="2" y="1" width="16" height="7" rx="2" fill="#3b82f6" stroke="#2563eb" strokeWidth="0.5"/>
              <rect x="1" y="6" width="2" height="5" rx="0.5" fill="#2563eb"/>
              <rect x="17" y="6" width="2" height="5" rx="0.5" fill="#2563eb"/>
            </svg>
          </div>
          <span className="font-medium text-gray-700">Selected</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 relative">
            <svg viewBox="0 0 20 20" className="w-full h-full">
              <rect x="3" y="10" width="14" height="4" rx="1" fill="#dc2626"/>
              <rect x="2" y="6" width="16" height="6" rx="2" fill="#f87171" stroke="#dc2626" strokeWidth="0.5"/>
              <rect x="2" y="1" width="16" height="7" rx="2" fill="#ef4444" stroke="#dc2626" strokeWidth="0.5"/>
              <rect x="1" y="6" width="2" height="5" rx="0.5" fill="#dc2626"/>
              <rect x="17" y="6" width="2" height="5" rx="0.5" fill="#dc2626"/>
            </svg>
          </div>
          <span className="font-medium text-gray-700">Sold</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 relative">
            <svg viewBox="0 0 20 20" className="w-full h-full">
              <rect x="3" y="10" width="14" height="4" rx="1" fill="#ca8a04"/>
              <rect x="2" y="6" width="16" height="6" rx="2" fill="#fbbf24" stroke="#ca8a04" strokeWidth="0.5"/>
              <rect x="2" y="1" width="16" height="7" rx="2" fill="#eab308" stroke="#ca8a04" strokeWidth="0.5"/>
              <rect x="1" y="6" width="2" height="5" rx="0.5" fill="#ca8a04"/>
              <rect x="17" y="6" width="2" height="5" rx="0.5" fill="#ca8a04"/>
            </svg>
          </div>
          <span className="font-medium text-gray-700">Reserved</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 relative">
            <svg viewBox="0 0 20 20" className="w-full h-full">
              <rect x="3" y="10" width="14" height="4" rx="1" fill="#6b7280"/>
              <rect x="2" y="6" width="16" height="6" rx="2" fill="#d1d5db" stroke="#6b7280" strokeWidth="0.5"/>
              <rect x="2" y="1" width="16" height="7" rx="2" fill="#9ca3af" stroke="#6b7280" strokeWidth="0.5"/>
              <rect x="1" y="6" width="2" height="5" rx="0.5" fill="#6b7280"/>
              <rect x="17" y="6" width="2" height="5" rx="0.5" fill="#6b7280"/>
            </svg>
          </div>
          <span className="font-medium text-gray-700">Held</span>
        </div>
      </div>
    </div>
  );
}

export const SeatingMap = memo(SeatingMapComponent);
