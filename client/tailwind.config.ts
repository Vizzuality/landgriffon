import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx,json}'],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['Public Sans', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.625rem', // 10px
        xs: ['0.75rem', '1rem'], // 12px
        sm: ['0.875rem', '1.25rem'], // 14px
        base: ['1rem', '1.5rem'], // 16px
        lg: ['1.125rem', '1.75rem'], // 18px
        '2xl': ['1.5rem', '2rem'], // 20px
        '3xl': ['1.875rem', '2.25rem'], // 24px
        '4xl': ['2.25rem', '2.5rem'], // 28px
      },
      height: {
        'screen-minus-header': "calc(100vh - theme('spacing.16'))",
      },
      spacing: {
        125: '30.875rem',
        250: '48.75rem',
      },
      backgroundImage: {
        auth: 'linear-gradient(240.36deg, #2E34B0 0%, #0C1063 68.13%)',
      },
      boxShadow: {
        menu: '0 4px 4px 0px rgba(0, 0, 0, 0.25)',
        'button-hovered':
          '0px 0px 0px 6px rgba(0, 0, 0, 0.26), 0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
        'button-focused': '0px 0px 0px 4px rgba(63, 89, 224, 0.20), 0px 0px 0px 1px #FFF',
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        gray: {
          900: '#15181F',
          600: '#40424B',
          500: '#60626A',
          400: '#8F9195',
          300: '#AEB1B5',
          200: '#D1D5DB',
          100: '#F3F4F6',
          50: '#F9FAFB',
        },
        navy: {
          50: '#F0F2FD', // light navy
          200: '#C7CDEA', // light mid navy
          400: '#3F59E0', // navy
          600: '#2E34B0', // mid navy
          900: '#152269', // dark navy
        },
        orange: {
          500: '#FFA000', // orange
          300: '#F0B957', // light mid orange
          100: '#F9DFB1', // light orange
          50: '#FFF1D9', // lightest orange
        },
        blue: {
          400: '#4AB7F3', // blue
          200: '#C7F0FF', // soft blue
        },
        green: {
          800: '#006D2C',
          400: '#078A3C',
          200: '#CDE8D8',
          50: '#E6F9EE',
        },
        red: {
          800: '#BA1809', // dark red
          400: '#E93323', // red
          50: '#FEF2F2', // light red
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
} satisfies Config;

export default config;
