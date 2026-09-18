import { useEffect } from 'react';

/**
 * Marks the page as ready for prerender capture once its primary data has
 * loaded. The build-time prerender script polls for this flag instead of
 * using an arbitrary sleep delay.
 */
export function useSsrReady(ready) {
  useEffect(() => {
    if (ready) document.body.dataset.ssrReady = 'true';
    else delete document.body.dataset.ssrReady;
    return () => { delete document.body.dataset.ssrReady; };
  }, [ready]);
}
