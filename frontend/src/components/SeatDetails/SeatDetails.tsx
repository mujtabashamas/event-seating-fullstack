import { memo } from 'react';
import type { SeatDetails as SeatDetailsType } from '../../types/index.js';

interface SeatDetailsProps {
  seat: SeatDetailsType | null;
}

function SeatDetailsComponent({ seat }: SeatDetailsProps) {
  if (!seat) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-6 border-t-4 border-indigo-500 transition-all duration-300 hover:shadow-3xl hover:-translate-y-1">
        <div className="flex flex-col items-center justify-center min-h-[180px] text-slate-400 italic text-center gap-2">
          <span className="text-5xl opacity-30">🎫</span>
          <p>Click or navigate to a seat to view details</p>
        </div>
      </div>
    );
  }

  const statusConfig = {
    available: {
      bg: 'bg-gradient-to-r from-emerald-100 to-emerald-200',
      text: 'text-emerald-800',
      dot: 'bg-emerald-500',
    },
    reserved: {
      bg: 'bg-gradient-to-r from-amber-100 to-amber-200',
      text: 'text-amber-800',
      dot: 'bg-amber-500',
    },
    sold: {
      bg: 'bg-gradient-to-r from-red-100 to-red-200',
      text: 'text-red-800',
      dot: 'bg-red-500',
    },
    held: {
      bg: 'bg-gradient-to-r from-slate-100 to-slate-200',
      text: 'text-slate-700',
      dot: 'bg-slate-500',
    },
  };

  const config = statusConfig[seat.status];
  const statusLabel = seat.status.charAt(0).toUpperCase() + seat.status.slice(1);

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 border-t-4 border-indigo-500 transition-all duration-300 hover:shadow-3xl hover:-translate-y-1">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-5">
        Seat Details
      </h3>
      
      <dl className="space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Section:</dt>
          <dd className="text-base font-bold text-slate-900">{seat.sectionLabel}</dd>
        </div>
        
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Row:</dt>
          <dd className="text-base font-bold text-slate-900">{seat.rowIndex}</dd>
        </div>
        
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Seat:</dt>
          <dd className="text-base font-bold text-slate-900">{seat.id}</dd>
        </div>
        
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Status:</dt>
          <dd>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
              <span className={`w-2 h-2 rounded-full ${config.dot} shadow-lg`}></span>
              {statusLabel}
            </span>
          </dd>
        </div>
        
        <div className="flex justify-between items-center">
          <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Price Tier:</dt>
          <dd className="text-base font-bold text-slate-900">{seat.priceTier}</dd>
        </div>
      </dl>
    </div>
  );
}

export const SeatDetails = memo(SeatDetailsComponent);
