'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface BandwidthContextType {
  isLiteMode: boolean;
  toggleLiteMode: () => void;
  isOnline: boolean;
  networkSpeed: 'fast' | 'moderate' | 'slow' | 'offline';
}

const BandwidthContext = createContext<BandwidthContextType>({
  isLiteMode: false,
  toggleLiteMode: () => {},
  isOnline: true,
  networkSpeed: 'fast',
});

export const BandwidthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLiteMode, setIsLiteMode] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [networkSpeed, setNetworkSpeed] = useState<'fast' | 'moderate' | 'slow' | 'offline'>('fast');

  useEffect(() => {
    // 1. Restore saved Lite Mode preference
    const saved = localStorage.getItem('smartcrop_lite_mode');
    if (saved === 'true') {
      setIsLiteMode(true);
    }

    // 2. Online / Offline listeners
    const handleOnline = () => {
      setIsOnline(true);
      setNetworkSpeed('fast');
    };
    const handleOffline = () => {
      setIsOnline(false);
      setNetworkSpeed('offline');
      // Automatically enable Lite Mode when offline
      setIsLiteMode(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOnline(false);
      setNetworkSpeed('offline');
      setIsLiteMode(true);
    }

    // 3. Network Information API (if supported on Android/Chrome)
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (conn) {
      const updateConnection = () => {
        if (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g' || conn.saveData) {
          setNetworkSpeed('slow');
          setIsLiteMode(true);
        } else if (conn.effectiveType === '3g') {
          setNetworkSpeed('moderate');
        } else {
          setNetworkSpeed('fast');
        }
      };

      updateConnection();
      conn.addEventListener('change', updateConnection);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        conn.removeEventListener('change', updateConnection);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleLiteMode = () => {
    setIsLiteMode((prev) => {
      const next = !prev;
      localStorage.setItem('smartcrop_lite_mode', next ? 'true' : 'false');
      return next;
    });
  };

  return (
    <BandwidthContext.Provider value={{ isLiteMode, toggleLiteMode, isOnline, networkSpeed }}>
      {children}
    </BandwidthContext.Provider>
  );
};

export const useBandwidth = () => useContext(BandwidthContext);

/**
 * Utility to fetch data with localStorage caching for Lite Mode and Offline resilience
 */
export async function fetchWithCache<T = any>(
  url: string,
  options?: RequestInit,
  cacheDurationMs: number = 1000 * 60 * 30 // 30 minutes
): Promise<T> {
  const cacheKey = `smartcrop_cache_${url}`;
  
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { timestamp, data } = JSON.parse(cached);
        const isFresh = Date.now() - timestamp < cacheDurationMs;
        const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
        const isLite = localStorage.getItem('smartcrop_lite_mode') === 'true';

        // Return cached immediately if offline or fresh in lite mode
        if (isOffline || (isLite && isFresh)) {
          return data as T;
        }
      } catch {
        // ignore parse error
      }
    }
  }

  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const data = await res.json();
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data }));
      } catch {
        // quota exceeded fallback
      }
    }
    return data as T;
  } catch (err) {
    if (typeof window !== 'undefined') {
      const fallback = localStorage.getItem(cacheKey);
      if (fallback) {
        try {
          return JSON.parse(fallback).data as T;
        } catch {
          // ignore
        }
      }
    }
    throw err;
  }
}
