import { useEffect, useRef } from 'react';
import meBlip from '../meBlip.mjs';

export function useBlip(options = {}) {
  const instanceRef = useRef(null);

  useEffect(() => {
    const instance = new meBlip(options);
    instanceRef.current = instance;

    return () => {
      ['meblip-island-root', 'meblip-blocking-overlay', 'meblip-styles']
        .forEach(id => document.getElementById(id)?.remove());
      instanceRef.current = null;
    };
  }, []);

  return instanceRef.current;
}

export { meBlip };
export default useBlip;
