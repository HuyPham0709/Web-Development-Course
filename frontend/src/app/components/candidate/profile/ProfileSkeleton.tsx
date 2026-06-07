import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function profileskeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;
}