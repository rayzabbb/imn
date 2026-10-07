/* eslint-disable react/prop-types -- project doesn't use prop-types elsewhere */
import React from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import useHorizontalScroller from './useHorizontalScroller';
import './HorizontalScroller.css';

/**
 * A horizontally scrolling row with round arrow buttons on its sides.
 * Swiping / wheel scrolling keep working; each arrow hides itself when
 * there's nothing more in its direction. RTL: the right arrow goes back
 * towards the start, the left arrow goes forward.
 *
 * trackClassName styles the scrolling row itself (gap, snap, padding...);
 * className lets a page restyle the wrapper and its arrows.
 */
const HorizontalScroller = ({
  children,
  className = '',
  trackClassName = '',
  contentKey,
  prevLabel = 'הקודם',
  nextLabel = 'הבא',
}) => {
  const scroller = useHorizontalScroller(contentKey);

  return (
    <div className={`h-scroller ${className}`}>
      <button
        type="button"
        className={`h-scroller-arrow h-scroller-arrow--prev ${scroller.canPrev ? '' : 'h-scroller-arrow--hidden'}`}
        onClick={() => scroller.scroll('prev')}
        disabled={!scroller.canPrev}
        aria-label={prevLabel}
      >
        <ChevronRightIcon />
      </button>

      <div className={trackClassName} ref={scroller.ref} onScroll={scroller.update}>
        {children}
      </div>

      <button
        type="button"
        className={`h-scroller-arrow h-scroller-arrow--next ${scroller.canNext ? '' : 'h-scroller-arrow--hidden'}`}
        onClick={() => scroller.scroll('next')}
        disabled={!scroller.canNext}
        aria-label={nextLabel}
      >
        <ChevronLeftIcon />
      </button>
    </div>
  );
};

export default HorizontalScroller;
