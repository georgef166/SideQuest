# SideQuest - Feature Implementation Checklist

## 🔴 CRITICAL - Core Features (Must Have for MVP)

### 1. Quest Generation & Display
- [x] **Fetch user's current location** (browser geolocation API)
  - ✅ Integrated into home page with fallback to McMaster location
- [x] **Call backend `/api/quests/generate` endpoint** with location
  - ✅ API call implemented with error handling
- [x] **Display quest cards** on home screen in scrollable feed
  - ✅ Quest cards render with data from API
- [x] **Loading states** for quest fetching
  - ✅ Spinner shown during quest generation
- [x] **Error handling** for API failures
  - ✅ Error messages displayed with retry option
- [x] **Quest detail page** showing all steps, map, estimated time/cost
  - ✅ Created `/app/quest/[id]/page.tsx` with full quest breakdown
  - ✅ Shows all quest steps in order with locations
  - ✅ Displays total time, cost, difficulty, tags
  - ✅ Action buttons for start, save, share

### 2. Map Integration
- [x] **Add Google Maps component** to home screen
  - ✅ Using Google Maps JavaScript API with AdvancedMarkerElement
- [x] **Show quest pins** on map at each location
  - ✅ Numbered pins (1, 2, 3...) at first step of each quest
- [x] **User location marker** (blue dot)
  - ✅ User location shown with standard marker
- [x] **Map controls** (zoom, pan, center on user)
  - ✅ Standard Google Maps controls enabled
- [x] **Clickable pins** that show quest preview
  - ✅ Click pin to see InfoWindow with title, description, stats, and "View Details" button
- [x] **Sync map with quest list** (click card highlights pin, vice versa)
  - ✅ Hover over quest card highlights corresponding pin
  - ✅ Click pin scrolls to and highlights quest card
  - ✅ Selected quest has larger blue pin, others are indigo

### 3. Location & Radius Selection
- [ ] **Location search bar** (autocomplete for addresses)
- [ ] **Radius slider** (500m - 25km with presets: walkable, bikeable, drive)
- [ ] **"Use my location" button**
- [ ] **Save location preferences** to Firestore

### 4. Filters & Categories
- [ ] **Category filter chips** (Food, Events, Outdoors, Arts, Nightlife, etc.)
- [ ] **Budget filter** (broke/$, moderate/$$, bougie/$$$)
- [ ] **Time window filter** (Now, Tonight, This Weekend, Custom date)
- [ ] **Distance filter** (within radius)
- [ ] **"Apply Filters" button** that refetches quests
- [ ] **Clear filters option**

---

## 🟡 HIGH PRIORITY - User Experience

### 5. User Onboarding
- [ ] **First-time welcome flow** after login
- [ ] **Mood picker** (chill, social, energetic, romantic, adventurous)
- [ ] **Budget preference** selection
- [ ] **Favorite categories** multi-select
- [ ] **Typical radius** setting
- [ ] **Save preferences to Firestore** (`users/{uid}/preferences`)
- [ ] **Skip onboarding option**

### 6. Favorites System
- [ ] **Heart icon on quest cards** (toggle favorite)
- [ ] **Favorites tab/page** with saved quests
- [ ] **Save individual places** (not just full quests)
- [ ] **Add notes to favorites** ("great for dates", "too crowded")
- [ ] **Firestore integration** (`favorites/{user_id}` collection)
- [ ] **"Questify my favorites" button** (auto-generate quest from saved places)
- [ ] **Remove from favorites** functionality

### 7. Quest Completion & Tracking
- [ ] **"I'm in!" button** on quest detail page
- [ ] **Mark quest as active** (show in "My Active Quests" tab)
- [ ] **"Mark Complete" button** after estimated time
- [ ] **Rate completed quest** (1-5 stars)
- [ ] **Add feedback/notes** to completion
- [ ] **XP/points system** (100 XP per quest)
- [ ] **Completion history** in user profile
- [ ] **Firestore storage** (`completions/{user_id}` collection)

