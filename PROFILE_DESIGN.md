# SideQuest Profile Experience Design

## Information Architecture

### Routes
- **`/profile`** — Default: Profile View mode (read-only preview of user's profile)
- **`/profile/edit`** — Edit mode (modal or page-based editor with save/cancel)
- Navigation via avatar click in top-right navbar → opens `/profile` (View mode by default)
- "Edit Profile" button in View mode → navigates to `/profile/edit`

### Navigation Flow
```
Navbar Avatar Click
         ↓
    /profile (View Mode)
         ↓
   Click "Edit Profile"
         ↓
  /profile/edit (Edit Mode)
         ↓
    Save or Cancel
         ↓
  Back to /profile (View Mode)
```

### Visibility
- **Public vs Private**: For MVP, all profile data is **private** (not shown to other users). Profile sections are for user self-review only.
- Future: "Public profile" toggle could control visibility of sections like "About me", "Where I live", "Favorite categories", etc.

---

## Profile View Mode (TripAdvisor-Inspired)

### Page Layout

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ← Back  [Page title: "My Profile"]      [Edit]    │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│         [Avatar ○]                                  │
│                                                     │
│         Display Name                                │
│         @username (if set)                          │
│         Joined Jan 10, 2024                         │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Profile Completeness Card]                        │
│  ═══════════════════════════                        │
│  "Complete your profile"                            │
│  Progress: ███░░░░░░░ 6/12 fields                   │
│                                                     │
│  • Add your intro                                   │
│  • Verify your email                                │
│  • Set your quest preferences                       │
│                                                     │
│  [Edit Profile →]                                   │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ABOUT YOU                                          │
│  ────────────────────────────────────────────       │
│  [Card] Legal Name: Jane Doe                        │
│  [Card] Preferred Name: Jane                        │
│  [Card] Email: jane@example.com ✓ verified         │
│  [Card] About Me: [intro text or "Add intro"]       │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  MY LIFESTYLE                                       │
│  ────────────────────────────────────────────       │
│  [Card] Where I live: Toronto, ON                   │
│  [Card] Where I went to school: McMaster Univ.      │
│  [Card] My work: Product Manager, [Company]         │
│  [Card] Quest Vibe: Social & Energetic              │
│  [Card] Budget Comfort: Moderate                    │
│  [Card] Transportation: Transit & Walking           │
│  [Card] Dietary Preferences: Vegetarian             │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  MY PREFERENCES                                     │
│  ────────────────────────────────────────────       │
│  [Card] Accessibility Needs: Step-free, quiet       │
│  [Card] Time Preference: Spontaneous                │
│  [Card] Favorite Categories: Food, Outdoors, Arts   │
│  [Card] Energy Level: Medium-to-High                │
│  [Card] Social Comfort: Group adventures            │
│  [Card] Hidden Gems Seeker: Yes (loves discovering) │
│  [Card] Pace: Take it slow & explore (not rushed)   │
│  [Card] Local Knowledge: New to area                │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  QUEST STATS (Non-editable, informational)          │
│  ────────────────────────────────────────────       │
│  🎯 Quests Completed: 12                            │
│  🔥 Current Streak: 4 days                          │
│  ⭐ Favorites: 23                                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Profile Completeness Card
- **Location**: Top of profile, below avatar section
- **Layout**: 
  - Heading: "Complete your profile" or "Profile is ${percentage}% complete"
  - Progress bar (visual + percentage text)
  - 3–4 high-priority incomplete fields as bullet-point suggestions
  - Single CTA button: "Edit Profile →"
- **Triggers** when profile < 80% complete
- **Fields counted for completion**: Legal name, About me, Email verified, Where I live, Quest Vibe, Favorite Categories, Accessibility Needs, Photo (if added)

### Empty States + Prompts
- If a field is missing, show placeholder text instead of blank:
  - "Add your intro" instead of empty box
  - "Add where you live" instead of empty box
  - "Not specified" for optional fields (dietary, transportation)
- TripAdvisor-style small icons next to each section heading for visual interest

### Example UI Copy

**Page Header**
- "My Profile" (main title)
- "Keep your profile up to date to get better quest recommendations" (subtitle, if profile incomplete)

