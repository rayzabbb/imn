import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Arrow navigation for a horizontal scroller. Tracks whether there's more
 * content in each direction so the arrows can disable themselves.
 * RTL: scrollLeft is 0 at the start and goes negative towards the end, so
 * offsets are measured with Math.abs and "next" scrolls towards the left.
 *
 * contentKey: anything that changes when the items change (e.g. their count),
 * so the arrow state is recomputed once the items render.
 */
const useHorizontalScroller = (contentKey) => {
  const ref = useRef(null);
  const [state, setState] = useState({ canPrev: false, canNext: false });

  const update = useCallback(() => {
    const track = ref.current;
    if (!track) return;
    const offset = Math.abs(track.scrollLeft);
    setState({
      canPrev: offset > 4,
      canNext: offset + track.clientWidth < track.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [contentKey, update]);

  const scroll = (direction) => {
    const track = ref.current;
    if (!track) return;
    const amount = track.clientWidth * 0.8;
    track.scrollBy({ left: direction === 'next' ? -amount : amount, behavior: 'smooth' });
  };

  return { ref, ...state, update, scroll };
};

export default useHorizontalScroller;
