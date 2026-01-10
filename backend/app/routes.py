from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime
from app.models import (
    Quest, Location, UserPreferences, Favorite, QuestCompletion, 
    Place, Event, NearbyPlacesRequest, NearbyEventsRequest, GenerateQuestsRequest
)
from app.quest_generator import QuestGenerator
from app.google_places import GooglePlacesAPI
from app.ticketmaster import TicketmasterAPI

router = APIRouter()
quest_gen = QuestGenerator()
places_api = GooglePlacesAPI()
events_api = TicketmasterAPI()

@router.post("/places/nearby", response_model=List[Place])
async def get_nearby_places(request: NearbyPlacesRequest):
    """
    Get nearby places (restaurants, cafes, parks, etc.)
    
    Args:
        request: Request containing location, radius, filters
    
    Returns:
        List of Place objects with details
    """
    try:
        radius_m = request.radius_km * 1000
        places = places_api.nearby_search(
            request.location, 
            radius=radius_m,
            place_type=request.place_type,
            keyword=request.keyword
        )
        return places
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching places: {str(e)}")

@router.post("/events/nearby", response_model=List[Event])
async def get_nearby_events(request: NearbyEventsRequest):
    """
    Get nearby events (concerts, sports, shows, etc.)
    
    Args:
        request: Request containing location, radius, date filters
    
    Returns:
        List of Event objects with details
    """
    try:
        events = events_api.search_events(
            request.location,
            radius=int(request.radius_km),
            start_date=request.start_date,
            end_date=request.end_date
        )
        return events
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching events: {str(e)}")

@router.post("/quests/generate", response_model=List[Quest])
async def generate_quests(request: GenerateQuestsRequest):
    """
    Generate personalized quests based on location and preferences
    
    Args:
        request: Request containing location, radius, categories, and preferences
    
    Returns:
        List of generated Quest objects
    """
    try:
        print(f"\n=== QUEST GENERATION REQUEST ===")
        print(f"Location: {request.location.lat}, {request.location.lng}")
        print(f"Radius: {request.radius_km} km ({request.radius_km * 1000} meters)")
        
        # Fetch nearby places
        radius_m = request.radius_km * 1000
        print(f"\nFetching places from Google Places API...")
        places = places_api.nearby_search(request.location, radius=radius_m)
        print(f"Found {len(places)} places")
        if places:
            for i, place in enumerate(places[:3], 1):
                print(f"  {i}. {place.name} - {place.category}")
        
        # Fetch nearby events
        print(f"\nFetching events from Ticketmaster API...")
        events = events_api.search_events(request.location, radius=int(request.radius_km))
        print(f"Found {len(events)} events")
        if events:
            for i, event in enumerate(events[:3], 1):
                print(f"  {i}. {event.name}")
        
        # Generate quests
        print(f"\nGenerating quests...")
        quests = quest_gen.generate_quests(
            places=places,
            events=events,
            user_location=request.location,
            preferences={**(request.preferences or {}), 'radius_km': request.radius_km}
        )
        print(f"Generated {len(quests)} quests")
        for i, quest in enumerate(quests, 1):
            dist = f"{quest.distance:.1f}km" if hasattr(quest, 'distance') and quest.distance else "unknown"
            print(f"  {i}. {quest.title} - {dist}")
        print(f"=== END QUEST GENERATION ===\n")
        
        return quests
    
    except Exception as e:
        import traceback
        print(f"Error generating quests: {str(e)}")
        print(traceback.format_exc())
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
