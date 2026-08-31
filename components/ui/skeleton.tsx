import React from 'react';

/**
 * Base skeleton loading primitive.
 * Uses Tailwind animate-pulse with prefers-reduced-motion support.
 * Individual skeleton elements are aria-hidden; wrap groups in a
 * container with role="status" and aria-busy="true".
 */
export function Skeleton({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-current opacity-10 motion-reduce:animate-none ${className}`}
      {...props}
    />
  );
}

/**
 * Wrapper for a group of skeleton elements.
 * Provides accessible loading semantics.
 */
export function SkeletonGroup({
  className = '',
  children,
  label = 'Loading content',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { label?: string }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={className}
      {...props}
    >
      {children}
      <span className="sr-only">{label}</span>
    </div>
  );
}
