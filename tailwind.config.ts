import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0f0e0c',
        paper: '#f5f2ec',
        cream: '#ede9e0',
        accent: '#c8401a',
        'accent-light': '#f0ded8',
        muted: '#7a756c',
        border: '#ddd8ce',
        white: '#ffffff',
        // keep success for status badges
        success: '#16a34a',
        warning: '#d97706',
        danger: '#dc2626',
        // Legacy token aliases — map old purple tokens to new warm palette
        // Allows old pages to continue rendering during migration
        primary: '#0f0e0c',
        cta: '#c8401a',
        background: '#f5f2ec',
        'text-primary': '#0f0e0c',
        'text-secondary': '#7a756c',
      },
      fontFamily: {
        display: ['var(--font-instrument-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-up': 'fadeUp 0.7s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'float': 'float 5s ease-in-out infinite',
        'chip-in': 'chipIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        chipIn: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'paper-grid': 'linear-gradient(rgba(15,14,12,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,14,12,0.04) 1px, transparent 1px)',
        'hero-gradient': 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200,64,26,0.06) 0%, transparent 70%)',
        'cta-glow': 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(200,64,26,0.2) 0%, transparent 70%)',
        // Legacy aliases
        'cta-gradient': 'linear-gradient(135deg, #c8401a 0%, #b83518 100%)',
        'primary-gradient': 'linear-gradient(135deg, #0f0e0c 0%, #2a2926 100%)',
        'accent-gradient': 'linear-gradient(135deg, #c8401a 0%, #e05528 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0f0e0c 0%, #1c1b19 100%)',
        'card-gradient': 'linear-gradient(135deg, #ffffff 0%, #faf9f7 100%)',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(15,14,12,0.06), 0 1px 2px -1px rgba(15,14,12,0.04)',
        'card-hover': '0 8px 30px -8px rgba(15,14,12,0.12)',
        'elevated': '0 16px 48px -12px rgba(15,14,12,0.16)',
        'btn': '0 1px 2px 0 rgba(15,14,12,0.2)',
        'btn-accent': '0 2px 8px 0 rgba(200,64,26,0.3)',
        'nav': '0 1px 0 0 rgba(221,216,206,0.8)',
        'input-focus': '0 0 0 3px rgba(200,64,26,0.12)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
export default config
