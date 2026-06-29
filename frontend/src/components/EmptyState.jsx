export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in col-span-full">
      {Icon && (
        <div
          style={{
            width: '72px', height: '72px', borderRadius: '20px',
            background: 'rgba(35,66,41,0.06)',
            border: '1px solid rgba(35,66,41,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '20px',
          }}
        >
          <Icon size={32} strokeWidth={1.5} style={{ color: '#2F5D3A' }} />
        </div>
      )}
      <h3 style={{ fontFamily: 'Playfair Display,serif', fontWeight: 600, fontSize: '20px', color: '#1C2B1E', marginBottom: '8px', letterSpacing: '-0.01em' }}>
        {title}
      </h3>
      <p style={{ fontFamily: 'Manrope,sans-serif', fontSize: '14px', color: '#7A8A7C', fontWeight: 400, maxWidth: '240px', lineHeight: 1.7, marginBottom: '24px' }}>
        {message}
      </p>
      {action}
    </div>
  );
}
