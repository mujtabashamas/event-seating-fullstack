import { memo } from 'react';
import type { SeatDetails as SeatDetailsType } from '../../types/index.js';

interface SeatDetailsProps {
  seat: SeatDetailsType | null;
}

function SeatDetailsComponent({ seat }: SeatDetailsProps) {
  if (!seat) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
        <div className="flex flex-col items-center justify-center min-h-[180px] text-gray-400 dark:text-dark-text-muted text-center gap-2">
          <p>Click on a seat to view details</p>
        </div>
      </div>
    );
  }

  const statusConfig = {
    available: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      dot: 'bg-green-500',
    },
    reserved: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      dot: 'bg-yellow-500',
    },
    sold: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      dot: 'bg-red-500',
    },
    held: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      dot: 'bg-gray-500',
    },
  };

  const config = statusConfig[seat.status];
  const statusLabel = seat.status.charAt(0).toUpperCase() + seat.status.slice(1);

  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text mb-5">
        Seat Details
      </h3>
      
      <dl className="space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-dark-border">
          <dt className="text-sm font-medium text-gray-600 dark:text-dark-text-muted">Section:</dt>
          <dd className="text-base font-semibold text-gray-900 dark:text-dark-text">{seat.sectionLabel}</dd>
        </div>
        
        <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-dark-border">
          <dt className="text-sm font-medium text-gray-600 dark:text-dark-text-muted">Row:</dt>
          <dd className="text-base font-semibold text-gray-900 dark:text-dark-text">{seat.rowIndex}</dd>
        </div>
        
        <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-dark-border">
          <dt className="text-sm font-medium text-gray-600 dark:text-dark-text-muted">Seat:</dt>
          <dd className="text-base font-semibold text-gray-900 dark:text-dark-text">{seat.id}</dd>
        </div>
        
        <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-dark-border">
          <dt className="text-sm font-medium text-gray-600 dark:text-dark-text-muted">Status:</dt>
          <dd>
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded text-sm font-medium ${config.bg} ${config.text}`}>
              <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
              {statusLabel}
            </span>
          </dd>
        </div>
        
        <div className="flex justify-between items-center">
          <dt className="text-sm font-medium text-gray-600 dark:text-dark-text-muted">Price Tier:</dt>
          <dd className="text-base font-semibold text-gray-900 dark:text-dark-text">{seat.priceTier}</dd>
        </div>
      </dl>
    </div>
  );
}

export const SeatDetails = memo(SeatDetailsComponent);
