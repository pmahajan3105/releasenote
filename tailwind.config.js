/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './ui/**/*.{js,ts,jsx,tsx,mdx}', // Added for Subframe components
  ],
  theme: {
    extend: {
      colors: {
        // Existing colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        
        // Subframe-specific colors
        'default-background': '#ffffff',
        'default-font': '#111827', 
        'subtext-color': '#6b7280',
        'neutral-border': '#e5e7eb',
        'neutral-100': '#f5f5f5',
        'neutral-200': '#e5e5e5',
        'neutral-400': '#a3a3a3',
        'neutral-50': '#fafafa',
        'brand-50': '#eff6ff',
        'brand-600': '#2563eb',
        'brand-700': '#1d4ed8',
        
        // Keep existing shadcn colors
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        popover: 'hsl(var(--popover))',
        'popover-foreground': 'hsl(var(--popover-foreground))',
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        secondary: 'hsl(var(--secondary))',
        'secondary-foreground': 'hsl(var(--secondary-foreground))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        accent: 'hsl(var(--accent))',
        'accent-foreground': 'hsl(var(--accent-foreground))',
        destructive: 'hsl(var(--destructive))',
        'destructive-foreground': 'hsl(var(--destructive-foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontSize: {
        'heading-1': ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'heading-2': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        'heading-3': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'body-bold': ['1rem', { lineHeight: '1.5rem', fontWeight: '600' }],
      },
      fontFamily: {
        'heading-1': ['Inter', 'sans-serif'],
        'heading-2': ['Inter', 'sans-serif'],
        'heading-3': ['Inter', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'body-bold': ['Inter', 'sans-serif'],
      },
      spacing: {
        '144': '36rem', // For h-144 class from landing page
      },
      screens: {
        'mobile': {'max': '767px'}, // For mobile: breakpoint
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
  plugins: [require('tailwindcss-animate')],
}