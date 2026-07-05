# Splash Screen — Corlify

> **File:** `src/screens/auth/SplashScreen.tsx`  
> **Base background:** `assets/splash-bg.jpg` (native Expo splash)  
> **Slideshow images:** `assets/splash/splash-1.jpg`, `splash-2.jpg`

---

## Overview

The splash screen is a cinematic, dark-themed entry point that combines:
- A crossfading background image slideshow
- Layered gradient overlays for depth
- Halation glow for film-like warmth
- Subtle film grain texture
- Animated logo, tagline, and dual CTA buttons

---

## Image System

### Native Expo Splash (app.json)
```
splash.image → assets/splash-bg.jpg
splash.resizeMode → cover
splash.backgroundColor → #000000
```
This shows while the JS bundle loads, then hides automatically.

### In-App Slideshow
| Image | File | Description |
|---|---|---|
| `splash-1.jpg` | `assets/splash/` | Blue restaurant dining vibe |
| `splash-2.jpg` | `assets/splash/` | Concert festival with drones |

- **Display duration:** 7 seconds per image
- **Transition:** 1.2 second smooth crossfade
- **Loop:** Infinite cycle between images
- **Blur radius:** 3 (softens backgrounds for text legibility)

### Adding New Images
1. Drop image into `assets/splash/` as `splash-3.jpg`, `splash-4.jpg`, etc.
2. Add to the `IMAGES` array in `SplashScreen.tsx`:
```ts
const IMAGES: ImageSourcePropType[] = [
  require('../../../assets/splash/splash-1.jpg'),
  require('../../../assets/splash/splash-2.jpg'),
  require('../../../assets/splash/splash-3.jpg'),
  require('../../../assets/splash/splash-4.jpg'),
];
```
3. The crossfade logic cycles automatically through all images.

---

## Layer Stack (Bottom → Top)

| Layer | Purpose | Style |
|---|---|---|
| `Animated.Image` ×2 | Background slideshow | `resizeMode="cover"`, `blurRadius={3}` |
| `baseBg` | Dark fallback behind images | `backgroundColor: #0A0C12` |
| `dimOverlay` | Reduces image brightness | `rgba(0,0,0,0.25)` |
| `bgGradient` | Vignette + depth | 6-stop gradient (see below) |
| `halation` | Warm glow around lights | Orange gradient, peak `0.06` opacity |
| `GrainOverlay` | Film texture | 300 white dots, `0.01–0.07` opacity |
| Content | Logo + tagline + buttons | Foreground layer |

---

## Gradient Overlay

### Main Vignette
```
Position 0.00  → rgba(5,4,8,0.92)     // dark top
Position 0.10  → rgba(10,12,25,0.45)
Position 0.25  → rgba(8,10,20,0.15)    // transparent mid
Position 0.50  → rgba(15,10,8,0.20)
Position 0.72  → rgba(8,5,5,0.70)
Position 0.90  → rgba(2,2,4,0.96)      // dark bottom
```

### Halation Glow
```
Position 0.00  → rgba(255,140,60,0)
Position 0.20  → rgba(255,120,40,0)
Position 0.35  → rgba(255,100,30,0.04)
Position 0.50  → rgba(255,90,25,0.06)  // peak glow
Position 0.65  → rgba(255,80,20,0.03)
Position 0.85  → rgba(255,60,10,0)
```

---

## Film Grain

- **Count:** 300 dots
- **Size range:** 0.5px – 2px
- **Opacity range:** 0.01 – 0.07
- **Color:** `#FFFFFF`
- **Distribution:** Random across full screen
- **Effect:** Very subtle, cinematic texture

---

## Animation Timeline

| Time | Element | Animation |
|---|---|---|
| 0ms | Logo | Opacity 0→1 (900ms), Scale 0.75→1 (spring, friction 7) |
| 900ms | Tagline | Opacity 0→1 (700ms) |
| 1400ms | Buttons | Opacity 0→1 (600ms) |
| 7000ms | Background | Crossfade to next image (1200ms) |
| 14000ms | Background | Crossfade back (1200ms), repeats |

---

## Logo & Branding

### Logo Container
| Property | Value |
|---|---|
| Size | 84 × 84 |
| Border radius | 20 |
| Background | `rgba(255,80,40,0.12)` |
| Border | 1.5px `rgba(255,107,74,0.35)` |

### Logo Letter "C"
| Property | Value |
|---|---|
| Font size | 50px |
| Font weight | 800 |
| Color | `#FF6B4A` (accent.cyan) |
| Line height | 56 |

### App Name "Corlify"
| Property | Value |
|---|---|
| Font size | 38px |
| Font weight | 600 |
| Color | `#FFFFFF` |
| Letter spacing | 0.5 |
| Font family | `Poppins_500Medium` |

---

## Tagline

```
Discover events.
Book experiences.
Make memories.
```

| Property | Value |
|---|---|
| Font size | 17px |
| Font weight | 400 |
| Color | `rgba(255,255,255,0.55)` |
| Letter spacing | 0.2 |
| Line gap | 5px between lines |
| Alignment | Center |

---

## Buttons

### Layout
| Property | Value |
|---|---|
| Container width | 100% |
| Horizontal padding | 32px |
| Bottom padding | 50px |
| Button gap | 12px |
| Button height | 54px |
| Button width | 100% (full-width) |
| Border radius | 27 (pill shape) |

### Login Button
| Property | Value |
|---|---|
| Background | `#C43A11` (dark orange) |
| Text color | `#FFFFFF` |
| Font size | 16px |
| Font weight | 600 |
| Letter spacing | 0.3 |
| Font family | `Poppins_500Medium` |
| activeOpacity | 0.88 |
| Navigates to | `Auth` screen |

### Sign Up Button
| Property | Value |
|---|---|
| Background | `#FFFFFF` (white) |
| Text color | `#000000` (black) |
| Font size | 16px |
| Font weight | 600 |
| Letter spacing | 0.3 |
| Font family | `Poppins_500Medium` |
| activeOpacity | 0.88 |
| Navigates to | `Signup` screen |

---

## Navigation Flow

```
SplashScreen
  ├─ Login  → navigation.replace('Auth')   → AuthScreen (login)
  └─ Sign Up → navigation.replace('Signup') → SignupScreen (register)
```

Uses `replace` (not `navigate`) so the splash screen is removed from the back stack.

---

## File References

| File | Purpose |
|---|---|
| `src/screens/auth/SplashScreen.tsx` | Main splash screen component |
| `assets/splash-bg.jpg` | Native Expo splash image |
| `assets/splash/splash-1.jpg` | Slideshow image 1 |
| `assets/splash/splash-2.jpg` | Slideshow image 2 |
| `assets/splash-icon.png` | Logo icon (used by Expo adaptive icon) |
| `app.json` | Native splash config |
| `src/theme/colors.ts` | Color tokens |
| `src/theme/fonts.ts` | Font definitions |

---

*Last updated: July 2026 — Corlify Event App*
