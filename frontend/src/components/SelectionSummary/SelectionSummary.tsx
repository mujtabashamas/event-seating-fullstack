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

  if (selectedCount === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-6 border-t-4 border-purple-500 transition-all duration-300">
        <div className="flex flex-col items-center justify-center min-h-[150px] text-center text-slate-400">
          <p className="text-lg font-medium">No seats selected</p>
          <p className="text-sm mt-2">Select up to {maxSelections} seats from the map</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 border-t-4 border-purple-500 transition-all duration-300 hover:shadow-3xl hover:-translate-y-1">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Selected Seats ({selectedCount}/{maxSelections})
        </h3>
        {selectedCount > 0 && (
          <button
            onClick={onClear}
            aria-label="Clear all selections"
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold text-sm hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Clear All
          </button>
        )}
      </div>

      <ul className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto mb-5 scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-slate-100">
        {selectedSeats.map((seat) => (
          <li key={seat.id} className="bg-slate-50 rounded-lg p-3 flex flex-col gap-1 hover:bg-slate-100 transition-colors">
            <span className="font-bold text-slate-900 text-sm">{seat.id}</span>
            <span className="text-xs text-slate-600">Tier {seat.priceTier}</span>
          </li>
        ))}
      </ul>

      <div className="border-t border-slate-200 pt-5">
        <div className="flex justify-between items-center mb-3">
          <span className="text-lg font-semibold text-slate-700">Subtotal:</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ${calculateSubtotal().toFixed(2)}
          </span>
        </div>
        
        {!canSelectMore && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm font-medium text-center" role="alert">
            Maximum {maxSelections} seats selected
          </div>
        )}
      </div>
    </div>
  );
}

export const SelectionSummary = memo(SelectionSummaryComponent);
