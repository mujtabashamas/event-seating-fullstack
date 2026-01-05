import { memo, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext.js';

interface MapControlsProps {
  showHeatMap: boolean;
  onHeatMapToggle: () => void;
  onFindAdjacentSeats: (count: number) => void;
  isSearching?: boolean;
}

function MapControlsComponent({ showHeatMap, onHeatMapToggle, onFindAdjacentSeats, isSearching = false }: MapControlsProps) {
  const { theme, toggleTheme } = useTheme();
  const [adjacentCount, setAdjacentCount] = useState(2);

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-dark-surface rounded-lg shadow border border-gray-200 dark:border-dark-border">
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        className="px-4 py-2 bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-dark-border text-gray-900 dark:text-dark-text rounded font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-dark-surface"
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>

      {/* Heat Map Toggle */}
      <button
        onClick={onHeatMapToggle}
        aria-label={showHeatMap ? 'Disable heat map' : 'Enable heat map'}
        className={`px-4 py-2 rounded font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-dark-surface ${
          showHeatMap
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-dark-border text-gray-900 dark:text-dark-text'
        }`}
      >
        {showHeatMap ? '🗺️ Heat Map: On' : '🗺️ Heat Map: Off'}
      </button>

      {/* Find Adjacent Seats */}
      <div className="flex items-center gap-2">
        <label htmlFor="adjacent-count" className="text-sm font-medium text-gray-700 dark:text-dark-text-muted">
          Find:
        </label>
        <input
          id="adjacent-count"
          type="number"
          min="2"
          max="8"
          value={adjacentCount}
          onChange={(e) => setAdjacentCount(Number(e.target.value))}
          className="w-16 px-2 py-1 border border-gray-300 dark:border-dark-border rounded bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => onFindAdjacentSeats(adjacentCount)}
          disabled={isSearching}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-dark-surface"
        >
          {isSearching ? '⏳ Searching...' : '🔍 Find Adjacent'}
        </button>
      </div>
    </div>
  );
}

export const MapControls = memo(MapControlsComponent);

