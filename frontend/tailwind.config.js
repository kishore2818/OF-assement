/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '420px',
      },
      fontFamily: {
        sans: ['Geist', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
      },
      colors: {
        // ── OpenFabric Official Brand Palette ──
        brand: {
          50:  '#E6FAF5',
          100: '#B3F0E1',
          200: '#80E6CD',
          300: '#4DDBB9',
          400: '#1EC8A5',  // ★ Primary OpenFabric Teal
          500: '#19B494',
          600: '#149F83',
          700: '#0F8B72',
          800: '#0A7661',
          900: '#056250',
          DEFAULT: '#1EC8A5',
        },
        // Deep navy used in OpenFabric's dark backgrounds
        navy: {
          50:  '#E8EAF2',
          100: '#C5C9DE',
          200: '#9EA5C7',
          300: '#7781B0',
          400: '#57629F',
          500: '#3A468F',
          600: '#2B3572',
          700: '#1F2859',
          800: '#0F1B4C',  // ★ OpenFabric Deep Navy
          900: '#0A1236',
          950: '#060C22',  // Deep sidebar
          DEFAULT: '#0F1B4C',
        },
        // Accent blues
        accent: {
          blue:    '#27A8E0',
          blueLight: '#E8F6FC',
          coral:   '#E8654A',
          coralLight: '#FEF1EE',
          gold:    '#E3A94B',
          goldLight: '#FFF8EB',
        },
        surface: {
          canvas: '#F7F9FC',
          card: '#FFFFFF',
          muted: '#EFF2F7',
        },
        fintech: {
          settled: '#1EC8A5',       // OpenFabric teal for settled
          settledBg: '#E6FAF5',
          settledBorder: '#B3F0E1',
          warning: '#E3A94B',       // OpenFabric gold for warnings
          warningBg: '#FFF8EB',
          warningBorder: '#F5E2A8',
          critical: '#E8654A',      // OpenFabric coral for critical
          criticalBg: '#FEF1EE',
          criticalBorder: '#F9C4B7',
          refunded: '#27A8E0',      // OpenFabric blue for refunded
          refundedBg: '#E8F6FC',
          refundedBorder: '#AED9F0',
          pending: '#5B6487',       // Muted navy gray
          pendingBg: '#EFF2F7',
          pendingBorder: '#D1D8E6',
        },
      },
      boxShadow: {
        'brand-glow': '0 0 24px -4px rgba(30, 200, 165, 0.35)',
        'brand-sm': '0 2px 8px -2px rgba(30, 200, 165, 0.2)',
        'navy-lg': '0 10px 40px -12px rgba(15, 27, 76, 0.25)',
        'card': '0 1px 3px 0 rgba(15, 27, 76, 0.04), 0 1px 2px -1px rgba(15, 27, 76, 0.03)',
        'card-hover': '0 10px 24px -6px rgba(15, 27, 76, 0.1), 0 4px 8px -4px rgba(15, 27, 76, 0.06)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 8px rgba(30, 200, 165, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(30, 200, 165, 0.5)' },
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #1EC8A5, #27A8E0)',
        'brand-gradient-warm': 'linear-gradient(135deg, #1EC8A5, #E3A94B)',
        'navy-gradient': 'linear-gradient(180deg, #0F1B4C, #060C22)',
        'sidebar-gradient': 'linear-gradient(180deg, #0F1B4C 0%, #091336 50%, #060C22 100%)',
      },
    },
  },
  plugins: [],
}
