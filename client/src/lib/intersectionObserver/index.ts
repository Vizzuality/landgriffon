import { useEffect } from 'react';

type intersectionObserverRootProps = {
  current?: Element,
}

type intersectionObserverTargetProps = {
  current?: Element,
}

// TODO: is this OK?
type intersectionObserverProps = {
  root?: intersectionObserverRootProps;
  target: intersectionObserverTargetProps;
  onIntersect: any;
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
};

export default function useIntersectionObserver({
  root,
  target,
  onIntersect,
  threshold = 1.0,
  rootMargin = '0px',
  enabled = true,
}: intersectionObserverProps) {
  useEffect(() => {
    if (!enabled) {
      return
    }

    const observer = new IntersectionObserver(
      entries =>
        entries.forEach(entry => entry.isIntersecting && onIntersect()),
      {
        root: root && root.current,
        rootMargin,
        threshold,
      }
    )

    const el = target && target.current

    if (!el) {
      return
    }

    observer.observe(el)

    return () => {
      observer.unobserve(el)
    }
  }, [target.current, enabled])
}
