import { useCallback, useEffect, useRef, useMemo } from 'react';
import lodashDebounce from 'lodash/debounce';

import type { RefObject, MutableRefObject } from 'react';

export type DebounceOptions = Parameters<typeof lodashDebounce>[2];

const createCallback = (
  debounce: number,
  handleOnScroll: () => void,
  options: DebounceOptions,
): (() => void) => {
  if (debounce) {
    return lodashDebounce(handleOnScroll, debounce, options);
  }
  return handleOnScroll;
};

/**
 * @description
 *  A react hook that invokes a callback when user scrolls to the bottom
 *
 * @param onBottom
 * - Required callback that will be invoked when scrolled to bottom
 * @param {Object} options
 * - Optional parameters
 * @param {number} [options.offset=0]
 * - Offset from bottom of page in pixels.
 * E.g. 300 will trigger onBottom 300px from the bottom of the page
 * @param {number} [options.debounce=200]
 * - Optional debounce in milliseconds, defaults to 200ms
 * @param {DebounceOptions} [options.debounceOptions={leading=true}]
 * - Options passed to lodash.debounce, see https://lodash.com/docs/4.17.15#debounce
 * @param {boolean} [options.triggerOnNoScroll=false]
 * - Triggers the onBottom callback when the page has no scrollbar
 * @returns {RefObject} ref
 * - If passed to a element as a ref, e.g. a div it will register scrolling
 * to the bottom of that div instead of document viewport
 */

function useBottomScrollListener<T extends HTMLDivElement>(
  onBottom: () => void,
  scrollref?: MutableRefObject<HTMLDivElement | null>,
  options?: {
    offset?: number;
    debounce?: number;
    debounceOptions?: DebounceOptions;
    triggerOnNoScroll?: boolean;
  },
): RefObject<T> {
  const { offset, triggerOnNoScroll, debounce, debounceOptions } = useMemo(
    () => ({
      offset: options?.offset ?? 0,
      debounce: options?.debounce ?? 200,
      debounceOptions: options?.debounceOptions ?? { leading: true },
      triggerOnNoScroll: options?.triggerOnNoScroll ?? false,
    }),
    [options?.offset, options?.debounce, options?.debounceOptions, options?.triggerOnNoScroll],
  );

  const debouncedOnBottom = useMemo(
    () => createCallback(debounce, onBottom, debounceOptions),
    [debounce, debounceOptions, onBottom],
  );

  const noRef = useRef<T>(null);
  const containerRef = scrollref || noRef;
  const handleOnScroll = useCallback(() => {
    if (containerRef.current != null) {
      const scrollNode = containerRef.current;
      const scrollContainerBottomPosition = Math.round(
        scrollNode.scrollTop + scrollNode.clientHeight,
      );
      const scrollPosition = Math.round(scrollNode.scrollHeight - offset);

      if (scrollPosition <= scrollContainerBottomPosition) {
        debouncedOnBottom();
      }
    } else {
      const scrollNode: Element = document.scrollingElement || document.documentElement;
      const scrollContainerBottomPosition = Math.round(scrollNode.scrollTop + window.innerHeight);
      const scrollPosition = Math.round(scrollNode.scrollHeight - offset);

      if (scrollPosition <= scrollContainerBottomPosition) {
        debouncedOnBottom();
      }
    }
    // ref dependency needed for the tests, doesn't matter for normal execution
  }, [containerRef, offset, debouncedOnBottom]);

  useEffect((): (() => void) => {
    const ref = containerRef.current;

    if (ref != null) {
      ref.addEventListener('scroll', handleOnScroll);
    } else {
      window.addEventListener('scroll', handleOnScroll);
    }

    if (triggerOnNoScroll) {
      handleOnScroll();
    }

    return () => {
      if (ref != null) {
        ref.removeEventListener('scroll', handleOnScroll);
      } else {
        window.removeEventListener('scroll', handleOnScroll);
      }
    };
  }, [handleOnScroll, triggerOnNoScroll, debounce, containerRef]);

  return containerRef as RefObject<T>;
}

export default useBottomScrollListener;
