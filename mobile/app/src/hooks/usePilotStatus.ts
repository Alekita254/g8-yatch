import { useMemo } from 'react';

import type { PilotStatus } from '../types/pilot';

export function usePilotStatus(): PilotStatus {
  return useMemo(
    () => ({
      isOnline: true,
      isSyncReady: true,
      message:
        'Backend safety work is in progress: idempotent order/payment writes are now implemented.',
    }),
    [],
  );
}
