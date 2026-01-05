import type { Venue, SelectedSeat } from '../types/index.js';

export function findAdjacentSeats(
  venue: Venue,
  count: number
): SelectedSeat[] | null {
  // Find the first available group of N adjacent seats
  for (const section of venue.sections) {
    for (const row of section.rows) {
      const availableSeats = row.seats.filter((seat) => seat.status === 'available');
      
      // Check for consecutive seats in the row
      for (let i = 0; i <= availableSeats.length - count; i++) {
        const group = availableSeats.slice(i, i + count);
        
        // Verify they are consecutive by column number
        const isConsecutive = group.every((seat, idx) => {
          if (idx === 0) return true;
          return seat.col === group[idx - 1].col + 1;
        });

        if (isConsecutive) {
          return group.map((seat) => ({
            ...seat,
            sectionId: section.id,
            rowIndex: row.index,
          }));
        }
      }
    }
  }

  return null;
}