**Section Headings** (with icons)
- 👤 ABOUT YOU
- 🌍 MY LIFESTYLE
- ⚙️ MY PREFERENCES
- 🎯 QUEST STATS

**Buttons**
- "Edit Profile" (prominent, in top-right or below progress card)
- "← Back" or "Home" (nav)

**Profile Completion Copy**
- "You're ${percentage}% done!"
- "Just ${count} more fields to unlock personalized recommendations"
- "Add ${next_field} to complete your profile"

---

## Edit Profile Mode (Airbnb-Inspired)

### Layout Strategy

**Desktop (≥768px)**
- Two-column grid of editable cards
- Left column: About, Lifestyle
- Right column: Preferences, Optional fields
- Generous whitespace, minimal borders
- Save/Cancel buttons at bottom (sticky or floating)

**Mobile (<768px)**
- Single column stack
- Full-width cards
- Same cards, responsive touch interaction
- Inline modals for inputs (don't navigate away)

### Card Pattern (Airbnb-Style)

Each editable field follows this pattern:

```
┌──────────────────────────────────────┐
│ [Icon] Label                         │
│ Helper text or current value        │
│                                      │
│ [Input / Button / Dropdown]         │
│                                      │
│ [Validation message if needed]      │
│ [✓ Saved]                           │
└──────────────────────────────────────┘
```

**Key Airbnb patterns:**
- Flat design, no heavy borders
- Icon + label on top
- Input takes full width
- Validation inline, below input
- No mandatory `*` asterisk (just note in helper text)
- "Add" CTA for empty optional fields
- Single icon per card (e.g., 📸 for photo, 🏠 for location, etc.)

### Edit Profile Page Structure

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ← Back  [Page title: "Edit Profile"]              │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ABOUT YOU (Section Header)                         │
│  ───────────────────────────────────                │
│                                                     │
│  ┌────────────────┐  ┌────────────────┐            │
│  │ 📸 Photo       │  │ 👤 Legal Name  │            │
│  │ [Avatar + Add] │  │ [Text Input]   │            │
│  └────────────────┘  └────────────────┘            │
│                                                     │
│  ┌────────────────┐  ┌────────────────┐            │
│  │ ✍️  Preferred  │  │ 📝 About Me    │            │
│  │    Name        │  │ [Text Area]    │            │
│  │ [Text Input]   │  │ (160 char max) │            │
│  └────────────────┘  └────────────────┘            │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  MY LIFESTYLE (Section Header)                      │
│  ───────────────────────────────────                │
│                                                     │
│  ┌────────────────┐  ┌────────────────┐            │
│  │ 🏠 Where I     │  │ 🎓 Education   │            │
│  │    Live        │  │ [Text Input]   │            │
│  │ [Autocomplete] │  │                │            │
│  └────────────────┘  └────────────────┘            │
│                                                     │
│  ┌────────────────┐  ┌────────────────┐            │
│  │ 💼 My Work     │  │ 🎯 Quest Vibe  │            │
│  │ [Text Input]   │  │ [Pills/Select] │            │
│  │                │  │ [Chill, Social,│            │
│  │                │  │  Adventurous]  │            │
│  └────────────────┘  └────────────────┘            │
│                                                     │
│  ┌────────────────┐  ┌────────────────┐            │
│  │ 💰 Budget      │  │ 🚴 Transport   │            │
│  │    Comfort     │  │ [Checkboxes]   │            │
│  │ [Radio Buttons]│  │                │            │
│  └────────────────┘  └────────────────┘            │
│                                                     │
│  ┌────────────────┐  ┌────────────────┐            │
│  │ 🥗 Dietary     │  │                │            │
│  │    Prefs       │  │                │            │
│  │ [Pills/Text]   │  │                │            │
│  └────────────────┘  └────────────────┘            │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  MY PREFERENCES (Section Header)                    │
│  ───────────────────────────────────                │
│                                                     │
│  ┌────────────────┐  ┌────────────────┐            │
│  │ ♿ Accessibility│  │ ⏰ Time Pref   │            │
│  │    Needs       │  │ [Radio Buttons]│            │
│  │ [Checkboxes]   │  │                │            │
│  └────────────────┘  └────────────────┘            │
│                                                     │
│  ┌────────────────┐  ┌────────────────┐            │
│  │ ⭐ Favorite    │  │ 🔍 Hidden Gems │            │
│  │    Categories  │  │    Seeker      │            │
│  │ [Checkboxes]   │  │ [Toggle/Radio] │            │
│  └────────────────┘  └────────────────┘            │
│                                                     │
│  ┌────────────────┐  ┌────────────────┐            │
│  │ ⚡ Energy Level │  │ 🤝 Social      │            │
│  │ [Radio Buttons]│  │    Comfort     │            │
│  │                │  │ [Radio Buttons]│            │
│  └────────────────┘  └────────────────┘            │
│                                                     │
│  ┌────────────────┐  ┌────────────────┐            │
│  │ 🐢 Pace        │  │ 🗺️  Local      │            │
│  │ [Radio Buttons]│  │    Knowledge   │            │
│  │                │  │ [Radio Buttons]│            │
│  └────────────────┘  └────────────────┘            │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Cancel]  [Save Changes]                          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Interaction Pattern: Inline vs Modal

