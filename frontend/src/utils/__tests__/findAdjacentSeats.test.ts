import { describe, it, expect } from 'vitest';
import { findAdjacentSeats } from '../findAdjacentSeats.js';
import type { Venue } from '../../types/index.js';

describe('findAdjacentSeats', () => {
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
              { id: 'A-1-01', col: 1, x: 100, y: 100, status: 'available', priceTier: 1 },
              { id: 'A-1-02', col: 2, x: 120, y: 100, status: 'available', priceTier: 1 },
              { id: 'A-1-03', col: 3, x: 140, y: 100, status: 'sold', priceTier: 1 },
              { id: 'A-1-04', col: 4, x: 160, y: 100, status: 'available', priceTier: 1 },
              { id: 'A-1-05', col: 5, x: 180, y: 100, status: 'available', priceTier: 1 },
            ],
          },
          {
            index: 2,
            seats: [
              { id: 'A-2-01', col: 1, x: 100, y: 120, status: 'available', priceTier: 1 },
              { id: 'A-2-02', col: 2, x: 120, y: 120, status: 'available', priceTier: 1 },
              { id: 'A-2-03', col: 3, x: 140, y: 120, status: 'available', priceTier: 1 },
            ],
          },
        ],
      },
    ],
  });

  it('should find 2 adjacent seats', () => {
    const venue = createMockVenue();
    const result = findAdjacentSeats(venue, 2);

    expect(result).not.toBeNull();
    expect(result!.length).toBe(2);
    expect(result![0].id).toBe('A-1-01');
    expect(result![1].id).toBe('A-1-02');
  });

  it('should find 3 adjacent seats', () => {
    const venue = createMockVenue();
    const result = findAdjacentSeats(venue, 3);

    expect(result).not.toBeNull();
    expect(result!.length).toBe(3);
    expect(result![0].id).toBe('A-2-01');
    expect(result![1].id).toBe('A-2-02');
    expect(result![2].id).toBe('A-2-03');
  });

  it('should skip non-consecutive seats', () => {
    const venue = createMockVenue();
    const result = findAdjacentSeats(venue, 2);

    // Should find A-1-01 and A-1-02, not A-1-04 and A-1-05 (because A-1-03 is sold)
    expect(result).not.toBeNull();
    expect(result![0].id).toBe('A-1-01');
    expect(result![1].id).toBe('A-1-02');
  });

  it('should return null if no adjacent seats found', () => {
    const venue: Venue = {
      venueId: 'empty',
      name: 'Empty Venue',
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
                { id: 'A-1-01', col: 1, x: 100, y: 100, status: 'sold', priceTier: 1 },
                { id: 'A-1-03', col: 3, x: 140, y: 100, status: 'available', priceTier: 1 },
              ],
            },
          ],
        },
      ],
    };

    const result = findAdjacentSeats(venue, 2);
    expect(result).toBeNull();
  });

  it('should return null if count exceeds available seats', () => {
    const venue = createMockVenue();
    const result = findAdjacentSeats(venue, 10);
    expect(result).toBeNull();
  });

  it('should include sectionId and rowIndex in result', () => {
    const venue = createMockVenue();
    const result = findAdjacentSeats(venue, 2);

    expect(result).not.toBeNull();
    expect(result![0].sectionId).toBe('section-a');
    expect(result![0].rowIndex).toBe(1);
  });
});

