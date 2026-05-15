import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "2rem", lg: "4rem", xl: "5rem", "2xl": "6rem" },
      screens: { "2xl": "1440px" },
    },
    extend: {
      colors: {
        // Brand — Nepal green
        brand: {
          50: "#f0f9f0",
          100: "#dcf0dc",
          200: "#bce0bc",
          300: "#8dc98d",
          400: "#52b788",
          500: "#2d6a4f",
          600: "#1b4332",
          700: "#163729",
          800: "#122d22",
          900: "#0f261e",
          950: "#081c15",
        },
        // Gold — Himalayan warmth
        gold: {
          50: "#fff8f0",
          100: "#ffecd9",
          200: "#ffd4a8",
          300: "#ffb571",
          400: "#f4a261",
          500: "#e76f51",
          600: "#c44b2b",
          700: "#a03820",
          800: "#822e1c",
          900: "#6b271b",
        },
        // Sky — altitude blue
        sky: {
          50: "#f0fbff",
          100: "#e0f5fe",
          200: "#b9ecfd",
          300: "#90e0ef",
          400: "#48cae4",
          500: "#00b4d8",
          600: "#0096c7",
          700: "#0077b6",
          800: "#005f8a",
          900: "#014f6e",
        },
        // Base
        base: {
          50: "#f4f4f2",
          100: "#e8e8e4",
          200: "#d1d1c9",
          300: "#b0b0a4",
          400: "#8a8a7c",
          500: "#6e6e60",
          600: "#575750",
          700: "#484843",
          800: "#3c3c38",
          900: "#1a1c19",
          950: "#0a0f0a",
        },
        // Glass system
        glass: {
          white: "rgba(255,255,255,0.08)",
          "white-border": "rgba(255,255,255,0.12)",
          dark: "rgba(10,15,10,0.85)",
        },
      },

      fontFamily: {
        display: ["var(--font-cormorant)", "Palatino Linotype", "serif"],
        body: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-dm-mono)", "Courier New", "monospace"],
        nepali: ["var(--font-mukta)", "sans-serif"],
      },

      fontSize: {
        "display-2xl": ["clamp(72px,10vw,120px)", { lineHeight: "0.9", letterSpacing: "-0.03em" }],
        "display-xl": ["clamp(52px,7vw,88px)", { lineHeight: "0.92", letterSpacing: "-0.025em" }],
        "display-lg": ["clamp(40px,5.5vw,68px)", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(32px,4vw,52px)", { lineHeight: "1.0", letterSpacing: "-0.015em" }],
        "display-sm": ["clamp(24px,3vw,36px)", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
      },

      backgroundImage: {
        "hero-gradient": "linear-gradient(to bottom, rgba(10,15,10,0.2) 0%, rgba(10,15,10,0.1) 40%, rgba(10,15,10,0.75) 80%, rgba(10,15,10,1) 100%)",
        "card-gradient": "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
        "brand-gradient": "linear-gradient(135deg, #2d6a4f, #52b788)",
        "gold-gradient": "linear-gradient(135deg, #e76f51, #f4a261)",
        "aurora": "radial-gradient(ellipse at 50% 50%, rgba(45,106,79,0.15), transparent 70%)",
      },

      boxShadow: {
        "glass": "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
        "card": "0 8px 32px rgba(0,0,0,0.2)",
        "card-hover": "0 24px 56px rgba(0,0,0,0.35)",
        "brand": "0 8px 32px rgba(45,106,79,0.35)",
        "brand-lg": "0 16px 48px rgba(45,106,79,0.45)",
        "gold": "0 8px 32px rgba(231,111,81,0.3)",
      },

      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-in-right": "slideInRight 0.5s cubic-bezier(0.22,1,0.36,1) forwards",
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4,0,0.6,1) infinite",
        "shimmer": "shimmer 2s linear infinite",
        "spin-slow": "spin 8s linear infinite",
      },

      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(32px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },

      transitionTimingFunction: {
        "spring": "cubic-bezier(0.22, 1, 0.36, 1)",
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      backdropBlur: {
        xs: "4px",
      },

      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "88": "22rem",
        "104": "26rem",
        "120": "30rem",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
};

export default config;
