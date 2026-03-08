"use client";

import ConcentricRingsLoader from "@/components/ui/loading-animation-1";

export default function Loading() {
  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-background z-50">
      <ConcentricRingsLoader size={180} />
    </div>
  );
}
