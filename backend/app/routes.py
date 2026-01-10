from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime
from app.models import Quest, Location, UserPreferences, Favorite, QuestCompletion
from app.quest_generator import QuestGenerator
from app.google_places import GooglePlacesAPI
from app.ticketmaster import TicketmasterAPI

router = APIRouter()
quest_gen = QuestGenerator()
places_api = GooglePlacesAPI()
events_api = TicketmasterAPI()

@router.post("/quests/generate", response_model=List[Quest])
async def generate_quests(
    location: Location,
    radius_km: float = 5.0,
    categories: Optional[List[str]] = None,
    preferences: Optional[dict] = None
):
    """
    Generate personalized quests based on location and preferences
    
    Args:
        location: User's current lat/lng
        radius_km: Search radius in kilometers
        categories: Filter by categories (food, events, outdoor, etc.)
        preferences: User preferences (budget, mood, etc.)
    
    Returns:
        List of generated Quest objects
    """
    try:
        # Fetch nearby places
        radius_m = radius_km * 1000
        places = places_api.nearby_search(location, radius=radius_m)
        
        # Fetch nearby events
        events = events_api.search_events(location, radius=int(radius_km))
        
        # Generate quests
        quests = quest_gen.generate_quests(
            places=places,
            events=events,
            user_location=location,
            preferences=preferences or {}
        )
        
        return quests
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating quests: {str(e)}")

@router.post("/favorites", response_model=dict)
async def add_favorite(favorite: Favorite):
    """Add a place, event, or quest to user favorites"""
    # TODO: Store in Firestore or database
    return {"message": "Favorite added", "favorite_id": favorite.item_id}

@router.get("/favorites/{user_id}", response_model=List[Favorite])
async def get_favorites(user_id: str):
    """Get all favorites for a user"""
    # TODO: Fetch from Firestore or database
    return []

@router.delete("/favorites/{user_id}/{item_id}")
async def remove_favorite(user_id: str, item_id: str):
    """Remove a favorite"""
    # TODO: Delete from Firestore or database
    return {"message": "Favorite removed"}

@router.post("/quests/complete", response_model=dict)
async def complete_quest(completion: QuestCompletion):
    """Mark a quest as completed"""
    # TODO: Store completion in Firestore or database
    xp_earned = 100  # Base XP
    return {
        "message": "Quest completed!",
        "xp_earned": xp_earned,
        "completion_id": f"{completion.user_id}_{completion.quest_id}"
    }

@router.get("/places/{place_id}")
async def get_place_details(place_id: str):
    """Get detailed information about a specific place"""
    details = places_api.get_place_details(place_id)
    if not details:
        raise HTTPException(status_code=404, detail="Place not found")
    return details
