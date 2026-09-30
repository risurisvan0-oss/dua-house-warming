import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/** A message "from the hosts" — left-aligned, ivory, with a small tail. */
export function HostBubble({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="max-w-[82%] rounded-2xl rounded-bl-md bg-ivory px-4 py-2.5 text-[15px] leading-relaxed text-charcoal shadow-sm"
    >
      {children}
    </motion.div>
  );
}

/** The guest's own reply — right-aligned, gold. */
export function GuestBubble({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="ml-auto max-w-[82%] rounded-2xl rounded-br-md bg-gold px-4 py-2.5 text-[15px] leading-relaxed text-forest shadow-sm"
    >
      {children}
    </motion.div>
  );
}

/** The three-dot "…is typing" indicator shown while a host bubble is pending. */
export function TypingDots() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md bg-ivory px-4 py-3 shadow-sm">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-forest/40"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

/** A row of tappable "quick reply" chips, WhatsApp/iMessage-suggestion style. */
export function QuickReplies({
  options,
  onSelect,
}: {
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="ml-auto flex max-w-[92%] flex-wrap justify-end gap-2"
    >
      {options.map((o) => (
        <motion.button
          key={o.value}
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(o.value)}
          className="rounded-full border border-gold-deep/50 bg-transparent px-4 py-2 text-sm font-medium text-forest hover:bg-gold/15"
        >
          {o.label}
        </motion.button>
      ))}
    </motion.div>
  );
}

/** A stepper (−/N/+) presented as a single inline "bubble", for headcount. */
export function StepperBubble({
  value,
  min = 1,
  max = 8,
  onChange,
  onConfirm,
  confirmLabel,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  onConfirm: () => void;
  confirmLabel: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="ml-auto flex max-w-[92%] items-center gap-3 rounded-2xl rounded-br-md bg-gold/15 border border-gold-deep/30 px-4 py-2.5"
    >
      <button
        type="button"
        aria-label="Fewer"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-gold-deep/50 text-forest"
      >
        −
      </button>
      <span className="w-6 text-center font-heading text-xl text-forest">{value}</span>
      <button
        type="button"
        aria-label="More"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-gold-deep/50 text-forest"
      >
        +
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="ml-1 rounded-full bg-forest px-3.5 py-1.5 text-xs font-semibold text-ivory"
      >
        {confirmLabel}
      </button>
    </motion.div>
  );
}

/** A free-text reply, sent like a chat message — for guest names / dietary notes. */
export function ChatComposer({
  value,
  onChange,
  onSubmit,
  onSkip,
  placeholder,
  sendLabel,
  skipLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onSkip?: () => void;
  placeholder: string;
  sendLabel: string;
  skipLabel?: string;
}) {
  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="ml-auto flex max-w-[92%] items-center gap-2"
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-full border border-gold-deep/40 bg-ivory px-4 py-2.5 text-sm text-charcoal outline-none focus:border-gold"
      />
      {onSkip && (
        <button type="button" onClick={onSkip} className="shrink-0 text-xs text-charcoal/45 underline">
          {skipLabel}
        </button>
      )}
      <button
        type="submit"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest text-ivory"
        aria-label={sendLabel}
      >
        ➤
      </button>
    </motion.form>
  );
}
