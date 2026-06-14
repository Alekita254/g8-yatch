import { useEffect, useState } from 'react';

const QUERY = '(min-width: 1024px)';

export default function useDesktopViewport() {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const update = (event) => setIsDesktop(event.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return isDesktop;
}
