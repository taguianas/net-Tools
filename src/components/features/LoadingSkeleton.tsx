import React from 'react';
import { cn } from '@/lib/utils';

export function SkeletonCard({ isDark = true }) {
  return (
    <div className={cn(
      "p-6 rounded-xl animate-pulse",
      isDark ? "bg-slate-800/50" : "bg-slate-100"
    )}>
      <div className="flex items-start gap-4">
        <div className={cn(
          "h-12 w-12 rounded-xl shimmer",
          isDark ? "bg-slate-700" : "bg-slate-200"
        )} />
        <div className="flex-1 space-y-3">
          <div className={cn(
            "h-4 rounded shimmer",
            isDark ? "bg-slate-700" : "bg-slate-200"
          )} style={{ width: '60%' }} />
          <div className={cn(
            "h-3 rounded shimmer",
            isDark ? "bg-slate-700" : "bg-slate-200"
          )} style={{ width: '80%' }} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, isDark = true }) {
  return (
    <div className={cn(
      "rounded-xl overflow-hidden",
      isDark ? "bg-slate-800/50" : "bg-white border"
    )}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={cn(
          "p-4 border-b last:border-b-0",
          isDark ? "border-slate-700" : "border-slate-200"
        )}>
          <div className="flex items-center gap-4">
            <div className={cn(
              "h-4 rounded shimmer flex-1",
              isDark ? "bg-slate-700" : "bg-slate-200"
            )} />
            <div className={cn(
              "h-4 rounded shimmer w-24",
              isDark ? "bg-slate-700" : "bg-slate-200"
            )} />
            <div className={cn(
              "h-4 rounded shimmer w-32",
              isDark ? "bg-slate-700" : "bg-slate-200"
            )} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats({ count = 4, isDark = true }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn(
          "p-4 rounded-xl animate-pulse",
          isDark ? "bg-slate-800/50" : "bg-slate-100"
        )}>
          <div className={cn(
            "h-3 w-20 rounded shimmer mb-3",
            isDark ? "bg-slate-700" : "bg-slate-200"
          )} />
          <div className={cn(
            "h-8 w-24 rounded shimmer",
            isDark ? "bg-slate-700" : "bg-slate-200"
          )} />
        </div>
      ))}
    </div>
  );
}