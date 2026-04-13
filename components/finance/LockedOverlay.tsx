'use client';

import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LockedOverlayProps {
  onUnlock: () => void;
  isUnlocking?: boolean;
}

export function LockedOverlay({ onUnlock, isUnlocking }: LockedOverlayProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-background/80 backdrop-blur-sm">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">Vault Locked</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Enter your password to unlock
        </p>
        <Button onClick={onUnlock} disabled={isUnlocking}>
          {isUnlocking ? 'Unlocking...' : 'Unlock Vault'}
        </Button>
      </div>
    </div>
  );
}
