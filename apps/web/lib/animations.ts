// lib/animations.ts
// Centralized Framer Motion animation variants

import type { Variants, Transition } from "framer-motion";

// ─── Transitions ──────────────────────────────────────

export const springTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export const cinematicTransition: Transition = {
  duration: 0.8,
  ease: [0.22, 1, 0.36, 1],
};

export const fastTransition: Transition = {
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1],
};

// ─── Fade Variants ────────────────────────────────────

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

export const fadeDownVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Stagger Container ────────────────────────────────

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

// ─── Card Variants ────────────────────────────────────

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.08,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
  hover: {
    y: -6,
    scale: 1.02,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export const cardImageVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.07, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Hero Variants ────────────────────────────────────

export const heroContentVariants: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

export const heroImageVariants: Variants = {
  hidden: { scale: 1.15 },
  visible: {
    scale: 1.05,
    transition: { duration: 1.8, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Page Transitions ─────────────────────────────────

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -16,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

// ─── Nav Variants ─────────────────────────────────────

export const navVariants: Variants = {
  top: { background: "rgba(10,15,10,0)", backdropFilter: "blur(0px)" },
  scrolled: {
    background: "rgba(10,15,10,0.92)",
    backdropFilter: "blur(24px)",
    transition: { duration: 0.4 },
  },
};

export const mobileMenuVariants: Variants = {
  closed: { opacity: 0, x: "100%", transition: fastTransition },
  open: { opacity: 1, x: 0, transition: cinematicTransition },
};

// ─── Slide Variants ───────────────────────────────────

export const slideInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Scale Variants ───────────────────────────────────

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Drawer / Modal ───────────────────────────────────

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

export const drawerVariants: Variants = {
  hidden: { opacity: 0, y: "100%" },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: "100%",
    transition: { duration: 0.35, ease: "easeIn" },
  },
};
