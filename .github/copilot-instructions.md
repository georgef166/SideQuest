# SideQuest - AI Coding Agent Instructions

## Project Overview
SideQuest is a location-aware adventure generator that creates personalized "quests" by combining nearby places (via Google Places API) and events (via Ticketmaster API). Users discover curated experiences based on their location, budget, and mood preferences.

**Architecture**: Decoupled Next.js frontend + FastAPI backend with Firebase for auth/data persistence.

## Key Architectural Patterns

### Backend (FastAPI + Python)
- **Main entry**: `backend/main.py` - runs uvicorn with auto-reload on port 8000
- **API routes**: `backend/app/routes.py` - all endpoints prefixed with `/api`
- **Models**: `backend/app/models.py` - Pydantic models for request/response validation
- **Quest generation**: `backend/app/quest_generator.py` - rule-based algorithm combining places + events into themed quests
- **External APIs**: Separate modules `google_places.py` and `ticketmaster.py` for third-party integrations

**Data flow**: Route handlers → External API clients → Quest generator → Pydantic models → JSON response

### Frontend (Next.js 16 + React 19)
- **App Router**: Uses Next.js 16 app directory structure (`frontend/app/`)
- **API client**: `frontend/lib/api.ts` - centralized `ApiClient` class with typed methods
- **Firebase auth**: `frontend/lib/firebase.ts` initializes Firebase once, exports `auth`, `db`, `googleProvider`
- **Auth hook**: `frontend/lib/useAuth.ts` - custom hook managing auth state
- **Components**: Reusable React components in `frontend/components/`

**Pattern**: All API calls use the singleton `apiClient` instance; all auth interactions use the `useAuth()` hook.

## Development Workflows

### Running the application
**Two terminals required** - backend and frontend run independently:

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate  # Create venv first if needed: python -m venv venv
python main.py           # Runs on localhost:8000 with auto-reload

# Terminal 2 - Frontend  
cd frontend
npm run dev              # Runs on localhost:3000
```

**Docker alternative**: `docker-compose up` runs both services (see `docker-compose.yml`)

### Testing API endpoints
- **Interactive docs**: Visit `http://localhost:8000/docs` for Swagger UI
- **Direct testing**: Use curl or Postman against `http://localhost:8000/api/*`
- **Example**: `curl -X POST http://localhost:8000/api/places/nearby -H "Content-Type: application/json" -d '{"location": {"lat": 43.26, "lng": -79.92}, "radius_km": 5}'`

### Environment setup (CRITICAL)
**Backend** requires `backend/.env`:
```bash
GOOGLE_MAPS_API_KEY=your_key_here
TICKETMASTER_API_KEY=your_key_here
FRONTEND_URL=http://localhost:3000
```

**Frontend** requires `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# (See SETUP.md for full Firebase config)
```

Missing API keys will cause silent failures in external API integrations.

## Project-Specific Conventions

### Backend patterns
- **Models first**: Always define Pydantic models in `models.py` before implementing routes
- **Error handling**: Raise `HTTPException` with descriptive messages; don't return error dicts
- **API client pattern**: External API classes (GooglePlacesAPI, TicketmasterAPI) are instantiated once at module level in `routes.py`
- **Distance units**: Google Places uses meters, Ticketmaster uses km - convert explicitly in route handlers

### Frontend patterns
- **Client components**: Mark with `'use client'` directive - this project uses interactive components
- **Firebase initialization**: Import from `lib/firebase.ts`, never re-initialize
- **Auth state**: Use `const { user, loading } = useAuth()` - always check `loading` before rendering auth-dependent UI
- **API calls**: Use `apiClient.post<ResponseType>('/api/endpoint', data)` with TypeScript generics

### Quest generation logic
The `QuestGenerator` class in `backend/app/quest_generator.py` uses **template-based generation**:
1. Filters places/events by category (cafes, parks, cheap eats, etc.)
2. Matches to quest templates (`coffee_walk`, `date_night`, `student_budget`, etc.)
3. Creates multi-step quests combining 2-3 locations
4. Scores based on user preferences (budget, mood, categories)
5. Returns top 10 sorted quests

**To add quest types**: Add template to `self.quest_templates` dict, implement `_create_*_quest()` method, call from `_generate_*_quests()`

## Common Tasks

### Adding a new API endpoint
1. Define request/response models in `backend/app/models.py`
2. Add route handler in `backend/app/routes.py` with `@router.post()` or `@router.get()`
3. Use `response_model=YourModel` parameter for automatic serialization
4. Update frontend API client calls in relevant component/page

### Adding a new quest type
1. Add template to `QuestGenerator.quest_templates` dict
2. Create filter logic to find matching places/events
3. Implement `_create_your_quest_name_quest()` method
4. Call from `_generate_place_quests()` or `_generate_event_quests()`

### Integrating new external API
1. Create new module `backend/app/your_service.py`
2. Follow pattern from `google_places.py`: class with `__init__()` loading API key from env
3. Parse API responses into existing Pydantic models (`Place`, `Event`)
4. Instantiate client in `routes.py` and call from route handlers

## External Dependencies

- **Google Places API**: Requires Maps JavaScript API, Places API, Geocoding API enabled
- **Ticketmaster API**: Discovery API for events - rate limited to 5000 calls/day
- **Firebase**: Authentication (Google provider) + Firestore for user data/favorites/completions

## Important Files Reference

- `FEATURES.md` - comprehensive feature checklist (MVP vs stretch goals)
- `SETUP.md` - detailed API key setup and environment configuration
- `docker-compose.yml` - containerized deployment configuration
- `backend/app/routes.py` - all API endpoints (source of truth for backend capabilities)
- `frontend/lib/types.ts` - TypeScript type definitions matching backend models
