# SideQuest Setup Guide

Complete setup instructions for the SideQuest hackathon project.

## 🚀 Quick Start

### 1. Get API Keys

#### Google Maps API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials → API Key
5. Add to `backend/.env` as `GOOGLE_MAPS_API_KEY`

#### Ticketmaster API
1. Go to [Ticketmaster Developer Portal](https://developer.ticketmaster.com/)
2. Sign up and create an app
3. Copy your Consumer Key
4. Add to `backend/.env` as `TICKETMASTER_API_KEY`

#### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication → Google provider
4. Enable Firestore Database
5. Get config from Project Settings → Your apps → SDK setup
6. Add values to `frontend/.env.local`

### 2. Install Dependencies

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Configure Environment Variables

**Backend** (`backend/.env`):
```bash
GOOGLE_MAPS_API_KEY=your_actual_key_here
TICKETMASTER_API_KEY=your_actual_key_here
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=yourapp.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=yourapp.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python main.py
```
Backend runs at `http://localhost:8000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs at `http://localhost:3000`

## 📁 Project Structure

```
SideQuest/
├── backend/
│   ├── app/
│   │   ├── models.py           # Pydantic data models
│   │   ├── routes.py           # API endpoints
│   │   ├── quest_generator.py  # Quest generation logic
│   │   ├── google_places.py    # Google Places API
│   │   └── ticketmaster.py     # Ticketmaster API
│   ├── main.py                 # FastAPI app
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── app/                    # Next.js pages
│   ├── components/
│   │   ├── AuthButton.tsx      # Google OAuth login
│   │   └── QuestCard.tsx       # Quest display component
│   ├── lib/
│   │   ├── api.ts              # API client
│   │   ├── auth.ts             # Firebase auth
│   │   ├── firebase.ts         # Firebase config
│   │   ├── types.ts            # TypeScript types
│   │   └── useAuth.ts          # Auth hook
│   ├── package.json
│   └── .env.local
└── README.md
```

## 🔑 Key Features Implemented

### Backend
- ✅ FastAPI with CORS for Next.js
- ✅ Quest generation algorithm
- ✅ Google Places API integration
- ✅ Ticketmaster Events API integration
- ✅ RESTful API endpoints for quests, favorites
- ✅ Pydantic models for type safety

### Frontend
- ✅ Next.js 16 with App Router
- ✅ Firebase Authentication (Google OAuth)
- ✅ TypeScript type definitions
- ✅ Reusable components (QuestCard, AuthButton)
- ✅ Auth state management
- ✅ API client setup

## 🎯 Next Steps for Hackathon

1. **Firebase Firestore Integration**
   - Save user preferences
   - Store favorites
   - Log quest completions

2. **Map Implementation**
   - Add Google Maps to home page
   - Show quest pins on map
   - User location detection

3. **Quest Generation Polish**
   - Improve scoring algorithm
   - Add more quest templates
   - Distance calculations

4. **UI/UX**
   - Design home screen
   - Quest detail page
   - Filters modal
   - Onboarding flow

5. **Demo Data**
   - McMaster-specific fallback quests
   - Hamilton points of interest
   - Sample quest screenshots

## 🔧 Testing Endpoints

Once backend is running, test at `http://localhost:8000/docs`

**Generate Quests:**
```bash
POST /api/quests/generate
{
  "location": {"lat": 43.2597, "lng": -79.9191},
  "radius_km": 5,
  "preferences": {"budget": "broke", "mood": "chill"}
}
```

## 🐛 Common Issues

**Firebase not initialized**: Make sure all `NEXT_PUBLIC_FIREBASE_*` vars are set

**API key errors**: Verify keys are active and billing enabled (Google requires it)

**CORS errors**: Check `FRONTEND_URL` matches your frontend port

**Import errors**: Run `pip install -r requirements.txt` and `npm install`

## 📝 Team Workflow

- **Backend dev**: Focus on `backend/app/` files
- **Frontend dev**: Focus on `frontend/app/` and `frontend/components/`
- **Integration**: Test API calls and auth flow together
- **Demo prep**: Create 3-4 hardcoded quests as fallback

Good luck at DeltaHacks! 🚀