**Strategy: Inline-first (simpler, Airbnb-like)**

- Text inputs (name, intro, location, work): **Inline edit** (click card, edit in place, focus out = save)
- Multi-select (accessibility, categories, transport): **Inline with checkboxes** or **dropdown pill selector**
- Single-select (budget, vibe, energy level): **Inline with radio buttons** or **segmented control**
- Photo: **Inline modal** (click avatar → file picker → crop modal → confirm)

**Why inline is better for Airbnb feel:**
- No page navigation between fields
- Faster, snappier UX
- Matches Airbnb's "change one thing at a time" pattern
- Less jarring than separate modals per field

**Exception — Photo upload:**
- Opens a **lightweight modal** with:
  - "Change Photo" heading
  - File upload input
  - Image cropper (use `react-easy-crop` or similar)
  - Cancel / Save buttons
  - Shows preview before confirming

### Save/Cancel Behavior

**Validation Rules**
- **Real-time validation**: Show error message below input (red text, not blocking)
  - Legal name: required, 2–50 chars
  - Email: checked at sign-up, read-only in profile
  - About me: optional, max 160 chars, warn if >160
  - Location: optional, autocomplete from list of Canadian cities
  - Work: optional, free text
  - Budget comfort: required (default = moderate)
  - Dietary: optional, pill-based multi-select
  - All others: optional

**Save Behavior**
- **Single global "Save Changes" button** at bottom of page (sticky on mobile)
- Clicking Save:
  1. Validate all fields in real-time
  2. If any error: highlight errors, don't submit
  3. If valid: POST to `/api/profile/update` with full profile object
  4. Show toast: "Profile updated! ✓" (green, 3 sec)
  5. Redirect to `/profile` (View mode)
  6. On error: show toast with error message, stay on edit page

**Cancel Behavior**
- Discard unsaved changes
- Redirect to `/profile` (View mode)
- Show confirmation if user has unsaved edits: "Discard changes?"

**Unsaved State**
- **Optimistic UI**: fields update immediately on input (local state)
- **Save = persist to Firestore**
- If user navigates away without saving, show warning: "You have unsaved changes"

**Toast Notifications**
- Success: "✓ Profile updated" (green, 3s, auto-dismiss)
- Error: "⚠️ Failed to save. Please try again." (red, 5s, can dismiss)
- Warning on leave: "You have unsaved changes. Leave anyway?" (modal)

---

## Field List (Grouped by Section)

### ABOUT YOU

| Field | Type | Required | Input Type | Validation | Notes |
|-------|------|----------|------------|------------|-------|
| **Profile Photo** | Image | Optional | File upload + crop modal | Max 2MB, JPG/PNG | Avatar shown everywhere |
| **Legal Name** | String | Required | Text input (read-only if from Google) | 2–50 chars | Prefilled from Auth |
| **Preferred Name** | String | Optional | Text input | 1–30 chars | Shown publicly in future |
| **About Me / Intro** | Text | Optional | Text area | Max 160 chars | Short bio, "about you" vibe |
| **Email** | Email | Required | Read-only text | Auto-validated at sign-up | Verified status badge |

### MY LIFESTYLE

