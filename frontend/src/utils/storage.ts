const STORAGE_KEY = 'event-seating-selection';

export interface StoredSelection {
  seatIds: string[];
  timestamp: number;
}

/**
 * Save selected seats to localStorage
 */
export function saveSelection(seatIds: string[]): void {
  try {
    const data: StoredSelection = {
      seatIds,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save selection to localStorage:', error);
  }
}

/**
 * Load selected seats from localStorage
 */
export function loadSelection(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const data: StoredSelection = JSON.parse(stored);
    // Return seat IDs if data is less than 24 hours old
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (Date.now() - data.timestamp < maxAge) {
      return data.seatIds;
    }

    // Clear stale data
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch (error) {
    console.warn('Failed to load selection from localStorage:', error);
    return [];
  }
}

/**
 * Clear selection from localStorage
 */
export function clearSelection(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear selection from localStorage:', error);
  }
}

