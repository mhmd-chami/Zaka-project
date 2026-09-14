import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef } from 'react';

const SHAKE_THRESHOLD = 1.8;
const COOLDOWN_MS = 8000;

export function useShakeSOS(onShake: () => void, enabled: boolean) {
  const lastShake = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    Accelerometer.setUpdateInterval(100);

    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const force = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();

      if (force > SHAKE_THRESHOLD && now - lastShake.current > COOLDOWN_MS) {
        lastShake.current = now;
        onShake();
      }
    });

    return () => sub.remove();
  }, [enabled, onShake]);
}
