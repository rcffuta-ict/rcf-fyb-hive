import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      opacity: {
        12: "0.12", // 12% opacity
      },
      backgroundImage: {
        // Original gradients
        "elipse-1": "linear-gradient(162.94deg, rgba(196,196,196,0.12) 11.4%, rgba(255,255,255,0) 81.73%)",
        "elipse-2": "linear-gradient(162.94deg, rgba(196,196,196,0.28) 11.4%, rgba(255,255,255,0) 81.73%)",
        
        // Romantic dinner vibes
        "champagne-gold": "linear-gradient(135deg, #F7E7CE, #E8B86D, #B8860B, #8B7355)",
        "rose-gold": "linear-gradient(135deg, #FFE5E5, #FFCCCB, #FFB6C1, #FF69B4)",
        "midnight-romance": "linear-gradient(135deg, #1a0033, #2d1b4e, #4a1958, #6b2d5c)",
        "candlelight": "linear-gradient(135deg, #FFF8DC, #FFEAA7, #FDCB6E, #E17055)",
        "wine-velvet": "linear-gradient(135deg, #722F37, #8B0000, #A0522D, #CD853F)",
        
        // Award & luxury themes
        "golden-trophy": "linear-gradient(135deg, #FFD700, #FFA500, #DAA520, #B8860B)",
        "platinum-elegance": "linear-gradient(135deg, #E5E4E2, #C0C0C0, #A8A8A8, #696969)",
        "diamond-sparkle": "linear-gradient(135deg, #F0F8FF, #E6E6FA, #D3D3D3, #B0C4DE)",
        
        // Atmospheric backgrounds
        "starry-night": "radial-gradient(ellipse at top, #1e3a8a, #312e81, #1e1b4b, #0f172a)",
        "sunset-dinner": "linear-gradient(to bottom, #FF6B6B, #FFE66D, #FF8E53, #6C5CE7)",
        "intimate-glow": "radial-gradient(circle at center, rgba(255, 215, 0, 0.15), rgba(109, 40, 217, 0.1), transparent)",
        
        // Glass morphism effects
        "glass-warm": "linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.05))",
        "glass-gold": "linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.05))",
        "glass-rose": "linear-gradient(135deg, rgba(255, 105, 180, 0.2), rgba(255, 105, 180, 0.05))",
        
        // Interactive hover effects
        "shimmer-gold": "linear-gradient(110deg, transparent 25%, rgba(255, 215, 0, 0.8) 50%, transparent 75%)",
        "shimmer-rose": "linear-gradient(110deg, transparent 25%, rgba(255, 105, 180, 0.8) 50%, transparent 75%)",
        "heart-pulse": "radial-gradient(circle, rgba(255, 20, 147, 0.6), rgba(255, 20, 147, 0.1), transparent)",
      },
      
      colors: {
        // Primary romantic palette
        "champagne-gold": {
          DEFAULT: "rgb(250 214 165)", // fallback without opacity
          30: "rgb(250 214 165 / 0.3)", // manual opacity variant
          50: "rgb(250 214 165 / 0.5)",
          70: "rgb(250 214 165 / 0.7)",
          // 50: "#FFFBF0",
          100: "#FFF8DC", 
          200: "#F7E7CE",
          300: "#E8B86D",
          400: "#DAA520",
          500: "#B8860B", 
          600: "#8B7355",
          700: "#6B5B47",
          800: "#4A3F35",
          900: "#2F2B28",
        },
        "rose-gold": {
          50: "#FFF5F5",
          100: "#FFE5E5", 
          200: "#FFCCCB",
          300: "#FFB6C1", 
          400: "#FF69B4",
          500: "#FF1493", 
          600: "#DC143C",
          700: "#B22222",
          800: "#8B0000",
          900: "#660000",
          DEFAULT: "#FF69B4",
        },
        romance: {
          50: "#FFF5F5",
          100: "#FED7D7",
          200: "#FEB2B2",
          300: "#FC8181",
          400: "#F56565",
          500: "#E53E3E",
          600: "#C53030",
          700: "#9B2C2C",
          800: "#742A2A",
          900: "#4A1B1B",
        },
        
        // Gold/champagne palette
        golden: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        
        // Deep luxury purples
        luxury: {
          50: "#FAF5FF",
          100: "#E9D5FF",
          200: "#D8B4FE",
          300: "#C084FC",
          400: "#A855F7",
          500: "#9333EA",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
        },
        
        // Elegant neutrals
        pearl: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#EEEEEE",
          300: "#E0E0E0",
          400: "#BDBDBD",
          500: "#9E9E9E",
          600: "#757575",
          700: "#616161",
          800: "#424242",
          900: "#212121",
        },
        
        // Award colors
        award: {
          gold: "#FFD700",
          silver: "#C0C0C0",
          bronze: "#CD7F32",
          platinum: "#E5E4E2",
          diamond: "#B9F2FF",
        },
        
        // Semantic colors with romantic touch
        success: {
          DEFAULT: "#10B981",
          light: "#D1FAE5",
          dark: "#047857",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FEF3C7",
          dark: "#D97706",
        },
        error: {
          DEFAULT: "#EF4444",
          light: "#FEE2E2",
          dark: "#DC2626",
        },
        info: {
          DEFAULT: "#3B82F6",
          light: "#DBEAFE",
          dark: "#1D4ED8",
        },
      },
      
      fontFamily: {
        // Elegant font stack
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["'Playfair Display'", "Georgia", "serif"],
        script: ["'Great Vibes'", "'Dancing Script'", "cursive"],
        elegant: ["'Cormorant Garamond'", "serif"],
        modern: ["'Poppins'", "sans-serif"],
        luxury: ["'Cinzel'", "serif"],
      },
      
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
        'display': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      
      boxShadow: {
        // Soft shadows
        'soft': '0 2px 6px rgba(0, 0, 0, 0.08)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'elevated': '0 8px 24px rgba(0, 0, 0, 0.15)',
        
        // Romantic glows
        'golden-glow': '0 0 20px rgba(255, 215, 0, 0.6)',
        'rose-glow': '0 0 25px rgba(255, 105, 180, 0.5)',
        'romantic-glow': '0 0 30px rgba(255, 20, 147, 0.4)',
        'candlelight-glow': '0 0 40px rgba(255, 140, 0, 0.3)',
        
        // Award shadows
        'trophy-glow': '0 0 35px rgba(255, 215, 0, 0.8)',
        'award-shadow': '0 8px 32px rgba(255, 215, 0, 0.3)',
        
        // Interactive shadows
        'hover-lift': '0 12px 28px rgba(0, 0, 0, 0.2)',
        'pressed': '0 2px 8px rgba(0, 0, 0, 0.2)',
        
        // Glass morphism
        'glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
        'glass-strong': '0 8px 32px rgba(31, 38, 135, 0.6)',
        
        // Inner shadows for depth
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'inner-strong': 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.12)',
      },
      
      borderRadius: {
        'xs': '0.125rem',
        'sm': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
        'full': '9999px',
        'romantic': '1.25rem',
        'elegant': '0.875rem',
      },
      
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      
      animation: {
        // Entry animations
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'fade-in-slow': 'fadeIn 1.2s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-up-slow': 'slideUp 1s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'slide-left': 'slideLeft 0.6s ease-out',
        'slide-right': 'slideRight 0.6s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'scale-in-slow': 'scaleIn 0.8s ease-out',
        
        // Romantic animations
        'pulse-romantic': 'pulseRomantic 2s ease-in-out infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'sparkle': 'sparkle 3s infinite linear',
        'twinkle': 'twinkle 2s infinite ease-in-out',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        
        // Floating and movement
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'sway': 'sway 3s ease-in-out infinite',
        'drift': 'drift 8s ease-in-out infinite',
        
        // Interactive animations
        'bounce-gentle': 'bounceGentle 0.6s ease-out',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'shake': 'shake 0.82s cubic-bezier(.36,.07,.19,.97) both',
        
        // Award animations
        'trophy-shine': 'trophyShine 2s ease-in-out infinite',
        'award-glow': 'awardGlow 3s ease-in-out infinite',
        'confetti': 'confetti 3s ease-out infinite',
        
        // Background animations
        'gradient-shift': 'gradientShift 8s ease-in-out infinite',
        'aurora': 'aurora 15s ease-in-out infinite',
        'candleflicker': 'candleFlicker 4s ease-in-out infinite',
      },
      
      keyframes: {
        // Basic animations
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        
        // Romantic animations
        pulseRomantic: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
        },
        heartbeat: {
          '0%, 50%, 100%': { transform: 'scale(1)' },
          '5%, 15%': { transform: 'scale(1.1)' },
          '10%': { transform: 'scale(1.15)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1.2) rotate(180deg)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1', transform: 'scale(1.2) rotate(180deg)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 215, 0, 0.8)' },
        },
        
        // Movement animations
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%': { transform: 'rotate(1deg)' },
        },
        drift: {
          '0%, 100%': { transform: 'translateX(0px) translateY(0px)' },
          '25%': { transform: 'translateX(5px) translateY(-5px)' },
          '50%': { transform: 'translateX(-3px) translateY(-8px)' },
          '75%': { transform: 'translateX(-7px) translateY(-3px)' },
        },
        
        // Interactive animations
        bounceGentle: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
          '40%, 43%': { transform: 'translate3d(0, -15px, 0)' },
          '70%': { transform: 'translate3d(0, -8px, 0)' },
          '90%': { transform: 'translate3d(0, -3px, 0)' },
        },
        wiggle: {
          '0%, 7%': { transform: 'rotateZ(0)' },
          '15%': { transform: 'rotateZ(-15deg)' },
          '20%': { transform: 'rotateZ(10deg)' },
          '25%': { transform: 'rotateZ(-10deg)' },
          '30%': { transform: 'rotateZ(6deg)' },
          '35%': { transform: 'rotateZ(-4deg)' },
          '40%, 100%': { transform: 'rotateZ(0)' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        
        // Award animations
        trophyShine: {
          '0%': { background: 'linear-gradient(135deg, #FFD700, #FFA500)' },
          '50%': { background: 'linear-gradient(135deg, #FFEF94, #FFD700)' },
          '100%': { background: 'linear-gradient(135deg, #FFD700, #FFA500)' },
        },
        awardGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
            transform: 'scale(1)',
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(255, 215, 0, 0.9)',
            transform: 'scale(1.02)',
          },
        },
        confetti: {
          '0%': { transform: 'translateY(-100vh) rotate(0deg)' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)' },
        },
        
        // Background animations
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        aurora: {
          '0%, 100%': { 
            background: 'linear-gradient(135deg, #1e3a8a, #312e81, #1e1b4b)',
            transform: 'translateX(0%)',
          },
          '33%': { 
            background: 'linear-gradient(135deg, #312e81, #1e1b4b, #6D28D9)',
            transform: 'translateX(-2%)',
          },
          '66%': { 
            background: 'linear-gradient(135deg, #1e1b4b, #6D28D9, #1e3a8a)',
            transform: 'translateX(2%)',
          },
        },
        candleFlicker: {
          '0%, 100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
          '25%': { opacity: '0.8', transform: 'scale(0.98) translateY(-1px)' },
          '50%': { opacity: '0.9', transform: 'scale(1.02) translateY(1px)' },
          '75%': { opacity: '0.85', transform: 'scale(0.99) translateY(-0.5px)' },
        },
      },
      
      // Custom utilities
      transitionTimingFunction: {
        'romantic': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      
      transitionDuration: {
        '350': '350ms',
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1200': '1200ms',
      },
    },
  },
  
  darkMode: "class",
  
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
    require("tailwind-scrollbar")({ nocompatible: true }),
    
    // Custom plugin for romantic utilities
    function({ addUtilities, theme }: any) {
      addUtilities({
        '.text-shimmer': {
          background: 'linear-gradient(110deg, transparent 25%, rgba(255, 215, 0, 0.8) 50%, transparent 75%)',
          backgroundSize: '200% 100%',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'shimmer 2s infinite linear',
        },
        '.glass-effect': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.romantic-gradient': {
          background: 'linear-gradient(135deg, #FFE5E5, #FFCCCB, #FFB6C1, #FF69B4)',
        },
        '.golden-text': {
          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        },
      });
    },
  ],
};

export default config;