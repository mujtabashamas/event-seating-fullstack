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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="text-white text-2xl font-bold bg-white/10 backdrop-blur-lg px-8 py-6 rounded-2xl animate-pulse">
          Loading venue data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800">No venue data available</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-lg border-b border-black/5 shadow-xl px-6 py-6">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          {venue.name}
        </h1>
        <p className="text-lg text-gray-600 font-medium">
          Select up to {maxSelections} seats
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 p-6 overflow-hidden">
        {/* Seating Map Section */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 overflow-hidden relative border-t-4 border-indigo-500">
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