| Field | Type | Required | Input Type | Validation | Notes |
|-------|------|----------|------------|------------|-------|
| **Where I Live** | String | Optional | Autocomplete (cities) | Must match city list or allow free text | Toronto, Vancouver, Hamilton, etc. |
| **Where I Went to School** | String | Optional | Text input | Free text | University, college, high school |
| **My Work** | String | Optional | Text input | Free text | Job title + company name |
| **Quest Vibe** | Enum | Required | Radio/Pills (pick 1–2) | `chill`, `social`, `energetic`, `adventurous` | Primary + secondary vibe |
| **Budget Comfort** | Enum | Required | Radio buttons | `broke`, `moderate`, `bougie` | Affects quest recommendations |
| **Transportation** | Multi-select | Optional | Checkboxes | `walk`, `transit`, `drive`, `bike` | Default for quest planning |
| **Dietary Preferences** | Multi-select | Optional | Pills/text + checkboxes | Free text or preset: vegetarian, vegan, gluten-free, etc. | Affects venue recommendations |

### MY PREFERENCES

| Field | Type | Required | Input Type | Validation | Notes |
|-------|------|----------|------------|------------|-------|
| **Accessibility Needs** | Multi-select | Optional | Checkboxes | `step-free`, `quiet`, `parking`, `accessible washroom`, `wheelchair ramp` | Used to filter venues |
| **Time Preference** | Enum | Optional | Radio buttons | `spontaneous`, `planned`, `flexible` | Notification style |
| **Favorite Categories** | Multi-select | Optional | Checkboxes | `food`, `outdoors`, `nightlife`, `study spots`, `arts`, `free stuff`, `shopping`, `sports` | Used for quest generation |
| **Energy Level** | Enum | Optional | Radio buttons | `low`, `medium`, `high` | Affects pace of quests |
| **Social Comfort** | Enum | Optional | Radio buttons | `solo adventurer`, `small group (2-3)`, `group adventures (4+)` | Quest grouping |
| **Hidden Gems Seeker** | Enum | Optional | Radio/Toggle | `yes`, `no`, `sometimes` | Affects venue selection |
| **Pace Preference** | Enum | Optional | Radio buttons | `take it slow & explore`, `moderate pace`, `fast-paced action` | Affects quest time estimates |
| **Local Knowledge** | Enum | Optional | Radio buttons | `new to area`, `somewhat familiar`, `local expert` | Affects recommendation freshness |

### SideQuest Replacement Fields (8 New Fields)

These replace Airbnb's excluded fields:

1. **Quest Vibe** (Primary + Secondary)
   - Replaces: "Where I've always wanted to go"
   - **Rationale**: Core to SideQuest — users need to express adventure style
   - **Options**: Chill, Social, Energetic, Adventurous

2. **Budget Comfort**
   - Replaces: "Decade I was born" (privacy concern)
   - **Rationale**: Essential for quest filtering; removes age bias
   - **Options**: Broke, Moderate, Bougie

3. **Accessibility Needs**
   - Replaces: "Languages I speak" (less relevant for location-based quests)
   - **Rationale**: Critical for inclusive quest design; improves UX for users with mobility/sensory needs
   - **Options**: Step-free, Quiet, Parking, Accessible washroom, Wheelchair ramp

4. **Dietary Preferences**
   - Replaces: "Pets" (not relevant to quests)
   - **Rationale**: Important for food-based quests; common travel concern
   - **Options**: Vegetarian, Vegan, Gluten-free, Nut allergy, Kosher, Halal, etc.

5. **Transportation Default**
   - Replaces: "My most useless skill" (fun but not useful for quests)
   - **Rationale**: Affects quest planning; influences venue proximity and feasibility
   - **Options**: Walk, Transit, Drive, Bike

6. **Hidden Gems Seeker**
   - Replaces: "My favorite song in high school" (too personal, unrelated)
   - **Rationale**: Determines if user wants tourist attractions or lesser-known spots
   - **Options**: Yes (loves discovering), Sometimes, No (prefer popular spots)

7. **Pace Preference**
   - Replaces: "My obsession" (too open-ended, creepy vibe)
   - **Rationale**: Sets tempo for quests; improves experience for both slow explorers and fast-paced adventurers
   - **Options**: Take it slow & explore, Moderate pace, Fast-paced action

8. **Local Knowledge**
   - Replaces: "My biography title would be" (too poetic, unhelpful)
   - **Rationale**: Affects quest recommendations; fresh quests for tourists vs. locals
   - **Options**: New to area, Somewhat familiar, Local expert

