import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useEventConfig } from '../../hooks/useEventConfig';
import { useLanguage } from '../../hooks/useLanguage';

/**
 * The full-screen "conversation" a house hotspot opens into — styled
 * like a WhatsApp thread with the hosts, since that's literally the
 * medium every guest opened this invitation from. Auto-scrolls to the
 * newest bubble as content reveals; closes on the back button, backdrop
 * tap, or swipe-down isn't needed since it's already full-screen (a
 * dedicated close button is clearer on a chat surface than a drag handle).
 */
export function ChatModal({
  open,
  onClose,
  icon,
  children,
}: {
  open: boolean;
  onClose: () => void;
  icon: string;
  children: ReactNode;
}) {
  const eventConfig = useEventConfig();
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: 0 });
  }, [open]);

  // Follows new bubbles as they reveal, so the guest never has to
  // manually scroll to see the "typing…" indicator or the latest message.
  useEffect(() => {
    if (!open || !contentRef.current || !scrollRef.current) return;
    const content = contentRef.current;
    const container = scrollRef.current;
    const observer = new ResizeObserver(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          className="fixed inset-0 z-50 flex flex-col bg-[#efe4d0]"
          role="dialog"
          aria-modal="true"
        >
          {/* header */}
          <div className="flex items-center gap-3 border-b border-forest/10 bg-ivory px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] shadow-sm">
            <button
              type="button"
              onClick={onClose}
              aria-label={t('backToHouse')}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-forest text-xl"
            >
              ←
            </button>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest text-base">{icon}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-base text-forest">{eventConfig.hostNames}</p>
              <p className="text-[11px] text-emerald">online</p>
            </div>
          </div>

          {/* messages */}
          <div ref={scrollRef} className="paper-grain flex-1 overflow-y-auto px-4 py-5">
            <div ref={contentRef} className="space-y-2.5">
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
