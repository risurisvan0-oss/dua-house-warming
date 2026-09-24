import { motion } from 'framer-motion';

export function Stepper({ activeIndex, labels }: { activeIndex: number; labels: string[] }) {
  return (
    <div className="flex items-start">
      {labels.map((label, i) => {
        const done = i <= activeIndex;
        const isLast = i === labels.length - 1;
        return (
          <div key={label} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
            <div className="flex flex-col items-center" style={{ width: isLast ? 'auto' : undefined }}>
              <motion.div
                animate={{
                  scale: i === activeIndex ? [1, 1.18, 1] : 1,
                  backgroundColor: done ? 'var(--color-forest)' : 'rgba(59,36,22,0.12)',
                }}
                transition={{ duration: 0.5 }}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-ivory"
              >
                {done ? '✓' : ''}
              </motion.div>
              <span
                className={`mt-1.5 max-w-[54px] text-center text-[9px] uppercase tracking-wide leading-tight ${
                  done ? 'text-forest font-semibold' : 'text-charcoal/35'
                }`}
              >
                {label}
              </span>
            </div>
            {!isLast && (
              <div className="mx-1 h-0.5 flex-1 -translate-y-[13px] overflow-hidden rounded-full bg-forest/10">
                <motion.div
                  className="h-full bg-forest"
                  initial={false}
                  animate={{ width: i < activeIndex ? '100%' : '0%' }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