---

## Firestore Schema

### Document Path
`users/{uid}`

### Full User Profile Document

```json
{
  "uid": "user123",
  "email": "jane@example.com",
  "emailVerified": true,
  
  // Auth-synced (from Google Auth)
  "displayName": "Jane Doe",
  "photoURL": "https://...",
  "authCreatedAt": "2024-01-10T14:32:00Z",
  
  // About You
  "profile": {
    "legalName": "Jane Doe",
    "preferredName": "Jane",
    "aboutMe": "Toronto explorer, food lover, always up for new adventures!",
    "photoURL": "https://...",  // Custom profile photo (optional, overwrites auth photo)
    "updatedAt": "2024-01-10T15:00:00Z"
  },
  
  // My Lifestyle
  "lifestyle": {
    "location": "Toronto, ON",
    "education": "McMaster University",
    "work": "Product Manager, Acme Corp",
    "questVibe": ["social", "energetic"],  // Array to allow primary + secondary
    "budgetComfort": "moderate",
    "transportation": ["walk", "transit"],
    "dietaryPreferences": ["vegetarian"],
    "updatedAt": "2024-01-10T15:00:00Z"
  },
  
  // My Preferences
  "preferences": {
    "accessibilityNeeds": ["step-free", "quiet"],
    "timePreference": "spontaneous",
    "favoriteCategories": ["food", "outdoors", "arts"],
    "energyLevel": "medium",
    "socialComfort": "group adventures (4+)",
    "hiddenGemsSeeker": "yes",
    "pacePref": "take it slow & explore",
    "localKnowledge": "new to area",
    "updatedAt": "2024-01-10T15:00:00Z"
  },
  
  // Stats (non-editable, auto-updated)
  "stats": {
    "questsCompleted": 12,
    "currentStreak": 4,  // days
    "favoritesCount": 23,
    "lastQuestDate": "2024-01-09T18:30:00Z",
    "profileCompletionPercentage": 75
  },
  
  // Auth metadata
  "createdAt": "2024-01-01T10:00:00Z",
  "lastUpdated": "2024-01-10T15:00:00Z"
}
```

### Field Types (TypeScript)

```typescript
interface UserProfile {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  photoURL?: string;
  authCreatedAt: Timestamp;

  profile: {
    legalName: string;
    preferredName: string;
    aboutMe?: string;
    photoURL?: string;
    updatedAt: Timestamp;
  };

  lifestyle: {
    location?: string;
    education?: string;
    work?: string;
    questVibe: ["chill" | "social" | "energetic" | "adventurous", ...]; // 1–2 items
    budgetComfort: "broke" | "moderate" | "bougie";
    transportation?: ("walk" | "transit" | "drive" | "bike")[];
    dietaryPreferences?: string[];
    updatedAt: Timestamp;
  };

  preferences: {
    accessibilityNeeds?: ("step-free" | "quiet" | "parking" | "accessible washroom" | "wheelchair ramp")[];
    timePreference?: "spontaneous" | "planned" | "flexible";
    favoriteCategories?: ("food" | "outdoors" | "nightlife" | "study spots" | "arts" | "free stuff" | "shopping" | "sports")[];
    energyLevel?: "low" | "medium" | "high";
    socialComfort?: "solo adventurer" | "small group (2-3)" | "group adventures (4+)";
    hiddenGemsSeeker?: "yes" | "sometimes" | "no";
    pacePref?: "take it slow & explore" | "moderate pace" | "fast-paced action";
    localKnowledge?: "new to area" | "somewhat familiar" | "local expert";
    updatedAt: Timestamp;
  };

  stats: {
    questsCompleted: number;
    currentStreak: number;
    favoritesCount: number;
    lastQuestDate?: Timestamp;
    profileCompletionPercentage: number;
  };

  createdAt: Timestamp;
  lastUpdated: Timestamp;
}
```

### Profile Completion Calculation

