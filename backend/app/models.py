from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserPreferences(BaseModel):
    budget: Optional[str] = "moderate"  # broke, moderate, bougie
    radius: Optional[float] = 5.0  # km
    categories: Optional[List[str]] = []
    mood: Optional[str] = "chill"
    accessibility_needs: Optional[List[str]] = []

class User(BaseModel):
    uid: str
    email: str
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    preferences: Optional[UserPreferences] = None
    created_at: datetime

class Location(BaseModel):
    lat: float
    lng: float

class Place(BaseModel):
    place_id: str
    name: str
    category: str
    address: Optional[str] = None
    rating: Optional[float] = None
    price_level: Optional[int] = None
    photo_url: Optional[str] = None
    distance: Optional[float] = None  # km from user
    opening_hours: Optional[dict] = None
    location: Optional[Location] = None  # lat/lng of the place

class Event(BaseModel):
    event_id: str
    name: str
    category: str
    venue: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    price_range: Optional[dict] = None
    url: Optional[str] = None
    distance: Optional[float] = None
    location: Optional[Location] = None  # venue lat/lng

class QuestStep(BaseModel):
    order: int
    type: str  # 'place' or 'event'
    item_id: str  # place_id or event_id
    name: str
    description: Optional[str] = None
    estimated_time: Optional[int] = None  # minutes
    location: Location

class Quest(BaseModel):
    quest_id: str
    title: str
    description: str
    category: str
    difficulty: str  # low_energy, medium_energy, high_energy
    estimated_time: int  # total minutes
    estimated_cost: float  # total CAD
    steps: List[QuestStep]
    tags: List[str]
    best_time: Optional[str] = None  # morning, afternoon, evening, night
    distance: Optional[float] = None  # km from user location
    created_at: datetime

class Favorite(BaseModel):
    user_id: str
    item_id: str
    item_type: str  # 'place', 'event', or 'quest'
    notes: Optional[str] = None
    added_at: datetime

class QuestCompletion(BaseModel):
    user_id: str
    quest_id: str
    completed_at: datetime
    rating: Optional[int] = None  # 1-5
    feedback: Optional[str] = None

class NearbyPlacesRequest(BaseModel):
    location: Location
    radius_km: float = 5.0
    place_type: Optional[str] = None
    keyword: Optional[str] = None

class NearbyEventsRequest(BaseModel):
    location: Location
    radius_km: float = 25.0
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class GenerateQuestsRequest(BaseModel):
    location: Location
    radius_km: float = 50.0
    categories: Optional[List[str]] = None
    preferences: Optional[dict] = None

class FriendRequest(BaseModel):
    request_id: Optional[str] = None
    sender_id: str
    receiver_email: str
    status: str = "pending"  # pending, accepted, rejected
    created_at: Optional[datetime] = None

class Friend(BaseModel):
    user_id: str
    friend_id: str
    friend_email: str
    friend_name: Optional[str] = None
    friend_photo: Optional[str] = None
    added_at: datetime

class Message(BaseModel):
    message_id: Optional[str] = None
    sender_id: str
    receiver_id: str
    content: str
    timestamp: Optional[datetime] = None
    read: bool = False

class QuestInvite(BaseModel):
    invite_id: Optional[str] = None
    sender_id: str
    receiver_id: str
    quest_id: str
    status: str = "pending"  # pending, accepted, rejected
    created_at: Optional[datetime] = None
