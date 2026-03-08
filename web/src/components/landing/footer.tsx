"use client";

import { Flame } from "lucide-react";
import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Dashboard", href: "/upload" },
  ],
  Resources: [
    { label: "Tech Stack", href: "#tech-stack" },
    { label: "FAQ", href: "#faq" },
  ],
  Dashboard: [
    { label: "Upload & Analyze", href: "/upload" },
    { label: "Heatmap", href: "/heatmap" },
    { label: "Analytics", href: "/analytics" },
  ],
};

export function Footer() {
  return (
    <footer className="relative z-10 w-full border-t border-[var(--border-subtle)] bg-[var(--bg-base)]">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--red-600)]">
                <Flame className="h-4 w-4 text-white" />
              </div>
              <span
                className="text-lg font-bold tracking-tight text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Pyros
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
              Wildfire detection through spectral imaging and AI analysis.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                {category}
              </h4>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("#") ? (
                      <a
                        href={link.href}
                        className="text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--text-primary)]"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--text-primary)]"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--border-subtle)] pt-8 md:flex-row">
          <p className="text-xs text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} Pyros. Built for HackCanada 2026.
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Wildfire Detection Dashboard
          </p>
        </div>
      </div>
    </footer>
  );
}
