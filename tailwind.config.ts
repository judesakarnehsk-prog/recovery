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
        primary: '#6D28D9',
        accent: '#A78BFA',
        cta: '#6D28D9',
        success: '#10B981',
        background: '#FFFFFF',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        border: '#E5E7EB',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-down': 'slideDown 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'counter': 'counter 2s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(to bottom right, #6D28D910, transparent)',
        'card-gradient': 'linear-gradient(135deg, #ffffff 0%, #FAFAFB 100%)',
        'cta-gradient': 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)',
        'primary-gradient': 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 50%, #A78BFA 100%)',
        'accent-gradient': 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        'mesh-gradient': 'radial-gradient(at 40% 20%, #6D28D915 0px, transparent 50%), radial-gradient(at 80% 0%, #A78BFA15 0px, transparent 50%), radial-gradient(at 0% 50%, #6D28D910 0px, transparent 50%)',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 10px 40px -10px rgba(109, 40, 217, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'elevated': '0 20px 60px -15px rgba(109, 40, 217, 0.2)',
        'cta': '0 4px 14px 0 rgba(109, 40, 217, 0.39)',
        'cta-hover': '0 6px 20px rgba(109, 40, 217, 0.5)',
        'input-focus': '0 0 0 3px rgba(167, 139, 250, 0.15)',
        'nav': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
export default config
