# Evora Design System — Mood Board & UI Rules

> **Signature Style:** Dark glassmorphic aesthetic with orange accent (#E43414).  
> **Theme:** Always dark. Never switch to light mode.

---

## Color Palette

### Backgrounds
| Token | Hex | Usage |
|---|---|---|
| `bg-primary` | `#0A0C12` | Screen background, safe area |
| `bg-secondary` | `#12161D` | Cards, elevated surfaces |
| `bg-card` | `#161B24` | Container backgrounds |
| `bg-elevated` | `#1C2130` | Modals, overlays |

### Accent Colors
| Token | Hex | Usage |
|---|---|---|
| `accent-orange` | `#E43414` | Primary CTA, selected states, icons, buttons |
| `accent-orange-light` | `#FF6B4A` | Hover, secondary orange, subtle highlights |
| `accent-green` | `#2ED573` | Online status, success states |
| `accent-red` | `#EF4444` | Remove, destructive actions |
| `accent-purple` | `#A855F7` | Reserved for future use |
| `accent-pink` | `#EC4899` | Reserved for future use |

### Text Colors
| Token | Opacity | Usage |
|---|---|---|
| `text-primary` | `#FFFFFF` | Headings, primary content |
| `text-secondary` | `rgba(255,255,255,0.65)` | Body text, descriptions |
| `text-muted` | `rgba(255,255,255,0.45)` | Captions, handles, timestamps |
| `text-faint` | `rgba(255,255,255,0.3)` | Placeholders, empty states |

### Glass / Frosted Surfaces
| Token | Opacity | Usage |
|---|---|---|
| `glass-light` | `rgba(255,255,255,0.04)` | Subtle background tint |
| `glass-medium` | `rgba(255,255,255,0.07)` | Card backgrounds, list items |
| `glass-heavy` | `rgba(255,255,255,0.11)` | Elevated cards, active states |

### Borders
| Token | Opacity | Usage |
|---|---|---|
| `border-light` | `rgba(255,255,255,0.07)` | Subtle separators |
| `border-medium` | `rgba(255,255,255,0.12)` | Card borders, input borders |
| `border-focus` | `rgba(255,107,74,0.5)` | Active input, focused states |

### Status Colors
| Token | Color | Usage |
|---|---|---|
| `status-confirmed` | `#FF6B4A` | Confirmed bookings |
| `status-interested` | `#E43414` | Interested / RSVP |
| `status-past` | `rgba(255,255,255,0.4)` | Past events |
| `status-online` | `#22C55E` | Online indicator dot |

---

## Gradients

```ts
gradient.primary   = ['#FF6B4A', '#E43414']  // Buttons, CTAs
gradient.dark      = ['#12161D', '#0A0C12']  // Screen backgrounds
gradient.card      = ['rgba(22,27,36,0.95)', 'rgba(22,27,36,0.7)']  // Card overlays
```

> **Rule:** Never use yellow (#FFF44F). Always orange (#E43414).

---

## Typography

### Font Family
| Token | Font | Weight |
|---|---|---|
| `fonts.heading` | Poppins | 500 Medium |
| `fonts.subheading` | Poppins | 500 Medium |
| `fonts.body` | Poppins | 400 Regular |
| `fonts.bodyBold` | Poppins | 500 Medium |
| `fonts.button` | Poppins | 500 Medium |

### Type Scale
| Style | Size | Line Height | Color | Usage |
|---|---|---|---|---|
| `title` | 32px | 40px | #FFFFFF | Hero headings |
| `heading` | 24px | 32px | #FFFFFF | Section titles |
| `subheading` | 20px | 28px | #FFFFFF | Card titles, headers |
| `body` | 16px | 24px | rgba(255,255,255,0.7) | Paragraphs, descriptions |
| `bodyBold` | 16px | 24px | rgba(255,255,255,0.7) | Emphasized body |
| `caption` | 13px | 18px | rgba(255,255,255,0.5) | Labels, metadata |
| `label` | 14px | 20px | rgba(255,255,255,0.7) | Form labels |
| `chip` | 14px | — | rgba(255,255,255,0.6) | Category chips (inactive) |
| `chipActive` | 14px | — | #FFFFFF | Category chips (active) |
| `handle` | 14px | — | rgba(255,255,255,0.45) | @handles, usernames |
| `meta` | 12px | — | rgba(255,255,255,0.5) | Timestamps, small labels |
| `small` | 11px | — | rgba(255,255,255,0.4) | Fine print |

---

## Spacing Scale

| Token | Value | Usage |
|---|---|---|
| `xs` | 4px | Tight gaps, icon padding |
| `sm` | 8px | Compact element spacing |
| `md` | 12px | Default element spacing |
| `lg` | 16px | Section internal padding |
| `xl` | 20px | Screen horizontal padding |
| `xxl` | 24px | Section spacing |
| `xxxl` | 32px | Large vertical gaps |
| `huge` | 40px | Major section breaks |
| `massive` | 48px | Hero spacing |
| `giant` | 64px | Screen-top hero padding |

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `sm` | 8px | Small buttons, chips |
| `md` | 12px | Back buttons, icons |
| `lg` | 16px | Cards, input fields |
| `xl` | 20px | Large cards, modals |
| `xxl` | 24px | Full-width cards |
| `full` | 9999px | Avatars, pills, circular |

---

## Component Rules

### Buttons
- **Primary CTA:** Solid `#E43414` background, white text, `borderRadius: 14`, height `52px`
- **Secondary:** `rgba(255,255,255,0.06)` background, white text, border `rgba(255,255,255,0.12)`
- **Destructive (Remove):** `rgba(239,68,68,0.12)` bg, `#EF4444` text, border `rgba(239,68,68,0.25)`
- **Arrow buttons:** No background, just icon enlarged (24-28px), tint `#FFFFFF`

### Cards
- Background: `rgba(255,255,255,0.06)`
- Border: `1px solid rgba(255,255,255,0.10)`
- Border radius: `14px`
- Padding: `14px` internal
- **No fixed container heights** — cards flow naturally with content

### Glassmorphic Navbar (Bottom Tab)
- **BlurView** with `BlurTint="dark"` and `intensity={80}`
- Active tab: frosty pill with `rgba(255,107,74,0.18)` background, `#E43414` icon
- Inactive tab: `rgba(255,255,255,0.4)` icon, no background
- Pill size: `52px × 36px`
- Icons: `Ionicons` size `24px` (inactive), `24px` (active)

### Search Bar
- Background: `rgba(255,255,255,0.06)`
- Border: `1px solid rgba(255,255,255,0.10)`
- Height: `46px`
- Border radius: `14px`
- Placeholder color: `rgba(255,255,255,0.35)`
- Input color: `#FFFFFF`

### Avatars
- Size: `44px-50px` (context dependent)
- Border: `2px solid rgba(255,255,255,0.08)`
- Border radius: `full` (circular)
- Online dot: `#22C55E`, `12px`, positioned bottom-right with `2px` border

### Badge / Count Pills
- Background: `rgba(255,107,74,0.15)` (orange tint)
- Text: `#FF6B4A`
- Border radius: `10px`
- Padding: `8px horizontal, 3px vertical`
- Font: `12px, 500 weight`

### Online Badge
- Background: `rgba(34,197,94,0.12)`
- Text: `#22C55E`
- Dot: `6px × 6px`, `#22C55E`

---

## Screen Layout Rules

### Safe Area
- Use `SafeAreaView` with `edges={['top']}` only
- Bottom padding handled by navbar (`height: 88px + bottom inset`)

### Horizontal Padding
- Screen-level: `20px` (use `paddingHorizontal: 20`)
- Card-level: `14px` (internal padding)
- List gaps: `10px` between cards

### Vertical Spacing
- Section gaps: `16px` between major sections
- Header sections: `6px-12px` padding vertical
- Search bar: `12px` vertical padding

### Scroll Behavior
- Main content: `ScrollView` with `showsVerticalScrollIndicator={false}`
- Bottom padding: `100px` (clears navbar)
- Horizontal lists: `FlatList` with `horizontal`, `showsHorizontalScrollIndicator={false}`

---

## Animation Rules

### Transitions
- Screen transitions: `animation: 'fade'` (no white flash)
- Splash screen: dark background `#0A0C12`
- `userInterfaceStyle: 'dark'` in `app.json`

### Micro-animations
- Fade-in on mount: `Animated.timing` duration `400ms`
- Button press: `activeOpacity={0.7}`
- Carousel dots: `Animated.timing` duration `200ms` (not spring)
- Location confirmation: ripple rings + particle burst + glow pulse

### Carousel / Horizontal Scroll
- Use `snapToInterval` (not `pagingEnabled`) for smooth bidirectional swipe
- `disableIntervalMomentum={true}` for single-card snaps
- Card width + gap calculated precisely

---

## Icon Rules

| Context | Icon Set | Size | Color |
|---|---|---|---|
| Back button | Ionicons | 24px | #FFFFFF |
| Header actions | Ionicons | 24-28px | #FFFFFF (no bg) |
| Tab icons | Ionicons | 24px | Active: #E43414, Inactive: rgba(255,255,255,0.4) |
| Section labels | Ionicons | 16px | Context-dependent |
| Empty states | Ionicons | 48px | rgba(255,255,255,0.12) |
| Search | Ionicons | 18px | rgba(255,255,255,0.4) |

---

## Currency

- **Symbol:** `Rs.`
- **Format:** `Rs. {amount}` (e.g., `Rs. 2,500`)
- **Helper:** `formatPrice(amount)` / `formatCurrency(amount)` from `src/utils/helpers.ts`
- **Constant:** `CURRENCY_SYMBOL = 'Rs.'`

---

## Do's and Don'ts

| ✅ Do | ❌ Don't |
|---|---|
| Use `#E43414` for all CTAs | Use `#FFF44F` (yellow) anywhere |
| Use glassmorphic `rgba(255,255,255,0.06)` backgrounds | Use solid white or gray backgrounds |
| Use `animation: 'fade'` for screens | Use default slide transitions |
| Use `snapToInterval` for carousels | Use `pagingEnabled` |
| Keep cards height flexible (content-driven) | Set fixed `height` on card containers |
| Use `#22C55E` for online indicators | Use any other green shade |
| Use Poppins 500 Medium for all headings | Use bold/semibold weights |
| Use `20px` horizontal screen padding | Use `16px` or `24px` for screen edges |
| Set `userInterfaceStyle: 'dark'` | Allow system theme switching |
| Show `Rs.` for all prices | Use `$` or any other currency symbol |

---

## File References

| File | Purpose |
|---|---|
| `src/theme/colors.ts` | All color tokens |
| `src/theme/fonts.ts` | Font family definitions |
| `src/theme/spacing.ts` | Spacing, border radius, font sizes |
| `src/theme/typography.ts` | Predefined text styles |
| `src/utils/helpers.ts` | `formatPrice()`, `formatCurrency()`, `CURRENCY_SYMBOL` |
| `src/components/ui/GlassNavbar.tsx` | Bottom tab bar (frosty pill style) |
| `src/components/ui/GradientButton.tsx` | Primary CTA button |
| `src/components/ui/PriceBadge.tsx` | Price display component |

---

*Last updated: July 2026 — Evora Event App*