### 8. User Profile & Stats
- [ ] **Profile page** with user info
- [ ] **Safety** Logging in with Face Verification
- [ ] **Edit preferences** (budget, mood, categories, radius)
- [ ] **Quests completed count**
- [ ] **Total XP earned**
- [ ] **Favorite categories breakdown** (pie chart or list)
- [ ] **Recent mood history** ("You love chill nights")
- [ ] **Badges/achievements** (optional: "5 quests", "Weekend warrior", etc.)

---

## 🟢 MEDIUM PRIORITY - Social Features

### 9. Share Quests
- [ ] **Share button** on quest cards
- [ ] **Generate shareable link** (`sidequest.app/quest/{id}` or deep link)
- [ ] **Pre-filled message** with quest details
- [ ] **Share via SMS** (prefilled text)
- [ ] **Share via WhatsApp** (deep link)
- [ ] **Copy link to clipboard**
- [ ] **Social media share** (Twitter, Facebook - optional)

### 10. Friend Invites
- [ ] **"Invite friends to this quest" button**
- [ ] **Find friends by email** (search Firestore users)
- [ ] **Send invite notification** (email or in-app)
- [ ] **"I'm in" confirmation flow** for invited friends
- [ ] **Show who's coming** on quest detail page
- [ ] **Friend list management** (add/remove friends)
- [ ] **Firestore schema** for friend relationships

### 11. Friend Activity (Stretch)
- [ ] **Follow other users** (opt-in public profiles)
- [ ] **See friends' public quests** in feed
- [ ] **Friends' completed quests** section
- [ ] **Collaborative quest suggestions** ("People also did...")
- [ ] **Friend leaderboard** (XP, completions)

---

## 🔵 LOW PRIORITY - Polish & Extras

### 12. Quest Generation Improvements
- [ ] **Better scoring algorithm** (use ratings, distance, user history)
- [ ] **More quest templates** (Study Break, Adventure Day, Cultural Tour)
- [ ] **Dynamic quest adjustment** (swap closed places in real-time)
- [ ] **Personalized recommendations** based on completed quests
- [ ] **"Quest of the Day" feature**
- [ ] **Seasonal/holiday themed quests**

### 13. Accessibility & Preferences
- [ ] **Accessibility tags** (wheelchair-friendly, quiet, step-free)
- [ ] **Noise level indicators**
- [ ] **Crowd-sourced accessibility data**
- [ ] **Dietary restrictions filter** (vegan, gluten-free)
- [ ] **Alcohol-free quest option**
- [ ] **Pet-friendly filter**

### 14. McMaster/Hamilton Specific
- [ ] **"Campus Mode" toggle** (prioritize McMaster radius)
- [ ] **Student-friendly category** (cheap, study spots)
- [ ] **Campus events integration** (if API available)
- [ ] **Hamilton hidden gems** (curated list)
- [ ] **3-5 hardcoded McMaster quests** as fallback demo data

### 15. UI/UX Polish
- [ ] **Loading skeletons** (instead of spinners)
- [ ] **Empty states** (no quests found, no favorites)
- [ ] **Error messages** (friendly, actionable)
- [ ] **Toast notifications** (quest saved, completed, etc.)
- [ ] **Animations** (card hover, transitions)
- [ ] **Dark mode support** (optional)
- [ ] **Mobile responsive design** (already using Tailwind)
- [ ] **Bottom navigation** (Home, Explore, Favorites, Profile)

### 16. Backend Enhancements
- [ ] **Quest caching** (store generated quests in Firestore/DB)
- [ ] **Rate limiting** (prevent API abuse)
- [ ] **Firebase Admin SDK** (verify user tokens server-side)
- [ ] **Analytics** (track quest views, completions)
- [ ] **Error logging** (Sentry or similar)
- [ ] **API response time optimization**

### 17. Advanced Features (Hackathon Stretch Goals)
## 🎯 Hackathon Priority Order (Next Steps)

