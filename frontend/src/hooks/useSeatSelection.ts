import { useState, useEffect, useCallback } from 'react';
import type { SelectedSeat } from '../types/index.js';
import { saveSelection, loadSelection, clearSelection } from '../utils/storage.js';

const MAX_SELECTIONS = 8;

export function useSeatSelection() {
  const [selectedSeats, setSelectedSeats] = useState<Map<string, SelectedSeat>>(new Map());

  // Load persisted selection on mount
  useEffect(() => {
    const savedIds = loadSelection();
    if (savedIds.length > 0) {
      // Note: We'll need to restore full seat data from venue
      // For now, we'll just restore the IDs and let components handle restoration
      const restored = new Map<string, SelectedSeat>();
      savedIds.forEach((id) => {
        // Placeholder - will be populated when venue loads
        restored.set(id, {} as SelectedSeat);
      });
      setSelectedSeats(restored);
    }
  }, []);

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
  };
}

