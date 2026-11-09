import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: "#1a2035",
        navy2: "#242c45",
        orange: "#e8622a",
        orange2: "#d04e18",
        // Naranja para texto sobre fondos claros y fondo de botones con texto
        // blanco (contraste AA >= 4.5:1); orange-ink2 es su hover
        "orange-ink": "#b4441a",
        "orange-ink2": "#9c3a16",
        // Tema tech: azul noche profundo para fondos oscuros y cian para detalles
        night: "#0b1220",
        night2: "#131c2e",
        tech: "#22d3ee",
        cream: "#fdf6ee",
        cream2: "#f5ead8",
        mint: "#e8f5f0",
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'tech-grid':
          'linear-gradient(rgba(34,211,238,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.07) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '28px 28px',
      },
      boxShadow: {
        glow: '0 10px 30px -12px rgba(34,211,238,0.45), 0 0 0 1px rgba(34,211,238,0.25)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        blink: {
          '50%': { opacity: '0' },
        },
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
        'fade-up': 'fadeUp 0.6s ease forwards',
        float: 'float 3s ease-in-out infinite',
        blink: 'blink 1s steps(1) infinite',
      },
    },
  },
  plugins: [],
};
export default config;
