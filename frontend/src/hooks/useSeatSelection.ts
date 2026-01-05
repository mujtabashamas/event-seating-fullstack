import { useState, useEffect, useCallback, useRef } from 'react';
import type { SelectedSeat, Venue } from '../types/index.js';
import { saveSelection, loadSelection, clearSelection } from '../utils/storage.js';

const MAX_SELECTIONS = 8;

export function useSeatSelection() {
  const [selectedSeats, setSelectedSeats] = useState<Map<string, SelectedSeat>>(new Map());
  const venueRef = useRef<Venue | null>(null);

  // Restore selection when venue loads
  const restoreSelection = useCallback((venue: Venue) => {
    const savedIds = loadSelection();
    if (savedIds.length === 0) return;

    const restored = new Map<string, SelectedSeat>();
    
    // Find and restore full seat data from venue
    venue.sections.forEach((section) => {
      section.rows.forEach((row) => {
        row.seats.forEach((seat) => {
          if (savedIds.includes(seat.id) && seat.status === 'available') {
            restored.set(seat.id, {
              ...seat,
              sectionId: section.id,
              rowIndex: row.index,
            });
          }
        });
      });
    });

    if (restored.size > 0) {
      setSelectedSeats(restored);
    }
  }, []);

  // Expose method to restore when venue is loaded
  const initializeWithVenue = useCallback((venue: Venue) => {
    venueRef.current = venue;
    restoreSelection(venue);
  }, [restoreSelection]);

  const toggleSeat = useCallback((seat: SelectedSeat): boolean => {
    setSelectedSeats((prev) => {
      const newSelection = new Map(prev);

      if (newSelection.has(seat.id)) {
        // Deselect
        newSelection.delete(seat.id);
      } else {
        // Check if we've reached the limit
        if (newSelection.size >= MAX_SELECTIONS) {
          return prev; // Don't add if limit reached
        }
        // Select
        newSelection.set(seat.id, seat);
      }

      // Persist to localStorage
      saveSelection(Array.from(newSelection.keys()));

      return newSelection;
    });

    return true;
  }, []);

  const isSelected = useCallback((seatId: string): boolean => {
    return selectedSeats.has(seatId);
  }, [selectedSeats]);

  const clearAll = useCallback(() => {
    setSelectedSeats(new Map());
    clearSelection();
  }, []);

  const getSelectedSeatsArray = useCallback((): SelectedSeat[] => {
    return Array.from(selectedSeats.values());
  }, [selectedSeats]);

  const canSelectMore = selectedSeats.size < MAX_SELECTIONS;

  return {
    selectedSeats: getSelectedSeatsArray(),
    selectedCount: selectedSeats.size,
    maxSelections: MAX_SELECTIONS,
    toggleSeat,
    isSelected,
    clearAll,
    canSelectMore,
    initializeWithVenue,
  };
}

