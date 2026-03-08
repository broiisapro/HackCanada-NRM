"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PageLoader } from "@/components/ui/page-loader";

/**
 * Shows full-page loader when user clicks an internal link.
 * Next.js loading.tsx often doesn't appear for fast client-side navigations,
 * so we intercept link clicks and show loading until the route changes.
 */
export function NavigationLoader() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor?.href) return;

      try {
        const url = new URL(anchor.href);
        if (url.origin === window.location.origin && url.pathname !== pathname) {
          setIsNavigating(true);
        }
      } catch {
        // Ignore invalid URLs
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname]);

  useEffect(() => {
    if (!isNavigating) return;
    setIsNavigating(false);
  }, [pathname]);

  // Fallback: hide after 3s if pathname didn't change (e.g. same-page link)
  useEffect(() => {
    if (!isNavigating) return;
    const t = setTimeout(() => setIsNavigating(false), 3000);
    return () => clearTimeout(t);
  }, [isNavigating]);

  if (!isNavigating) return null;
  return <PageLoader />;
}
