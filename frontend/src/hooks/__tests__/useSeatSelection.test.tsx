import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSeatSelection } from '../useSeatSelection.js';
import type { Venue } from '../../types/index.js';

const createMockVenue = (): Venue => ({
  venueId: 'test-venue',
  name: 'Test Venue',
  map: { width: 1000, height: 800 },
  sections: [
    {
      id: 'section-a',
      label: 'Section A',
      transform: { x: 0, y: 0 },
      rows: [
        {
          index: 1,
          seats: [
            {
              id: 'A-1-01',
              col: 1,
              x: 100,
              y: 100,
              status: 'available',
              priceTier: 1,
            },
            {
              id: 'A-1-02',
              col: 2,
              x: 120,
              y: 100,
              status: 'available',
              priceTier: 1,
            },
          ],
        },
      ],
    },
  ],
});

describe('useSeatSelection', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with empty selection', () => {
    const { result } = renderHook(() => useSeatSelection());

    expect(result.current.selectedSeats).toEqual([]);
    expect(result.current.selectedCount).toBe(0);
    expect(result.current.canSelectMore).toBe(true);
  });

  it('should toggle seat selection', () => {
    const { result } = renderHook(() => useSeatSelection());
    const seat = {
      id: 'A-1-01',
      col: 1,
      x: 100,
      y: 100,
      status: 'available' as const,
      priceTier: 1,
      sectionId: 'section-a',
      rowIndex: 1,
    };

    act(() => {
      result.current.toggleSeat(seat);
    });

    expect(result.current.selectedCount).toBe(1);
    expect(result.current.isSelected('A-1-01')).toBe(true);
    expect(result.current.canSelectMore).toBe(true);
  });

  it('should deselect seat when toggled again', () => {
    const { result } = renderHook(() => useSeatSelection());
    const seat = {
      id: 'A-1-01',
      col: 1,
      x: 100,
      y: 100,
      status: 'available' as const,
      priceTier: 1,
      sectionId: 'section-a',
      rowIndex: 1,
    };

    act(() => {
      result.current.toggleSeat(seat);
      result.current.toggleSeat(seat);
    });

    expect(result.current.selectedCount).toBe(0);
    expect(result.current.isSelected('A-1-01')).toBe(false);
  });

  it('should enforce max selection limit', () => {
    const { result } = renderHook(() => useSeatSelection());

    // Select 8 seats
    for (let i = 1; i <= 8; i++) {
      act(() => {
        result.current.toggleSeat({
          id: `A-1-0${i}`,
          col: i,
          x: 100 + i * 20,
          y: 100,
          status: 'available' as const,
          priceTier: 1,
          sectionId: 'section-a',
          rowIndex: 1,
        });
      });
    }

    expect(result.current.selectedCount).toBe(8);
    expect(result.current.canSelectMore).toBe(false);

    // Try to select 9th seat
    act(() => {
      result.current.toggleSeat({
        id: 'A-1-09',
        col: 9,
        x: 180,
        y: 100,
        status: 'available' as const,
        priceTier: 1,
        sectionId: 'section-a',
        rowIndex: 1,
      });
    });

    expect(result.current.selectedCount).toBe(8); // Still 8
  });

  it('should select multiple seats at once', () => {
    const { result } = renderHook(() => useSeatSelection());
    const seats = [
      {
        id: 'A-1-01',
        col: 1,
        x: 100,
        y: 100,
        status: 'available' as const,
        priceTier: 1,
        sectionId: 'section-a',
        rowIndex: 1,
      },
      {
        id: 'A-1-02',
        col: 2,
        x: 120,
        y: 100,
        status: 'available' as const,
        priceTier: 1,
        sectionId: 'section-a',
        rowIndex: 1,
      },
    ];

    act(() => {
      result.current.selectMultiple(seats);
    });

    expect(result.current.selectedCount).toBe(2);
    expect(result.current.isSelected('A-1-01')).toBe(true);
    expect(result.current.isSelected('A-1-02')).toBe(true);
  });

  it('should clear all selections', () => {
    const { result } = renderHook(() => useSeatSelection());
    const seat = {
      id: 'A-1-01',
      col: 1,
      x: 100,
      y: 100,
      status: 'available' as const,
      priceTier: 1,
      sectionId: 'section-a',
      rowIndex: 1,
    };

    act(() => {
      result.current.toggleSeat(seat);
      result.current.clearAll();
    });

    expect(result.current.selectedCount).toBe(0);
    expect(localStorage.getItem('event-seating-selection')).toBeNull();
  });

  it('should restore selection from localStorage', () => {
    const venue = createMockVenue();
    const { result } = renderHook(() => useSeatSelection());

    // Save selection first
    act(() => {
      result.current.toggleSeat({
        id: 'A-1-01',
        col: 1,
        x: 100,
        y: 100,
        status: 'available' as const,
        priceTier: 1,
        sectionId: 'section-a',
        rowIndex: 1,
      });
    });

    // Create new hook instance
    const { result: result2 } = renderHook(() => useSeatSelection());

    act(() => {
      result2.current.initializeWithVenue(venue);
    });

    expect(result2.current.selectedCount).toBe(1);
    expect(result2.current.isSelected('A-1-01')).toBe(true);
  });
});

