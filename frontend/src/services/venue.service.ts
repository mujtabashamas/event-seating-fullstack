import type { Venue } from '../types/index.js';

const VENUE_DATA_PATH = '/venue.json';

export class VenueService {
  private static cachedVenue: Venue | null = null;

  /**
   * Load venue data from JSON file
   */
  static async loadVenue(): Promise<Venue> {
    if (this.cachedVenue) {
      return this.cachedVenue;
    }

    try {
      const response = await fetch(VENUE_DATA_PATH);
      if (!response.ok) {
        throw new Error(`Failed to load venue data: ${response.statusText}`);
      }
      const venue: Venue = await response.json();
      this.cachedVenue = venue;
      return venue;
    } catch (error) {
      throw new Error(`Error loading venue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all seats from venue with their section and row information
   */
  static getAllSeatsWithContext(venue: Venue): Array<{
    seat: import('../types/index.js').Seat;
    sectionId: string;
    sectionLabel: string;
    rowIndex: number;
  }> {
    const seats: Array<{
      seat: import('../types/index.js').Seat;
      sectionId: string;
      sectionLabel: string;
      rowIndex: number;
    }> = [];

    for (const section of venue.sections) {
      for (const row of section.rows) {
        for (const seat of row.seats) {
          seats.push({
            seat,
            sectionId: section.id,
            sectionLabel: section.label,
            rowIndex: row.index,
          });
        }
      }
    }

    return seats;
  }
}

