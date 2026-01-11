from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime
from app.models import (
    Place, Event, NearbyPlacesRequest, NearbyEventsRequest, GenerateQuestsRequest, Quest, Favorite, QuestCompletion,
    FriendRequest, Friend, Message, QuestInvite
)
from app.quest_generator import QuestGenerator
from app.google_places import GooglePlacesAPI
from app.ticketmaster import TicketmasterAPI
from app.email_service import EmailService
from app.email_service import EmailService

router = APIRouter()
quest_gen = QuestGenerator()
places_api = GooglePlacesAPI()
events_api = TicketmasterAPI()
email_service = EmailService()

@router.post("/places/nearby", response_model=List[Place])
async def get_nearby_places(request: NearbyPlacesRequest):
    """Get nearby places using Google Places API"""
    return places_api.nearby_search(
        request.latitude,
        request.longitude,
        request.radius,
        request.type
    )

@router.post("/events/nearby", response_model=List[Event])
async def get_nearby_events(request: NearbyEventsRequest):
    """Get nearby events using Ticketmaster API"""
    return events_api.search_events(
        request.latitude,
        request.longitude,
        request.radius,
        request.start_date,
        request.end_date
    )

@router.post("/quests/generate", response_model=List[Quest])
async def generate_quests(request: GenerateQuestsRequest):
    """Generate personalized quests based on user preferences"""
    # Fetch nearby places
    places = places_api.nearby_search(
        request.location.lat,
        request.location.lng,
        request.radius_km
    )
    
    # Fetch nearby events
    events = events_api.search_events(
        request.location.lat,
        request.location.lng,
        request.radius_km
    )
    
    # Generate quests
    quests = quest_gen.generate_quests(
        places=places,
        events=events,
        user_location=request.location,
        preferences={
            "categories": request.categories,
            "radius_km": request.radius_km
        }
    )
    
    return quests

# In-memory storage for favorites and completions
favorites_db: List[Favorite] = []
completions_db: List[QuestCompletion] = []

@router.post("/favorites/add")
async def add_favorite(favorite: Favorite):
    """Add a quest or place to favorites"""
    # Check if already favorited
    existing = next(
        (f for f in favorites_db if f.user_id == favorite.user_id and f.item_id == favorite.item_id),
        None
    )
    if existing:
        raise HTTPException(status_code=400, detail="Item already in favorites")
    
    favorites_db.append(favorite)
    return {"message": "Added to favorites", "favorite": favorite}

@router.get("/favorites/{user_id}", response_model=List[Favorite])
async def get_favorites(user_id: str):
    """Get all favorites for a user"""
    return [f for f in favorites_db if f.user_id == user_id]

@router.delete("/favorites/{user_id}/{item_id}")
async def remove_favorite(user_id: str, item_id: str):
    """Remove an item from favorites"""
    global favorites_db
    initial_length = len(favorites_db)
    favorites_db = [f for f in favorites_db if not (f.user_id == user_id and f.item_id == item_id)]
    
    if len(favorites_db) == initial_length:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    return {"message": "Removed from favorites"}

@router.post("/quests/complete")
async def complete_quest(completion: QuestCompletion):
    """Mark a quest as completed"""
    completions_db.append(completion)
    
    # Calculate XP earned (base 100 + rating bonus)
    xp_earned = 100
    if completion.rating:
        xp_earned += completion.rating * 20
    
    return {
        "message": "Quest completed!",
        "xp_earned": xp_earned,
        "completion": completion
    }

@router.get("/quests/completions/{user_id}", response_model=List[QuestCompletion])
async def get_completions(user_id: str):
    """Get all completed quests for a user"""
    return [c for c in completions_db if c.user_id == user_id]

# Friends System
import uuid

friends_db: List[Friend] = []
friend_requests_db: List[FriendRequest] = []
messages_db: List[Message] = []
quest_invites_db: List[QuestInvite] = []

@router.post("/friends/request", response_model=FriendRequest)
async def send_friend_request(request: FriendRequest):
    """Send a friend request"""
    # Auto-accept for demo purposes
    request.request_id = str(uuid.uuid4())
    request.created_at = datetime.now()
    friend_requests_db.append(request)
    
    # Auto-create friendship
    friend = Friend(
        user_id=request.sender_id,
        friend_id=request.receiver_id,
        friend_name=request.receiver_email,
        friend_email=request.receiver_email,
        created_at=datetime.now()
    )
    friends_db.append(friend)
    
    # Send email notification
    try:
        email_service.send_friend_request_email(
            to_email=request.receiver_email,
            sender_name=request.sender_name
        )
    except Exception as e:
        logger.warning(f"Failed to send friend request email: {str(e)}")
    
    return request

@router.get("/friends/{user_id}", response_model=List[Friend])
async def get_friends(user_id: str):
    """Get all friends for a user"""
    return [f for f in friends_db if f.user_id == user_id]

@router.post("/messages/send", response_model=Message)
async def send_message(message: Message):
    """Send a direct message to a friend"""
    message.message_id = str(uuid.uuid4())
    message.timestamp = datetime.now()
    messages_db.append(message)
    return message

@router.get("/messages/{user_id}/{friend_id}", response_model=List[Message])
async def get_messages(user_id: str, friend_id: str):
    """Get message history between two users"""
    return [
        m for m in messages_db 
        if (m.sender_id == user_id and m.receiver_id == friend_id) or 
           (m.sender_id == friend_id and m.receiver_id == user_id)
    ]

@router.post("/quests/invite", response_model=QuestInvite)
async def invite_friend(invite: QuestInvite):
    """Invite a friend to a quest"""
    invite.invite_id = str(uuid.uuid4())
    invite.created_at = datetime.now()
    quest_invites_db.append(invite)
    return invite


