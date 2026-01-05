import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveSelection, loadSelection, clearSelection } from '../storage.js';

describe('storage utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveSelection', () => {
    it('should save seat IDs to localStorage', () => {
      const seatIds = ['A-1-01', 'A-1-02', 'B-2-05'];
      saveSelection(seatIds);

      const stored = localStorage.getItem('event-seating-selection');
      expect(stored).toBeTruthy();

      const data = JSON.parse(stored!);
      expect(data.seatIds).toEqual(seatIds);
      expect(data.timestamp).toBeTypeOf('number');
    });

    it('should handle empty array', () => {
      saveSelection([]);
      const stored = localStorage.getItem('event-seating-selection');
      expect(stored).toBeTruthy();

      const data = JSON.parse(stored!);
      expect(data.seatIds).toEqual([]);
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      expect(() => saveSelection(['A-1-01'])).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      setItemSpy.mockRestore();
    });
  });

  describe('loadSelection', () => {
    it('should load seat IDs from localStorage', () => {
      const seatIds = ['A-1-01', 'A-1-02'];
      saveSelection(seatIds);

      const loaded = loadSelection();
      expect(loaded).toEqual(seatIds);
    });

    it('should return empty array if no data exists', () => {
      const loaded = loadSelection();
      expect(loaded).toEqual([]);
    });

    it('should return empty array for stale data (>24 hours)', () => {
      const oldData = {
        seatIds: ['A-1-01'],
        timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
      };
      localStorage.setItem('event-seating-selection', JSON.stringify(oldData));

      const loaded = loadSelection();
      expect(loaded).toEqual([]);
      expect(localStorage.getItem('event-seating-selection')).toBeNull();
    });

    it('should return data if less than 24 hours old', () => {
      const recentData = {
        seatIds: ['A-1-01'],
        timestamp: Date.now() - 12 * 60 * 60 * 1000, // 12 hours ago
      };
      localStorage.setItem('event-seating-selection', JSON.stringify(recentData));

      const loaded = loadSelection();
      expect(loaded).toEqual(['A-1-01']);
    });

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem('event-seating-selection', 'invalid json');
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const loaded = loadSelection();
      expect(loaded).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('clearSelection', () => {
    it('should remove selection from localStorage', () => {
      saveSelection(['A-1-01']);
      expect(localStorage.getItem('event-seating-selection')).toBeTruthy();

      clearSelection();
      expect(localStorage.getItem('event-seating-selection')).toBeNull();
    });

    it('should handle errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => clearSelection()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      removeItemSpy.mockRestore();
    });
  });
});