### IMMEDIATE (Next 4-6 hours) - Make it Work
**Goal: Working demo of core quest flow**
1. ✅ ~~Backend endpoints~~ (DONE)
2. ⏭️ Integrate geolocation into home page (copy from `/location-test`)
3. ⏭️ Wire up `POST /api/quests/generate` call with user location
4. ⏭️ Display quest cards in scrollable feed (use existing `QuestCard`)
5. ⏭️ Add loading spinner during API call
6. ⏭️ Quest detail page at `/quest/[id]` - show steps, total time/cost

**Demo checkpoint: User sees personalized quests based on their location**

### NEXT (6-12 hours) - Make it Useful  
**Goal: Filters + map for real exploration**
7. ⏭️ Add Google Maps to home with quest pins
8. ⏭️ Category filter chips (Food, Events, Outdoors, etc.)
9. ⏭️ Radius slider (1km - 25km)
10. ⏭️ Budget filter (broke/moderate/bougie)
11. ⏭️ Refetch quests when filters change

**Demo checkpoint: User can customize quest discovery**

### THEN (12-18 hours) - Make it Personal
**Goal: User preferences + persistence**
12. ⏭️ Onboarding flow (mood, budget, categories, radius)
13. ⏭️ Save preferences to Firestore
14. ⏭️ Favorites - heart icon on cards, save to Firestore
15. ⏭️ Favorites page showing saved quests

**Demo checkpoint: User has personalized experience**

### FINALLY (18-24 hours) - Make it Shareable
**Goal: Social features + polish**
16. ⏭️ Share quest (copy link, SMS, WhatsApp)
17. ⏭️ Quest completion tracking (mark as done, rate)
18. ⏭️ User profile with stats (quests completed, XP)
19. ⏭️ McMaster fallback quests (3-5 hardcoded)
20. ⏭️ Error handling + empty states
21. ⏭️ UI polish (animations, loading states)

**Demo checkpoint: Ready for presentation**

### Stretch Goals (24+ hours)
- Friend invites
- Quest of the day
- Advanced personalization
- Push notificationstionality
10. Quest completion flow
11. User profile/stats
12. McMaster fallback quests

### Hours 24-36: Demo Prep & Extras
13. Friend invites (if time)
14. UI polish & loading states
15. Error handling
16. Record demo video
17. Pitch rehearsal

---

## 📊 Feature Breakdown by Complexity

**Quick Wins (1-2 hours each):**
- Location detection
- Basic filters
- Favorites UI
- Share links
- Loading states

**Medium (3-5 hours each):**
- Map integration
- Quest detail page
- Onboarding flow
- Completion tracking
- Profile page

**Complex (6-8 hours each):**
- Quest generation refinement
- Friend system
- Dynamic quest updates
- Advanced personalization

---

## ✅ Already Completed

### Backend
- ✅ FastAPI app structure (`backend/main.py`, CORS configured)
- ✅ Pydantic models for all entities (`backend/app/models.py`)
- ✅ Google Places API client (`backend/app/google_places.py`)
- ✅ Ticketmaster API client (`backend/app/ticketmaster.py`)
- ✅ Quest generation algorithm (`backend/app/quest_generator.py`)
  - ✅ Coffee walk quests
  - ✅ Budget food quests
  - ✅ Template-based scoring
- ✅ API endpoints:
  - ✅ `POST /api/places/nearby` - fetch nearby places
  - ✅ `POST /api/events/nearby` - fetch nearby events
  - ✅ `POST /api/quests/generate` - generate quests from places/events
- ✅ Swagger docs at `/docs`

### Frontend
- ✅ Next.js 16 app with App Router
- ✅ Firebase setup (`lib/firebase.ts` - auth, Firestore exports)
- ✅ Firebase Authentication with Google OAuth
- ✅ `useAuth()` hook for auth state
- ✅ `apiClient` singleton for backend calls (`lib/api.ts`)
- ✅ TypeScript types matching backend models (`lib/types.ts`)
- ✅ Components:
  - ✅ `AuthButton` with sign in/out
  - ✅ `QuestCard` (basic, may need enhancement)
- ✅ Pages:
  - ✅ Home page with auth check
  - ✅ Location test page (working geolocation demo)
- ✅ Tailwind CSS styling
