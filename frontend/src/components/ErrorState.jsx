import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
      <div className="w-16 h-16 bg-brand-danger/10 rounded-full flex items-center justify-center mb-4">
        <AlertCircle size={28} className="text-brand-danger" />
      </div>
      <h3 className="text-base font-bold text-brand-text mb-1">Error</h3>
      <p className="text-sm text-brand-text-muted max-w-[260px] leading-relaxed mb-5">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl shadow-sm text-sm font-semibold text-brand-text hover:shadow-md transition-all active:scale-[0.98]"
        >
          <RefreshCw size={15} />
          Try Again
        </button>
      )}
    </div>
  );
}
