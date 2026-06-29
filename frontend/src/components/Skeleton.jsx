export default function Skeleton({ className = '', width, height = '16px', rounded = '10' }) {
  return (
    <div
      className={`animate-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius: `${rounded}px`,
        background: 'rgba(35,66,41,0.06)',
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div
      className="animate-fade-in overflow-hidden"
      style={{
        background: '#fff',
        borderRadius: '20px',
        border: '1px solid rgba(35,66,41,0.08)',
        boxShadow: '0 1px 4px rgba(35,66,41,0.04)',
      }}
    >
      <Skeleton width="100%" height="148px" rounded="0" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton width="40px" height="40px" rounded="12" />
          <div className="flex-1 space-y-2">
            <Skeleton width="55%" height="15px" />
            <Skeleton width="35%" height="11px" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function WeatherSkeleton() {
  return (
    <div
      className="animate-fade-in mb-6"
      style={{
        background: 'linear-gradient(135deg, rgba(35,66,41,0.08) 0%, rgba(47,93,58,0.08) 100%)',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid rgba(35,66,41,0.08)',
      }}
    >
      <div className="flex justify-between items-start mb-5">
        <div className="space-y-2">
          <Skeleton width="90px" height="42px" />
          <Skeleton width="110px" height="13px" />
        </div>
        <Skeleton width="52px" height="52px" rounded="14" />
      </div>
      <div className="grid grid-cols-3 gap-3 pt-4" style={{ borderTop: '1px solid rgba(35,66,41,0.08)' }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <Skeleton width="18px" height="18px" rounded="6" />
            <Skeleton width="44px" height="12px" />
            <Skeleton width="32px" height="9px" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FactorsSkeleton() {
  return (
    <div
      className="animate-fade-in p-5"
      style={{
        background: '#fff',
        borderRadius: '20px',
        border: '1px solid rgba(35,66,41,0.08)',
        boxShadow: '0 1px 4px rgba(35,66,41,0.04)',
      }}
    >
      <Skeleton width="140px" height="15px" className="mb-4" />
      <div className="grid grid-cols-3 gap-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`rounded-2xl p-4 text-center ${i === 4 ? 'col-span-2' : ''}`}
            style={{ background: 'rgba(35,66,41,0.04)' }}
          >
            <Skeleton width="24px" height="24px" rounded="12" className="mx-auto mb-2" />
            <Skeleton width="50px" height="22px" className="mx-auto mb-1" />
            <Skeleton width="60px" height="10px" className="mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
