// Absolutely-positioned teak zigzag trim along the top and/or bottom of the
// nearest `relative` ancestor. Decorative only. Pass `top={false}` on
// screens that already have a fixed bar across the top.
export function LatticeBorder({ top = true }: { top?: boolean }) {
  return (
    <>
      {top && (
        <div aria-hidden="true" className="lattice-strip lattice-strip-top pointer-events-none absolute inset-x-0 top-0 z-0" />
      )}
      <div aria-hidden="true" className="lattice-strip lattice-strip-bottom pointer-events-none absolute inset-x-0 bottom-0 z-0" />
    </>
  );
}
