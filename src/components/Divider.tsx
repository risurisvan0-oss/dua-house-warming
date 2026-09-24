export function Divider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold-deep/60" />
      <svg width="14" height="14" viewBox="0 0 14 14" className="text-gold-deep shrink-0">
        <path
          d="M7 0 L9 5 L14 7 L9 9 L7 14 L5 9 L0 7 L5 5 Z"
          fill="currentColor"
          fillOpacity="0.7"
        />
      </svg>
      <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold-deep/60" />
    </div>
  );
}