```typescript
function calculateProfileCompleteness(user: UserProfile): number {
  const requiredFields = {
    "profile.legalName": !!user.profile.legalName,
    "profile.photoURL": !!user.profile.photoURL,  // Optional but counts toward completion
    "profile.aboutMe": !!user.profile.aboutMe,
    "lifestyle.location": !!user.lifestyle.location,
    "lifestyle.questVibe": user.lifestyle.questVibe?.length > 0,
    "lifestyle.budgetComfort": !!user.lifestyle.budgetComfort,
    "preferences.favoriteCategories": user.preferences.favoriteCategories?.length > 0,
    "preferences.accessibilityNeeds": user.preferences.accessibilityNeeds?.length > 0 || true, // Optional
  };

  const completed = Object.values(requiredFields).filter(Boolean).length;
  const total = Object.keys(requiredFields).length;
  
  return Math.round((completed / total) * 100);
}
```

---

## Edge Cases

### Case 1: First-Time Profile (Mostly Empty)
**Scenario**: User just signed up with Google, no profile data yet.

**Behavior**:
- `/profile` View mode shows:
  - Avatar + name (from Google Auth)
  - "Complete your profile" card (50% done)
  - Empty state placeholders: "Add your intro", "Add where you live", etc.
  - "Edit Profile" button prominent
- User directed to `/profile/edit` on first login (via onboarding flow, optional)

**Firestore state**:
- Only `profile.legalName`, `profile.photoURL` (from Auth), and empty nested objects

### Case 2: User Signs In with Google (Auto-Prefill)
**Scenario**: Google Auth provides displayName and photoURL.

**Behavior**:
- **Prefill** `profile.legalName` + `profile.photoURL` from Auth
- **Read-only fields** in Edit mode:
  - Display name locked (✓ Verified via Google)
  - Email locked (✓ Verified via Google)
- User can override photo and set preferred name separately
- All other fields blank until user fills them in

**Firestore**:
- Sync with Firebase Auth on sign-in
- Store Auth metadata separately to track Google verification

### Case 3: User Deletes Photo / Clears a Field
**Scenario**: User wants to remove their profile photo or dietary preferences.

**Behavior**:
- Click "Remove" or "X" on photo → opens confirmation modal: "Remove profile photo?"
- For other multi-select fields (dietary, accessibility): uncheck all → field becomes "Not specified"
- Single-select fields (budget, vibe): require at least budget + vibe (prevent save if empty)
- Text fields: can be blank, shown as "Not specified"
- On save: set field to `null` or empty array in Firestore

**Validation**:
- Budget comfort + Quest vibe: **Cannot be blank** (required)
- All others: **Optional** (can be deleted)

### Case 4: Network Error During Save
**Scenario**: User clicks Save, but network fails.

**Behavior**:
- Show error toast: "⚠️ Failed to save. Please try again."
- Stay on `/profile/edit` page
- **Preserve local state** (user's edits don't disappear)
- Retry button in toast or user can click Save again
- Log error to console for debugging

### Case 5: Concurrent Edits (Mobile + Web)
**Scenario**: User edits profile on phone, then on desktop without refreshing phone.

**Behavior**:
- Firestore listener updates phone with latest data after desktop save
- Show toast: "Profile updated on another device. Refresh?" (optional)
- Refresh `/profile` view to sync

---

## Mobile Layout Considerations

### Responsive Breakpoints

**Mobile (< 640px)**
- Single column layout for all fields
- Full-width cards with padding 16px
- Smaller font sizes (16px base)
- Touch-friendly input sizes (min 44px height)
- Bottom sheet or modal for dropdowns (avoid select dropdowns)
- Save/Cancel buttons sticky at bottom (or full-width with 8px gap)

**Tablet (640px–1024px)**
- Two-column grid with 12px gap
- Slightly larger font sizes
- Keep card aspect ratio consistent

**Desktop (>1024px)**
- Full two-column grid as shown above
- Standard spacing and typography

### Mobile-Specific Patterns

**Photo Upload**
- Tap avatar → native file picker (mobile camera or library)
- Inline crop editor (lightweight, not full modal)
- Preview before saving

**Multi-Select Fields (Checkboxes)**
- Use bottom sheet or modal on mobile
- Show selected pills above input
- Easier to tap and scroll through options

**Text Input**
- Full keyboard on mobile (no placeholder, show label above input)
- Avoid horizontal scroll

**Buttons**
- Minimum 48px height on mobile
- Full width below form, or side-by-side if space allows
- Primary button (Save) blue, Secondary (Cancel) gray

---

