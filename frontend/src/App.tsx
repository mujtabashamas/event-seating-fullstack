import { useState, useEffect, useCallback } from 'react';
import type { Venue, SelectedSeat, SeatDetails as SeatDetailsType } from './types/index.js';
import { VenueService } from './services/venue.service.js';
import { useSeatSelection } from './hooks/useSeatSelection.js';
import { SeatingMap } from './components/SeatingMap/SeatingMap.js';
import { SeatDetails } from './components/SeatDetails/SeatDetails.js';
import { SelectionSummary } from './components/SelectionSummary/SelectionSummary.js';

function App() {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusedSeat, setFocusedSeat] = useState<SeatDetailsType | null>(null);

  const {
    selectedSeats,
    maxSelections,
    toggleSeat,
    isSelected,
    clearAll,
    canSelectMore,
  } = useSeatSelection();

  // Load venue data
  useEffect(() => {
    VenueService.loadVenue()
      .then((loadedVenue) => {
        setVenue(loadedVenue);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load venue data');
        setLoading(false);
      });
  }, []);

  const handleSeatClick = useCallback(
    (seat: SelectedSeat) => {
      if (seat.status !== 'available') {
        return;
      }

      if (!canSelectMore && !isSelected(seat.id)) {
        return;
      }

      toggleSeat(seat);
    },
    [toggleSeat, isSelected, canSelectMore]
  );

  const handleSeatFocus = useCallback((seat: SelectedSeat) => {
    const section = venue?.sections.find((s) => s.id === seat.sectionId);
    if (!section) return;

    setFocusedSeat({
      ...seat,
      sectionLabel: section.label,
    });
  }, [venue]);

  const selectedSeatIds = new Set(selectedSeats.map((s) => s.id));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-700 text-xl font-medium bg-white px-8 py-6 rounded-lg shadow animate-pulse">
          Loading venue data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800">No venue data available</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {venue.name}
          </h1>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">Select up to {maxSelections} seats</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-green-500 rounded"></span>
              Available
            </p>
            <p className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-blue-500 rounded"></span>
              Your Selection
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 p-6 overflow-hidden">
        {/* Seating Map Section */}
        <div className="bg-white rounded-lg shadow p-6 overflow-hidden">
          <SeatingMap
            venue={venue}
            selectedSeatIds={selectedSeatIds}
            onSeatClick={handleSeatClick}
            onSeatFocus={handleSeatFocus}
          />
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-6 overflow-y-auto">
          <SeatDetails seat={focusedSeat} />
          <SelectionSummary
            selectedSeats={selectedSeats}
            maxSelections={maxSelections}
            onClear={clearAll}
          />
        </aside>
      </main>
    </div>
  );
}

export default App;
