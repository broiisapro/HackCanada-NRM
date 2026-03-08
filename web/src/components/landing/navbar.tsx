"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Menu, X } from "lucide-react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Tech Stack", href: "#tech-stack" },
  { label: "FAQ", href: "#faq" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#050505]/80 backdrop-blur-xl border-b border-[var(--border-subtle)]"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          aria-label="Pyros home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--red-600)] transition-all duration-300 group-hover:bg-[var(--red-500)] group-hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <span
            className="text-xl font-bold tracking-tight text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Pyros
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--text-primary)]"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/upload"
            className="rounded-full bg-[var(--red-600)] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[var(--red-500)] hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]"
          >
            Go to Dashboard
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors md:hidden hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-[var(--border-subtle)] bg-[#050505]/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)]"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/upload"
                onClick={() => setMobileOpen(false)}
                className="mt-2 rounded-full bg-[var(--red-600)] px-5 py-3 text-center text-sm font-semibold text-white"
              >
                Go to Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