## Nice-to-Have Features

### 1. Profile Completion Percentage Formula
```
Completeness % = (Completed fields / Total key fields) × 100

Key fields (8 total):
- Legal name ✓
- Profile photo (optional but weighted)
- About me ✓
- Where I live ✓
- Quest vibe ✓
- Budget comfort ✓
- Favorite categories ✓
- Accessibility needs (optional) ✓

Formula: 6/8 required + photo bonus = 75% baseline, up to 100% with photo
```

### 2. Quest Stats Section
- Non-editable, informational section at bottom of View mode
- Shows:
  - 🎯 Quests Completed: 12
  - 🔥 Current Streak: 4 days
  - ⭐ Favorites: 23
  - 🏆 Total XP: 1,250 (if gamification added)
- Updated automatically from Firestore `stats` object
- Could have card-based layout or inline stats row

### 3. Profile Verification Badges
- ✓ Email Verified (from Firebase Auth)
- ✓ Phone Number (future, optional)
- ✓ ID Verified (future, trust & safety)
- Shows as small badges next to fields

### 4. Last Updated Timestamp
- "Last updated Jan 10, 2024 at 3:45 PM"
- Helps user know when they last reviewed profile
- Appears below each section or in footer

### 5. Undo Recent Changes
- "Restore to previous version?" option
- Keep last 3 versions of profile in Firestore subcollection: `users/{uid}/profileHistory`
- Advanced feature, MVP can skip

---

## Implementation Roadmap

### Phase 1 (MVP)
- [ ] Profile View mode (read-only)
- [ ] Edit Profile mode (all fields above)
- [ ] Firestore schema setup
- [ ] API endpoint: `GET /api/profile/{uid}` and `POST /api/profile/update`
- [ ] Firebase Auth integration (photo + name)
- [ ] Save/Cancel with validation
- [ ] Toast notifications
- [ ] Mobile responsiveness (single column)

### Phase 2 (Polish)
- [ ] Profile completeness percentage
- [ ] Quest stats section
- [ ] Verification badges
- [ ] Better photo upload/crop modal
- [ ] Undo profile history
- [ ] Profile visit log (for future public profiles)

### Phase 3 (Future)
- [ ] Public profile viewing (other users)
- [ ] Profile sharing (link)
- [ ] Profile themes/customization
- [ ] Integration with quest recommendations (use preferences)

---

## Example Workflows

### Workflow 1: New User on Mobile
1. Sign up with Google → redirected to `/profile`
2. See mostly empty profile, "60% complete" card
3. Tap "Edit Profile"
4. Mobile single column shows 8 high-priority fields
5. Fill in: location, quest vibe, budget, favorite categories
6. Tap "Save Changes" → toast "✓ Profile saved"
7. Back to `/profile` View mode, now showing 85% complete

### Workflow 2: Existing User Updates Preferences on Desktop
1. Click avatar → `/profile` (View mode)
2. See full profile, all sections filled
3. Tap "Edit Profile"
4. Two-column grid, user scrolls to "My Preferences" section
5. Changes "Energy Level" from High → Medium
6. Unchecks "Food" from Favorite Categories, adds "Study spots"
7. Scrolls to bottom, clicks "Save Changes"
8. Firestore updates, toast confirms
9. Redirected to `/profile` View mode, shows updated fields

### Workflow 3: User Removes Photo
1. In Edit mode, hovers over avatar
2. "Change photo" or "Remove photo" option appears
3. Clicks "Remove photo"
4. Confirmation: "Delete profile photo?"
5. Confirms, photo cleared
6. Field shows "Add a photo" placeholder
7. Clicks Save, photo field removed from Firestore

---

## Accessibility Considerations

- All form fields labeled (not placeholder-only)
- Color contrast WCAG AA minimum
- Keyboard navigation (Tab through fields)
- Focus management after save (return to top or confirmation)
- Screen reader support for icons (aria-label)
- Required fields marked in label ("Legal name *") or helper text
- Error messages linked to input (aria-describedby)
- No time-based interactions (save doesn't auto-dismiss form)

---

## Success Metrics

- User profile completion rate (% of users >80% complete)
- Time to edit first profile field
- Bounce rate from Edit mode
- Returned to View mode successfully
- Profile data used in quest generation (A/B test with/without prefs)
