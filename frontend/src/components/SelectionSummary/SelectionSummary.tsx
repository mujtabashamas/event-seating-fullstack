import { memo } from 'react';
import type { SelectedSeat } from '../../types/index.js';

interface SelectionSummaryProps {
  selectedSeats: SelectedSeat[];
  maxSelections: number;
  onClear: () => void;
}

function SelectionSummaryComponent({
  selectedSeats,
  maxSelections,
  onClear,
}: SelectionSummaryProps) {
  const selectedCount = selectedSeats.length;
  const canSelectMore = selectedCount < maxSelections;

  const calculateSubtotal = (): number => {
    return selectedSeats.reduce((total, seat) => {
      const basePrice = 50;
      const tierMultiplier = seat.priceTier;
      return total + basePrice * tierMultiplier;
    }, 0);
  };

  const getSeatPrice = (priceTier: number): number => {
    return 50 * priceTier;
  };

  if (selectedCount === 0) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
        <div className="flex flex-col items-center justify-center min-h-[150px] text-center text-gray-400 dark:text-dark-text-muted">
          <p className="text-base font-medium">No seats selected</p>
          <p className="text-sm mt-2">Select up to {maxSelections} seats from the map</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text">
          Selected Seats ({selectedCount}/{maxSelections})
        </h3>
        {selectedCount > 0 && (
          <button
            onClick={onClear}
            aria-label="Clear all selections"
            className="px-4 py-2 bg-red-600 text-white rounded font-medium text-sm hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-dark-surface"
          >
            Clear All
          </button>
        )}
      </div>

      <ul className="space-y-2 max-h-[240px] overflow-y-auto mb-5">
        {selectedSeats.map((seat) => (
          <li key={seat.id} className="bg-gray-50 dark:bg-dark-bg rounded p-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-dark-border transition-colors">
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-gray-900 dark:text-dark-text text-sm">{seat.id}</span>
              <span className="text-xs text-gray-600 dark:text-dark-text-muted">Price Tier {seat.priceTier}</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-dark-text">${getSeatPrice(seat.priceTier)}</span>
          </li>
        ))}
      </ul>

      <div className="border-t border-gray-200 dark:border-dark-border pt-5">
        <div className="flex justify-between items-center mb-3">
          <span className="text-base font-semibold text-gray-700 dark:text-dark-text-muted">Subtotal:</span>
          <span className="text-2xl font-bold text-gray-900 dark:text-dark-text">
            ${calculateSubtotal().toFixed(2)}
          </span>
        </div>
        
        {!canSelectMore && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm font-medium text-center" role="alert">
            Maximum {maxSelections} seats selected
          </div>
        )}
      </div>
    </div>
  );
}

export const SelectionSummary = memo(SelectionSummaryComponent);
