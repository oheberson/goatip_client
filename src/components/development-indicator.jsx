"use client";

import { useAuth } from "@/contexts/AuthContext";

export function DevelopmentIndicator() {
  const isDevelopmentMode = process.env.NEXT_PUBLIC_ENVIRONMENT === 'development';
  
  if (!isDevelopmentMode) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black text-center py-1 text-xs font-bold">
      🔧 DEVELOPMENT MODE - All auth checks bypassed
    </div>
  );
}
