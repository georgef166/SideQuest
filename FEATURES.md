# SideQuest - Feature Implementation Checklist

## 🔴 CRITICAL - Core Features (Must Have for MVP)

### 1. Quest Generation & Display
- [ ] **Fetch user's current location** (browser geolocation API)
- [ ] **Call backend `/api/quests/generate` endpoint** with location
- [ ] **Display quest cards** on home screen in scrollable feed
- [ ] **Quest detail page** showing all steps, map, estimated time/cost
- [ ] **Error handling** for API failures (show fallback/hardcoded quests)
- [ ] **Loading states** for quest fetching

### 2. Map Integration
- [ ] **Add Google Maps component** to home screen
- [ ] **Show quest pins** on map at each location
- [ ] **User location marker** (blue dot)
- [ ] **Map controls** (zoom, pan, center on user)
- [ ] **Clickable pins** that show quest preview
- [ ] **Sync map with quest list** (click card highlights pin, vice versa)

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
- [ ] **Push notifications** (quest reminders, friend invites)
- [ ] **Calendar integration** (add quest to Google Calendar)
- [ ] **Weather integration** (suggest indoor quests if raining)
- [ ] **Budget tracker** (total spent on quests)
- [ ] **Photo uploads** (share quest photos)
- [ ] **Quest reviews** (community ratings)
- [ ] **Trending quests** (most completed this week)

---

## 🎯 Hackathon Priority Order (24-36 hours)

### Hours 0-8: Foundation
1. User location detection
2. Quest generation API integration
3. Display quest cards on home
4. Basic filters (category, budget, radius)

### Hours 8-16: Core UX
5. Map integration with pins
6. Quest detail page
7. Favorites system (add/remove)
8. Onboarding flow

### Hours 16-24: Social & Polish
9. Share quest functionality
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
- ✅ Firebase Authentication (Google OAuth)
- ✅ Backend API structure (FastAPI)
- ✅ Google Places API integration
- ✅ Ticketmaster API integration
- ✅ Quest generation algorithm (basic)
- ✅ Frontend boilerplate (Next.js + Tailwind)
- ✅ Auth UI components
- ✅ TypeScript types
- ✅ Environment configuration
