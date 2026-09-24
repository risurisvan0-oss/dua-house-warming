import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-charcoal/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-ivory p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-forest/15" />
            {title && <h2 className="font-heading text-xl text-forest mb-3">{title}</h2>}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
