# EventApp — Complete Technical Documentation

> **Platform:** Android (primary) · iOS (planned) · Web (secondary)
> **Framework:** React Native 0.86 via Expo SDK 57
> **Language:** TypeScript 6.0 (strict mode)
> **State:** Zustand 5.0 + AsyncStorage persistence
> **Navigation:** React Navigation 7.x (native-stack + custom tab bar)
> **Design System:** Poppins font (400/500), dark AMOLED theme, red-orange accent

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Project Structure](#2-project-structure)
3. [Setup & Running](#3-setup--running)
4. [Design System](#4-design-system)
5. [Navigation Architecture](#5-navigation-architecture)
6. [State Management](#6-state-management)
7. [Screens Reference](#7-screens-reference)
8. [Components Reference](#8-components-reference)
9. [Utilities & Hooks](#9-utilities--hooks)
10. [Data Layer](#10-data-layer)
11. [Platform Notes](#11-platform-notes)
12. [Known Issues & Constraints](#12-known-issues--constraints)

---

## 1. Tech Stack

### Core

| Package | Version | Purpose |
|---|---|---|
| `react-native` | 0.86.0 | Mobile UI framework |
| `expo` | ~57.0.0 | Development platform, builds, OTA |
| `typescript` | ~6.0.3 | Type safety (strict mode) |
| `react` | 19.2.3 | UI library |

### Navigation

| Package | Version | Purpose |
|---|---|---|
| `@react-navigation/native` | ^7.3.5 | Navigation core |
| `@react-navigation/native-stack` | ^7.17.7 | Native stack screens |
| `@react-navigation/stack` | ^7.10.7 | JS stack (auth flow) |
| `@react-navigation/bottom-tabs` | ^7.18.4 | Bottom tabs (available but not used — custom tab bar) |
| `react-native-screens` | 4.25.2 | Native screen containers |
| `react-native-gesture-handler` | ~2.32.0 | Swipe gestures |

### State & Data

| Package | Version | Purpose |
|---|---|---|
| `zustand` | ^5.0.14 | Global state management |
| `@react-native-async-storage/async-storage` | 2.2.0 | Persistent storage |
| `@tanstack/react-query` | ^5.101.2 | Server state, caching, hooks |
| `react-hook-form` | ^7.80.0 | Form state management |
| `@hookform/resolvers` | ^5.4.0 | Yup integration for forms |
| `yup` | ^1.7.1 | Schema validation |
| `date-fns` | ^4.4.0 | Date formatting/manipulation |

### UI & Effects

| Package | Version | Purpose |
|---|---|---|
| `react-native-reanimated` | ~4.5.0 | Animations (60fps native) |
| `react-native-worklets` | ~0.10.0 | Worklet runtime for Reanimated |
| `expo-linear-gradient` | ~57.0.0 | Gradient backgrounds |
| `expo-blur` | ~57.0.0 | Glassmorphism blur effects |
| `@expo/vector-icons` | ^15.0.2 | Ionicons icon set |
| `expo-image` | ~57.0.0 | Optimized image component |
| `react-native-svg` | 15.15.4 | SVG rendering |
| `react-native-pager-view` | 8.0.2 | Swipeable page views |

### Platform

| Package | Version | Purpose |
|---|---|---|
| `expo-font` | ~57.0.0 | Custom font loading |
| `expo-splash-screen` | ~57.0.0 | Splash screen |
| `expo-status-bar` | ~57.0.0 | Status bar control |
| `expo-constants` | ~57.0.2 | App constants |
| `expo-haptics` | ~57.0.0 | Haptic feedback |
| `expo-location` | ~57.0.1 | Location services |
| `expo-notifications` | ~57.0.2 | Push/local notifications |
| `react-native-maps` | 1.27.2 | Map views |

### Dev Dependencies

| Package | Version | Purpose |
|---|---|---|
| `@resvg/resvg-js` | ^2.6.2 | SVG to PNG conversion (build tool) |
| `@types/react` | ~19.2.2 | React type definitions |

---

## 2. Project Structure

```
EventApp/
├── App.tsx                          # Root entry point
├── index.ts                         # registerRootComponent
├── app.json                         # Expo SDK 57 config
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript config (strict)
├── src/
│   ├── assets/
│   │   └── weather/                 # 31 PNG weather icons (96px, transparent)
│   │       ├── clear_day.png
│   │       ├── clear_night.png
│   │       ├── partly_cloudy_day.png
│   │       ├── ... (31 total)
│   │       └── windy.png
│   ├── components/
│   │   ├── index.ts                 # Barrel export
│   │   ├── ui/                      # 16 reusable UI components
│   │   │   ├── AnimatedHamburger.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── CategoryChip.tsx
│   │   │   ├── ClaimVenueModal.tsx
│   │   │   ├── FollowingRow.tsx
│   │   │   ├── GlassCard.tsx
│   │   │   ├── GlassNavbar.tsx
│   │   │   ├── GlassPill.tsx
│   │   │   ├── GlassToggle.tsx
│   │   │   ├── GradientButton.tsx
│   │   │   ├── LoadingSkeleton.tsx
│   │   │   ├── MatteGlassCard.tsx
│   │   │   ├── PriceBadge.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── Toast.tsx
│   │   ├── cards/                   # 4 card components
│   │   │   ├── EventCard.tsx
│   │   │   ├── NotificationCard.tsx
│   │   │   ├── ProfileCard.tsx
│   │   │   └── TicketCard.tsx
│   │   └── layout/                  # 7 layout components
│   │       ├── BottomSheet.tsx
│   │       ├── CalendarWidget.tsx
│   │       ├── EmptyState.tsx
│   │       ├── Modal.tsx
│   │       ├── ScreenContainer.tsx
│   │       ├── SectionHeader.tsx
│   │       └── Sidebar.tsx
│   ├── hooks/
│   │   ├── useApi.ts                # React Query hooks (11 queries)
│   │   └── useFilteredContent.ts    # City-based data filtering
│   ├── navigation/
│   │   ├── index.ts                 # Barrel export
│   │   ├── AppNavigator.tsx         # Root stack (14 routes)
│   │   ├── AuthNavigator.tsx        # Auth flow (5 routes)
│   │   └── MainNavigator.tsx        # Custom tab bar (4 tabs)
│   ├── screens/
│   │   ├── auth/                    # 8 auth/onboarding screens
│   │   │   ├── SplashScreen.tsx
│   │   │   ├── AuthScreen.tsx       # Combined login/signup
│   │   │   ├── LoginScreen.tsx      # (unused — auth handled by AuthScreen)
│   │   │   ├── SignupScreen.tsx     # (unused — auth handled by AuthScreen)
│   │   │   ├── LocationStep.tsx
│   │   │   ├── VibeQuiz.tsx
│   │   │   ├── OnboardingLoading.tsx
│   │   │   └── OnboardingScreen.tsx
│   │   ├── main/                    # 11 main app screens
│   │   │   ├── HomeScreen.tsx       # Dynamic gradient + weather + featured
│   │   │   ├── ExploreScreen.tsx    # Hub grid + filter tabs
│   │   │   ├── MyPlansScreen.tsx    # Saved events + tickets
│   │   │   ├── ProfileScreen.tsx    # User profile
│   │   │   ├── MyEventsScreen.tsx   # User's hosted events
│   │   │   ├── NotificationsScreen.tsx
│   │   │   ├── CinemaScreen.tsx     # Movie showtimes
│   │   │   ├── DiningScreen.tsx     # Restaurant listings
│   │   │   ├── PlaySportsScreen.tsx # Sports venues
│   │   │   ├── FollowingScreen.tsx  # Followed venues/organizers
│   │   │   └── SettingsScreen.tsx   # App settings
│   │   ├── events/                  # 7 event-related screens
│   │   │   ├── EventDetailScreen.tsx # Full event view + social proof
│   │   │   ├── BookingScreen.tsx    # Multi-step ticket booking
│   │   │   ├── CalendarScreen.tsx   # Calendar view
│   │   │   ├── EditProfileScreen.tsx
│   │   │   ├── HostEventScreen.tsx  # Create event form
│   │   │   ├── VenueProfileScreen.tsx
│   │   │   └── OrganizerProfileScreen.tsx
│   │   └── social/
│   │       └── FriendsScreen.tsx    # Friends list + suggestions
│   ├── services/
│   │   ├── mockData.ts              # 1580 lines of mock data
│   │   └── api.ts                   # Mock API with simulated delays
│   ├── store/
│   │   └── index.ts                 # Zustand stores (useAuth + useApp)
│   ├── theme/
│   │   ├── index.ts                 # Barrel export
│   │   ├── colors.ts                # Dark theme color palette
│   │   ├── fonts.ts                 # Poppins font loading
│   │   ├── typography.ts            # Text style presets
│   │   └── spacing.ts               # Spacing, radii, sizes
│   ├── types/
│   │   └── index.ts                 # All TypeScript interfaces
│   └── utils/
│       ├── booking.ts               # External/WhatsApp booking handlers
│       ├── helpers.ts               # Formatting, timeAgo, UUID
│       ├── notifications.ts         # Local notification scheduling
│       ├── validators.ts            # Yup schemas (login/signup/profile)
│       └── weather.ts               # Weather API + time-of-day gradients
```

---

## 3. Setup & Running

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- Android Studio (for Android emulator) or physical Android device with Expo Go
- (Optional) Xcode (for iOS simulator — future)

### Install

```bash
cd EventApp
npm install --legacy-peer-deps
```

> **Important:** Always use `--legacy-peer-deps`. Never run `npm audit fix --force` — it downgrades Expo SDK and breaks compatibility.

### Run

```bash
# Start development server
npx expo start

# Android only
npx expo start --android

# Web only
npx expo start --web
```

The app runs on `http://localhost:8081` for web.

### TypeScript Check

```bash
npx tsc --noEmit
```

Must return 0 errors.

### Scripts

| Command | Description |
|---|---|
| `npm start` | Start Expo dev server |
| `npm run android` | Start on Android |
| `npm run ios` | Start on iOS |
| `npm run web` | Start on web |

---

## 4. Design System

### Color Palette

```
Background:   #0A0C12 (AMOLED black)
Cards:        #161B24
Elevated:     #1C2130
Surface:      #12161D

Accent:       #FF6B4A (red-orange, primary actions)
Primary:      #E43414 (red, active states)
Success:      #2ED573
Warning:      #FFD700

Text:         #FFFFFF (primary)
              rgba(255,255,255,0.65) (secondary)
              rgba(255,255,255,0.45) (muted)

Borders:      rgba(255,255,255,0.07) (light)
              rgba(255,255,255,0.12) (medium)
              rgba(255,107,74,0.5)   (focus)

Glass:        rgba(255,255,255,0.04) (light)
              rgba(255,255,255,0.07) (medium)
              rgba(255,255,255,0.11) (heavy)
```

### Typography — Poppins Only

| Role | Font | Weight | Usage |
|---|---|---|---|
| Heading | Poppins_500Medium | 500 | Screen titles, section headers |
| Subheading | Poppins_500Medium | 500 | Card titles, labels |
| Body | Poppins_400Regular | 400 | Paragraphs, descriptions |
| Body Bold | Poppins_500Medium | 500 | Emphasized text |
| Button | Poppins_500Medium | 500 | All button labels |

> **No bold (700) weights. No Inter font. Uniform medium/regular Poppins throughout.**

### Spacing Scale

```
xs: 4px    sm: 8px    md: 12px   lg: 16px
xl: 20px   xxl: 24px  xxxl: 32px huge: 40px
```

### Border Radius

```
sm: 8px    md: 12px   lg: 16px   xl: 20px
xxl: 24px  full: 9999px (pill)
```

### Time-of-Day Gradient (HomeScreen Header)

| Time | Gradient Colors | Duration |
|---|---|---|
| Morning (6–12) | `#87CEEB → #3A6073 → #0A0C12` | Blue sky |
| Noon (12–16) | `#FFDF00 → #F0A500 → #0A0C12` | Bright gold |
| Sunset (16–19) | `#FF7E5F → #C0392B → #0A0C12` | Warm orange-red |
| Evening (19–22) | `#2B5876 → #1A1A3E → #0A0C12` | Deep blue-purple |
| Night (22–6) | `#0D0D0D → #050508 → #0A0C12` | AMOLED black |

---

## 5. Navigation Architecture

### Root Stack (`AppNavigator`)

```
RootStack (NativeStack)
├── Auth (stack)              # AuthNavigator
├── Main (custom tabs)        # MainNavigator
├── EventDetail               # modal
├── VenueProfile              # modal
├── OrganizerProfile          # modal
├── Booking                   # modal
├── EditProfile               # modal
├── Following                 # modal
├── Friends                   # modal
├── HostEvent                 # modal
├── Notifications             # modal
├── Cinema                    # modal
├── Dining                    # modal
├── PlaySports                # modal
└── Settings                  # modal
```

### Auth Stack (`AuthNavigator`)

```
AuthStack (JS Stack with fade transition)
├── Splash
├── Auth                      # Combined login/signup
├── LocationStep
├── VibeQuiz
└── OnboardingLoading
```

### Main Tabs (`MainNavigator`)

Custom tab implementation (NOT React Navigation Bottom Tabs — those interfere with web scroll):

```
MainNavigator
├── HomeTab    → HomeScreen
├── ExploreTab → ExploreScreen
├── PlansTab   → MyPlansScreen
└── ProfileTab → ProfileScreen
```

Tab switching uses Zustand store (`activeTab` / `setActiveTab`). Tabs are local state, not registered React Navigation screens.

### Tab Navigation Flow

- **HomeScreen** → `setActiveTab('ExploreTab')` to switch tabs
- **Sidebar** → uses `setActiveTab()` for tab switches, `navigation.navigate()` for stack pushes
- **SettingsScreen** → navigates directly to `EditProfile` stack screen
- **ExploreScreen hub cards** → navigate to stack screens (Cinema, Dining, PlaySports)

---

## 6. State Management

### Zustand Store: `useAuth`

Persisted to `auth-storage` via AsyncStorage.

**State:**

| Field | Type | Default |
|---|---|---|
| `isLoggedIn` | `boolean` | `false` |
| `user` | `User \| null` | `null` |
| `location` | `UserLocation \| null` | `null` |
| `preferences` | `string[]` | `[]` |
| `savedEvents` | `string[]` | `[]` |
| `eventNotifications` | `Record<string, string>` | `{}` |
| `followedVenues` | `string[]` | `[]` |
| `followedOrganizers` | `string[]` | `[]` |
| `organizerNotifications` | `Record<string, string>` | `{}` |
| `onboardingComplete` | `boolean` | `false` |
| `pendingEvents` | `AppEvent[]` | `[]` |
| `settings` | `Settings` | `{ push: true, smart: true, dark: true }` |
| `friendsList` | `string[]` | `[f-001..f-012]` |
| `privacySettings` | `PrivacySettings` | `{ hideRSVPs: false }` |
| `privateRSVPs` | `string[]` | `[]` |
| `userSelectedCity` | `PakistanCity` | `'lahore'` |

**Actions (26):**

| Action | Parameters | Description |
|---|---|---|
| `login` | `user` | Set logged in + user data |
| `logout` | — | Cancel all notifications, reset state |
| `setUser` | `user` | Update user |
| `setLocation` | `location` | Update location |
| `setPreferences` | `string[]` | Set preferences |
| `addPreference` | `string` | Add single preference |
| `removePreference` | `string` | Remove preference |
| `toggleRSVP` | `eventId, title, date, time` | Toggle RSVP + schedule/cancel notification |
| `isEventSaved` | `eventId` | Check if event is saved |
| `toggleFollowVenue` | `venueId, name` | Follow/unfollow venue + topic notification |
| `isVenueFollowed` | `venueId` | Check if venue followed |
| `toggleFollowOrganizer` | `organizerId, name` | Follow/unfollow organizer |
| `isOrganizerFollowed` | `organizerId` | Check if organizer followed |
| `unfollowEntity` | `id, type` | Unfollow venue or organizer |
| `updateSettings` | `key, value` | Update settings |
| `addFriend` | `friendId` | Add friend |
| `removeFriend` | `friendId` | Remove friend |
| `isFriend` | `friendId` | Check if friend |
| `updatePrivacySettings` | `key, value` | Update privacy |
| `togglePrivateRSVP` | `eventId` | Toggle RSVP privacy |
| `isRSVPPrivate` | `eventId` | Check if RSVP is private |
| `setUserSelectedCity` | `city` | Change city filter |
| `submitEvent` | `eventData` | Create event + add to pending |
| `completeOnboarding` | `{ user, location, preferences }` | Finalize onboarding |

### Zustand Store: `useApp`

Persisted to `app-storage`.

**State:**

| Field | Type | Default |
|---|---|---|
| `activeTab` | `TabName` | `'HomeTab'` |
| `activeVibe` | `string \| null` | `null` |
| `searchQuery` | `string` | `''` |
| `isSearching` | `boolean` | `false` |
| `userSelectedCity` | `string` | `'lahore'` |
| `weather` | `WeatherData \| null` | `null` |
| `events` | `AppEvent[]` | from mockData |
| `movies` | `Movie[]` | from mockData |
| `restaurants` | `Restaurant[]` | from mockData |
| `cinemas` | `Cinema[]` | from mockData |
| `showtimes` | `MovieShowtime[]` | from mockData |

**Persisted fields:** `activeVibe`, `userSelectedCity`, `weather`, `events`, `movies`, `restaurants`, `cinemas`, `showtimes`.

### React Query Hooks (`useApi.ts`)

| Hook | Query Key | Description |
|---|---|---|
| `useEvents()` | `['events']` | All events |
| `useEvent(id)` | `['event', id]` | Single event |
| `useEventsByCategory(cat)` | `['events', 'category', cat]` | Filtered by category |
| `useSearchEvents(query)` | `['events', 'search', query]` | Search results |
| `usePopularEvents()` | `['events', 'popular']` | Popular events |
| `useUpcomingEvents()` | `['events', 'upcoming']` | Upcoming events |
| `useUser()` | `['user']` | Current user |
| `useTickets()` | `['tickets']` | User tickets |
| `useNotifications()` | `['notifications']` | Notifications |
| `useBookings()` | `['bookings']` | Bookings |
| `useToggleFavorite()` | mutation | Toggle favorite |

---

## 7. Screens Reference

### Auth Flow

| Screen | Description |
|---|---|
| **SplashScreen** | Animated app logo on launch |
| **AuthScreen** | Combined login/signup with animated toggle. Email/password validation via Yup |
| **LocationStep** | City selection (Lahore, Karachi, Islamabad) |
| **VibeQuiz** | Interest selection (live music, cinema, food, sports, art, tech, etc.) |
| **OnboardingLoading** | Animated loading while profile is created |

### Main Tabs

| Screen | Description |
|---|---|
| **HomeScreen** | Dynamic time-of-day gradient header, weather icon, greeting, search bar, featured event card, vibe filter chips (Friends/Live Music/Food/Sports etc.), Popular in Lahore horizontal scroll, Upcoming events list |
| **ExploreScreen** | Hub grid (Dining, Cinema, Play & Sports) inside FlatList header, filter tabs (All/Artists/Venues), searchable events list |
| **MyPlansScreen** | Saved events (RSVP'd), tickets, calendar widget |
| **ProfileScreen** | User avatar, stats (events attended, saved, friends), settings links, logout |

### Event Screens

| Screen | Description |
|---|---|
| **EventDetailScreen** | Full event view with cover image, social proof (friend avatars + count), RSVP button, date/time details, map, booking button, similar events |
| **BookingScreen** | Multi-step booking flow: ticket type selection → attendee info → payment → confirmation. Supports external links, WhatsApp, in-app |
| **CalendarScreen** | Calendar grid view of events |
| **HostEventScreen** | Create event form with image upload, venue selection, pricing, date/time |
| **VenueProfileScreen** | Venue cover image, logo, stats (followers/events/rating), follow button, map link, upcoming/past events, "Claim this page" modal |
| **OrganizerProfileScreen** | Organizer profile with avatar, metrics, Instagram/website links, upcoming/past event tabs, "Claim this page" modal |
| **EditProfileScreen** | Edit user profile (name, email, phone, avatar) |

### Secondary Screens

| Screen | Description |
|---|---|
| **CinemaScreen** | Movie listings with posters, showtimes by cinema, format badges (2D/3D/IMAX) |
| **DiningScreen** | Restaurant cards with cuisine, rating, price range, live music indicator |
| **PlaySportsScreen** | Sports venue cards with rating, review count, distance |
| **FollowingScreen** | List of followed venues and organizers |
| **NotificationsScreen** | Notification feed (event reminders, social, system) |
| **SettingsScreen** | Push notifications toggle, smart reminders, dark mode, city selector, privacy |
| **FriendsScreen** | Friends list with online status, suggested friends with "Add" buttons, search |

---

## 8. Components Reference

### UI Components

| Component | Props | Description |
|---|---|---|
| `GlassCard` | `children, style` | Semi-transparent card with blur backdrop |
| `MatteGlassCard` | `children, style` | Non-blur glass card (solid dark) |
| `GlassPill` | `children, onPress, style` | Rounded glass button/chip |
| `GlassNavbar` | `left, center, right, style` | Glass-effect navigation bar |
| `GlassToggle` | `value, onValueChange` | Glass-style toggle switch |
| `GradientButton` | `title, onPress, colors, style` | Gradient background button |
| `Avatar` | `source, size, style` | Circular avatar with fallback |
| `Badge` | `count, style` | Notification count badge |
| `PriceBadge` | `price, style` | Price tag overlay |
| `CategoryChip` | `label, icon, active, onPress` | Filter chip with icon |
| `SearchBar` | `value, onChangeText, placeholder` | Glass search input |
| `LoadingSkeleton` | `width, height, style` | Shimmer loading placeholder |
| `Toast` | `message, type, visible` | Snackbar notification |
| `AnimatedHamburger` | `isOpen, onPress` | Animated menu toggle |
| `FollowingRow` | `name, avatar, isFollowed, onToggle` | Follow/unfollow row |
| `ClaimVenueModal` | `visible, onClose, venueName` | "Claim this business" modal |

### Card Components

| Component | Props | Description |
|---|---|---|
| `EventCard` | `event, onPress, style` | Event card with image, title, date, price |
| `TicketCard` | `ticket, onPress, style` | Ticket card with status badge |
| `NotificationCard` | `notification, onPress` | Notification item with icon |
| `ProfileCard` | `profile, onPress` | User/organizer profile card |

### Layout Components

| Component | Props | Description |
|---|---|---|
| `ScreenContainer` | `children, style` | Safe area wrapper |
| `SectionHeader` | `title, action, onAction` | Section title with optional link |
| `EmptyState` | `icon, title, subtitle` | Empty state placeholder |
| `CalendarWidget` | `events, onDatePress` | Mini calendar with event dots |
| `Modal` | `visible, onClose, children` | Reusable modal wrapper |
| `BottomSheet` | `visible, onClose, children` | Bottom sheet overlay |
| `Sidebar` | `visible, onClose` | Slide-in sidebar menu |

---

## 9. Utilities & Hooks

### Utilities

| File | Functions | Description |
|---|---|---|
| `weather.ts` | `getTimeOfDay()`, `getWeatherEmoji()`, `getWeatherIconKey()`, `getWeatherEmojiFromText()`, `getWeatherIconKeyFromText()`, `fetchWeather()`, `isWeatherCacheValid()` | Weather API (OpenWeatherMap), time-of-day detection, gradient mapping, 2-hour cache |
| `notifications.ts` | `requestNotificationPermissions()`, `scheduleEventReminder()`, `cancelEventReminder()`, `cancelAllEventReminders()`, `getScheduledNotifications()`, `scheduleTopicNotification()`, `cancelTopicNotification()` | Lazy-loaded expo-notifications with Expo Go fallback |
| `helpers.ts` | `formatDate()`, `formatTime()`, `formatPrice()`, `formatCurrency()`, `truncateText()`, `getTimeAgo()`, `getInitials()`, `generateId()` | Formatting, time ago, UUID v4 |
| `validators.ts` | `loginSchema`, `signupSchema`, `profileSchema` | Yup validation schemas |
| `booking.ts` | `handleVenueBooking()`, `getBookingButtonLabel()` | External link / WhatsApp / in-app booking routing |

### Hooks

| Hook | Description |
|---|---|
| `useApi` (11 hooks) | React Query wrappers for mock API |
| `useFilteredContent` | Filters events/dining/cinema/play by selected city |

---

## 10. Data Layer

### Mock Data (`mockData.ts` — 1580 lines)

All data is mocked for development. Key data structures:

| Data | Count | Fields |
|---|---|---|
| `mockEvents` | 20+ | id, title, description, category, image, price, location, date, time, organizer, venue, attendees, rating, isFeatured, neighborhood, city |
| `mockMovies` | 10+ | id, title, genre, duration, rating, poster, synopsis, director, cast, ageRating, city |
| `mockCinemas` | 5+ | id, name, address, distance, neighborhood, city |
| `mockShowtimes` | 20+ | id, movieId, cinemaId, date, time, format, price, availableSeats, city |
| `mockRestaurants` | 10+ | id, name, cuisine, image, priceRange, rating, reviewCount, address, neighborhood, isOpen, hasLiveMusic, city |
| `mockVenues` | 5+ | id, name, type, logo, coverImage, bio, address, neighborhood, rating, followerCount, eventCount, tags |
| `mockOrganizers` | 5+ | id, name, avatar, coverImage, bio, rating, followerCount, eventCount, tags |
| `mockFriends` | 12 | id, name, handle, avatar, mutualFriends, isOnline |
| `mockVibes` | 10 | live_music, cinema, workshops, business, foodie, sports, comedy, art, tech, festivals |

### City Filtering

All data is tagged with `city: 'lahore' | 'karachi' | 'islamabad'`. The `useFilteredContent` hook filters all arrays by `userSelectedCity`.

### Weather API

- **Provider:** OpenWeatherMap (free tier, `appid=demo`)
- **Cache:** 2 hours, persisted in Zustand
- **Fallback:** City-specific defaults (Lahore → Haze, Karachi → Clear, Islamabad → Partly Cloudy)
- **Coordinates:** Lahore (31.52, 74.36), Karachi (24.86, 67.00), Islamabad (33.68, 73.05)

### Weather Icons

31 PNG icons from Google Weather Icons Set 4 (96px, transparent background) in `src/assets/weather/`. Mapped via `WEATHER_ICON_MAP` in `src/assets/weatherIcons.ts` using `require()`.

---

## 11. Platform Notes

### Android (Primary)

- Adaptive icon configured in `app.json` (foreground + background + monochrome)
- Portrait orientation locked
- `expo-notifications` uses lazy dynamic import to prevent Expo Go crash on SDK 53+
- `react-native-maps` available for native map views
- Haptic feedback via `expo-haptics`

### iOS (Planned)

- `app.json` has `ios.supportsTablet: true`
- `react-native-safe-area-context` handles notch/Dynamic Island
- Same codebase — no platform-specific code needed for v1
- `react-native-gesture-handler` native gestures work on both platforms

### Web (Secondary)

- `react-native-web` ~0.19.13
- Custom tab bar (not React Navigation Bottom Tabs) to avoid scroll interference
- FlatLists use `flex: 1`, ScrollViews use `flex: 1` + `flexGrow: 1` for web scroll gaps
- `expo-blur` falls back gracefully on web

---

## 12. Known Issues & Constraints

### Do Not

- **Never run `npm audit fix --force`** — downgrades Expo SDK (57 → 46) and breaks compatibility
- **Never use `npm install` without `--legacy-peer-deps`** — peer dependency conflicts exist
- **Never import `expo-notifications` at top level** — crashes Expo Go on SDK 53+. Always use lazy dynamic import
- **Never use `fontWeight: 'bold'` or `'700'`** — all font weights must be `'500'` (Poppins medium only)
- **Never use Inter font** — Poppins only across the entire app

### Architecture Decisions

- **Custom tab bar** instead of React Navigation Bottom Tabs — Bottom Tab navigator wraps screens in internal View containers that interfere with flex layout on web
- **Zustand for tab state** — tabs are local state, not registered React Navigation screens. Must use `setActiveTab()` to switch, not `navigation.navigate()`
- **Weather icons as PNG assets** — React Native's `<Image>` cannot render SVG data URIs. PNGs loaded via `require()` work on all platforms
- **`expo-notifications` lazy import** — module itself throws in Expo Go on SDK 53+. Wrapped in try-catch with fallback

### Type Exports

- `PrivacySettings` interface exported from `types/index.ts` (used by BookingScreen)

### Unused Files

- `LoginScreen.tsx` and `SignupScreen.tsx` — dead files. AuthScreen handles both login and signup modes
- `OnboardingScreen.tsx` — not registered in AuthNavigator
