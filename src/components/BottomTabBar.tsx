import { motion } from 'framer-motion';

export type StoryTab = 'home' | 'details' | 'rsvp' | 'journey';

interface TabDef {
  key: StoryTab;
  icon: string;
  label: string;
}

/**
 * A standard mobile-app bottom tab bar — the single most recognizable
 * "this is an app, not a webpage" signal. Replaces the old scroll-through
 * structure: each tab is a full screen, switched instantly rather than
 * scrolled to. Fixed to the viewport bottom with safe-area padding, like
 * every native tab bar; content max-width matches the rest of the app's
 * fixed chrome (see App.tsx's top bar) so it reads as one consistent shell.
 */
export function BottomTabBar({
  tabs,
  active,
  onChange,
  badge,
}: {
  tabs: TabDef[];
  active: StoryTab;
  onChange: (tab: StoryTab) => void;
  /** Tab key -> small dot badge (e.g. a ✓ once RSVP is answered). */
  badge?: Partial<Record<StoryTab, string>>;
}) {
  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-forest/10 bg-ivory/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur"
    >
      <div className="mx-auto flex max-w-sm items-stretch justify-between px-2">
        {tabs.map((tab) => {
          const selected = active === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              aria-current={selected ? 'page' : undefined}
              className="relative flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5"
            >
              {selected && (
                <motion.span
                  layoutId="tab-highlight"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  className="absolute inset-x-1.5 inset-y-0.5 -z-10 rounded-xl bg-gold/20"
                />
              )}
              <span className="relative text-xl leading-none">
                {tab.icon}
                {badge?.[tab.key] && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald text-[9px] text-ivory">
                    {badge[tab.key]}
                  </span>
                )}
              </span>
              <span className={`text-[10px] font-semibold uppercase tracking-wide ${selected ? 'text-forest' : 'text-charcoal/45'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
