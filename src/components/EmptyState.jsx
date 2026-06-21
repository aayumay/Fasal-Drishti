export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      {Icon && (
        <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-5">
          <Icon size={36} className="text-brand-accent" />
        </div>
      )}
      <h3 className="text-xl font-bold text-brand-text mb-2">{title}</h3>
      <p className="text-sm text-brand-text-muted max-w-[260px] leading-relaxed mb-6">{message}</p>
      {action}
    </div>
  );
}
