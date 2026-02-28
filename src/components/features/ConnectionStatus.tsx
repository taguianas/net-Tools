import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showStatus && isOnline) return null;

  return (
    <div className={cn(
      "fixed top-20 right-4 z-50 px-4 py-2 rounded-xl shadow-lg",
      "backdrop-blur-xl transition-all duration-300",
      isOnline 
        ? "bg-green-500/20 border border-green-500/30 text-green-400"
        : "bg-red-500/20 border border-red-500/30 text-red-400"
    )}>
      <div className="flex items-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            <span className="text-sm font-medium">Back online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">You're offline</span>
          </>
        )}
      </div>
    </div>
  );
}