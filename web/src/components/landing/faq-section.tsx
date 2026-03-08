"use client";

import { useState, useRef } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How does Pyros detect wildfires?",
    answer:
      "Pyros uses spectral imaging to capture emission line data from the environment. Our AI (Gemini 2.5 Flash) analyzes this spectral data to identify flammable gases and combustion byproducts, detecting fire risks before visible flames appear.",
  },
  {
    question: "What kind of accuracy can I expect?",
    answer:
      "Our spectral analysis achieves over 99% accuracy in identifying flammable gases and combustion markers. The system continuously improves as it processes more data, and confidence scores are displayed for every analysis.",
  },
  {
    question: "What hardware is required?",
    answer:
      "Pyros runs on a Raspberry Pi with a camera module and an ESP32 IMU sensor. The hardware captures spectral images and orientation data, which are processed through our web dashboard. The entire setup is lightweight and deployable in the field.",
  },
  {
    question: "How fast are the alerts?",
    answer:
      "From image capture to alert generation takes under 30 seconds. The spectral analysis runs in real-time, and when a threat is detected, Claude AI drafts a comprehensive first-responder alert with actionable intelligence.",
  },
  {
    question: "Can I customize alert thresholds?",
    answer:
      "Yes. The dashboard provides confidence scores, risk levels, and detailed gas detection data. You can monitor trends over time through the analytics tab and configure which risk levels trigger emergency alerts.",
  },
  {
    question: "Is this open source?",
    answer:
      "Pyros was built for HackCanada 2026 by a team of student innovators. The project combines AI, hardware, and software engineering to tackle wildfire detection — one of the planet's most critical challenges.",
  },
];

const AccordionItem = ({
  faq,
  isOpen,
  onToggle,
  index,
}: {
  faq: (typeof faqs)[number];
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) => {
  return (
    <div className="border-b border-[var(--border-default)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left transition-colors duration-200 hover:text-[var(--red-400)]"
        aria-expanded={isOpen}
        aria-controls={`faq-panel-${index}`}
      >
        <span
          className={`pr-4 text-base font-semibold transition-colors duration-200 ${
            isOpen ? "text-[var(--red-400)]" : "text-[var(--text-primary)]"
          }`}
        >
          {faq.question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="shrink-0 text-[var(--text-muted)]"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-panel-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-[var(--text-secondary)]">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const prefersReducedMotion = useReducedMotion();
  const noMotion = !!prefersReducedMotion;

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      ref={ref}
      className="relative z-10 w-full px-6 py-24 md:py-32"
    >
      <div className="mx-auto max-w-3xl">
        <motion.div
          className="mb-4 text-center"
          initial={noMotion ? false : { opacity: 0, y: 20 }}
          animate={
            noMotion
              ? { opacity: 1 }
              : { opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }
          }
          transition={{ duration: 0.5 }}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--red-500)]">
            FAQ&apos;s
          </span>
        </motion.div>

        <motion.h2
          className="mb-4 text-center text-3xl font-bold text-[var(--text-primary)] md:text-4xl lg:text-5xl"
          style={{ fontFamily: "var(--font-display)" }}
          initial={noMotion ? false : { opacity: 0, y: 20 }}
          animate={
            noMotion
              ? { opacity: 1 }
              : { opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }
          }
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Frequently Asked Questions
        </motion.h2>

        <motion.p
          className="mb-12 text-center text-sm text-[var(--text-muted)]"
          initial={noMotion ? false : { opacity: 0, y: 20 }}
          animate={
            noMotion
              ? { opacity: 1 }
              : { opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }
          }
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          Have more questions? Reach out to us at any time.
        </motion.p>

        <motion.div
          className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] px-6 md:px-8"
          initial={noMotion ? false : { opacity: 0, y: 20 }}
          animate={
            noMotion
              ? { opacity: 1 }
              : { opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }
          }
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              faq={faq}
              isOpen={openIndex === i}
              onToggle={() => handleToggle(i)}
              index={i}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
