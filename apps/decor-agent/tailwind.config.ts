import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        sora: {
          bg: '#D6CFC7',
          'text-primary': '#4A4641',
          'text-secondary': '#757068',
          mint: '#C4E6D4',
          lavender: '#D8CDF0',
          rose: '#F0CDC6',
          blue: '#C6DDF0',
          green: '#3a6b4a',
          'green-light': '#4e8f64',
        },
        glass: {
          surface: 'rgba(255, 255, 255, 0.25)',
          border: 'rgba(255, 255, 255, 0.4)',
          highlight: 'rgba(255, 255, 255, 0.6)',
        },
      },
      fontFamily: {
        'dm-sans': ['var(--font-dm-sans)', 'sans-serif'],
        'playfair': ['var(--font-playfair)', 'serif'],
      },
      borderRadius: {
        'card': '24px',
      },
      animation: {
        'sora-float': 'sora-float 20s ease-in-out infinite',
        'sora-fade-in-down': 'sora-fade-in-down 0.6s var(--ease-out-expo) forwards',
        'sora-slide-up': 'sora-slide-up 0.6s var(--ease-out-expo) forwards',
        'sora-showcase-entrance': 'sora-showcase-entrance 0.8s var(--ease-out-expo) forwards',
        'sora-liquid-sweep': 'sora-liquid-sweep 2.5s ease-in-out infinite',
        'sora-cta-pulse': 'sora-cta-pulse 2.5s ease-in-out infinite',
        'sora-pulse-ring': 'sora-pulse-ring 2s ease-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
