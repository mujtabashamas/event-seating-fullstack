import { useState, useEffect, useCallback } from 'react';
import type { Venue, SelectedSeat, SeatDetails as SeatDetailsType } from './types/index.js';
import { VenueService } from './services/venue.service.js';
import { useSeatSelection } from './hooks/useSeatSelection.js';
import { SeatingMap } from './components/SeatingMap/SeatingMap.js';
import { SeatDetails } from './components/SeatDetails/SeatDetails.js';
import { SelectionSummary } from './components/SelectionSummary/SelectionSummary.js';
import { MapControls } from './components/MapControls/MapControls.js';
import { findAdjacentSeats } from './utils/findAdjacentSeats.js';
import { useWebSocket } from './hooks/useWebSocket.js';

function App() {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusedSeat, setFocusedSeat] = useState<SeatDetailsType | null>(null);
  const [showHeatMap, setShowHeatMap] = useState(false);
  const [highlightedSeatIds, setHighlightedSeatIds] = useState<Set<string>>(new Set());
  const [seatStatusChanges, setSeatStatusChanges] = useState<Map<string, boolean>>(new Map());
  const [isSearching, setIsSearching] = useState(false);

  const {
    selectedSeats,
    maxSelections,
    toggleSeat,
    isSelected,
    clearAll,
    canSelectMore,
    initializeWithVenue,
    selectMultiple,
  } = useSeatSelection();

  // Load venue data
  useEffect(() => {
    VenueService.loadVenue()
      .then((loadedVenue) => {
        setVenue(loadedVenue);
        // Restore persisted selection after venue loads
        initializeWithVenue(loadedVenue);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load venue data');
        setLoading(false);
      });
  }, [initializeWithVenue]);

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

  // WebSocket for live updates
  const handleSeatUpdate = useCallback((update: { seatId: string; status: string }) => {
    setSeatStatusChanges((prev) => {
      const newMap = new Map(prev);
      newMap.set(update.seatId, true);
      setTimeout(() => {
        setSeatStatusChanges((current) => {
          const updated = new Map(current);
          updated.delete(update.seatId);
          return updated;
        });
      }, 600);
      return newMap;
    });

    // Update venue seat status
    if (venue) {
      setVenue((prevVenue) => {
        if (!prevVenue) return prevVenue;
        const updatedVenue = { ...prevVenue };
        updatedVenue.sections = updatedVenue.sections.map((section) => ({
          ...section,
          rows: section.rows.map((row) => ({
            ...row,
            seats: row.seats.map((seat) =>
              seat.id === update.seatId
                ? { ...seat, status: update.status as typeof seat.status }
                : seat
            ),
          })),
        }));
        return updatedVenue;
      });
    }
  }, [venue]);

  // WebSocket for live updates (disabled by default - enable when server is running)
  const { isConnected: wsConnected } = useWebSocket({
    enabled: false, // Set to true if WebSocket server is running on ws://localhost:3001
    onSeatUpdate: handleSeatUpdate,
  });

  // Find adjacent seats helper
  const handleFindAdjacentSeats = useCallback(
    (count: number) => {
      if (!venue) return;

      setIsSearching(true);

      // Use setTimeout to ensure loading state is visible
      setTimeout(() => {
        const adjacent = findAdjacentSeats(venue, count);
        
        if (adjacent) {
          // Highlight the found seats
          setHighlightedSeatIds(new Set(adjacent.map((s) => s.id)));
          
          // Use batch select for smooth selection
          selectMultiple(adjacent);
          
          // Remove highlight after 3 seconds
          setTimeout(() => {
            setHighlightedSeatIds(new Set());
          }, 3000);
        } else {
          alert(`No ${count} adjacent seats found.`);
        }
        
        setIsSearching(false);
      }, 100);
    },
    [venue, selectMultiple]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-bg">
        <div className="text-gray-700 dark:text-dark-text text-xl font-medium bg-white dark:bg-dark-surface px-8 py-6 rounded-lg shadow animate-pulse">
          Loading venue data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-bg">
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error</h2>
          <p className="text-gray-700 dark:text-dark-text-muted">{error}</p>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-bg">
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text">No venue data available</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-dark-bg overflow-x-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border shadow-sm px-4 sm:px-6 py-4 sm:py-5 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-dark-text">
              {venue.name}
            </h1>
            {wsConnected && (
              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                ● Live Updates
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600 dark:text-dark-text-muted">
            <p className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-dark-text">Select up to {maxSelections} seats</span>
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
      <main className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 sm:gap-6 p-4 sm:p-6 overflow-y-auto">
        {/* Seating Map Section */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-3 sm:p-6 overflow-hidden min-h-[500px] w-full">
          <MapControls
            showHeatMap={showHeatMap}
            onHeatMapToggle={() => setShowHeatMap(!showHeatMap)}
            onFindAdjacentSeats={handleFindAdjacentSeats}
            isSearching={isSearching}
          />
          <div className="mt-4">
            <SeatingMap
              venue={venue}
              selectedSeatIds={selectedSeatIds}
              onSeatClick={handleSeatClick}
              onSeatFocus={handleSeatFocus}
              showHeatMap={showHeatMap}
              highlightedSeatIds={highlightedSeatIds}
              seatStatusChanges={seatStatusChanges}
            />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-4 sm:gap-6 w-full lg:w-auto">
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
