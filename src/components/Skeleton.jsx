export default function Skeleton({ className = '', width, height = '16px', rounded = 'xl' }) {
  return (
    <div
      className={`bg-brand-text/5 animate-pulse rounded-${rounded} ${className}`}
      style={{ width, height }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton width="48px" height="48px" rounded="2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height="16px" />
          <Skeleton width="40%" height="12px" />
        </div>
      </div>
      <Skeleton width="100%" height="120px" rounded="2xl" className="mb-3" />
    </div>
  );
}

export function WeatherSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm animate-fade-in mb-6">
      <div className="flex justify-between items-center mb-5">
        <div className="space-y-2">
          <Skeleton width="80px" height="40px" />
          <Skeleton width="100px" height="14px" />
        </div>
        <Skeleton width="64px" height="64px" rounded="2xl" />
      </div>
      <div className="grid grid-cols-4 gap-3 pt-4 border-t border-brand-text/5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <Skeleton width="20px" height="20px" />
            <Skeleton width="40px" height="12px" />
            <Skeleton width="30px" height="10px" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FactorsSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm animate-fade-in">
      <Skeleton width="140px" height="16px" className="mb-4" />
      <div className="grid grid-cols-3 gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`bg-brand-bg rounded-2xl p-4 text-center ${i === 4 ? 'col-span-2' : ''}`}>
            <Skeleton width="24px" height="24px" rounded="full" className="mx-auto mb-2" />
            <Skeleton width="50px" height="24px" className="mx-auto mb-1" />
            <Skeleton width="60px" height="10px" className="mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
