from typing import List, Optional
from datetime import datetime
import uuid
from app.models import Quest, QuestStep, Place, Event, Location

class QuestGenerator:
    """
    Rule-based quest generator that combines places and events
    into themed mini-adventures
    """
    
    def __init__(self):
        self.quest_templates = {
            "coffee_walk": {
                "title": "Coffee & Chill Walk",
                "description": "Grab a coffee and explore a nearby spot",
                "category": "chill",
                "difficulty": "low_energy",
                "tags": ["coffee", "outdoor", "relaxing"]
            },
            "date_night": {
                "title": "Classic Date Night",
                "description": "Dinner and a show for a memorable evening",
                "category": "romantic",
                "difficulty": "medium_energy",
                "tags": ["date", "food", "entertainment"]
            },
            "student_budget": {
                "title": "$20 Student Night",
                "description": "Budget-friendly fun near campus",
                "category": "budget",
                "difficulty": "low_energy",
                "tags": ["cheap", "student", "casual"]
            },
            "live_event": {
                "title": "Live Event + Drinks",
                "description": "Catch a show and grab drinks nearby",
                "category": "social",
                "difficulty": "medium_energy",
                "tags": ["nightlife", "events", "social"]
            }
        }
    
    def generate_quests(
        self,
        places: List[Place],
        events: List[Event],
        user_location: Location,
        preferences: dict
    ) -> List[Quest]:
        """
        Generate themed quests from available places and events
        
        Args:
            places: List of nearby places
            events: List of nearby events
            user_location: User's current location
            preferences: User preferences (budget, mood, categories)
        
        Returns:
            List of generated Quest objects
        """
        quests = []
        
        # If no places or events, generate fallback demo quests
        if not places and not events:
            return self._generate_fallback_quests(user_location)
        
        # Generate different types of quests based on available data
        if places:
            quests.extend(self._generate_place_quests(places, preferences))
        
        if events:
            quests.extend(self._generate_event_quests(events, places, preferences))
        
        # Score and sort quests
        scored_quests = self._score_quests(quests, preferences)
        
        return scored_quests[:10]  # Return top 10 quests
    
    def _generate_place_quests(
        self, 
        places: List[Place], 
        preferences: dict
    ) -> List[Quest]:
        """Generate quests from places only"""
        quests = []
        
        # Coffee + Walk quest
        cafes = [p for p in places if 'cafe' in p.category.lower() or 'coffee' in p.category.lower()]
        parks = [p for p in places if 'park' in p.category.lower() or 'outdoor' in p.category.lower()]
        
        if cafes and parks:
            quest = self._create_coffee_walk_quest(cafes[0], parks[0])
            quests.append(quest)
        
        # Budget food quest
        cheap_eats = [p for p in places if p.price_level and p.price_level <= 2]
        if len(cheap_eats) >= 2:
            quest = self._create_budget_quest(cheap_eats[:2])
            quests.append(quest)
        
        return quests
    
    def _generate_event_quests(
        self,
        events: List[Event],
        places: List[Place],
        preferences: dict
    ) -> List[Quest]:
        """Generate quests combining events with nearby places"""
        quests = []
        
        for event in events[:3]:  # Top 3 events
            # Find nearby restaurants/bars
            nearby_food = [p for p in places if 
                          ('restaurant' in p.category.lower() or 
                           'bar' in p.category.lower()) and
                          p.distance and p.distance < 1.0]  # Within 1km
            
            if nearby_food:
                quest = self._create_event_quest(event, nearby_food[0])
                quests.append(quest)
        
        return quests
    
    def _create_coffee_walk_quest(self, cafe: Place, park: Place) -> Quest:
        """Create a coffee + walk quest"""
        return Quest(
            quest_id=str(uuid.uuid4()),
            title="Coffee & Nature Walk",
            description=f"Start with coffee at {cafe.name}, then enjoy a walk at {park.name}",
            category="chill",
            difficulty="low_energy",
            estimated_time=60,
            estimated_cost=float(cafe.price_level or 2) * 5,
            steps=[
                QuestStep(
                    order=1,
                    type="place",
                    item_id=cafe.place_id,
                    name=cafe.name,
                    description="Grab your favorite coffee",
                    estimated_time=15,
                    location=Location(lat=0, lng=0)  # TODO: Add actual coords
                ),
                QuestStep(
                    order=2,
                    type="place",
                    item_id=park.place_id,
                    name=park.name,
                    description="Enjoy a relaxing walk",
                    estimated_time=45,
                    location=Location(lat=0, lng=0)
                )
            ],
            tags=["coffee", "outdoor", "relaxing", "walkable"],
            best_time="morning",
            created_at=datetime.now()
        )
    
    def _create_budget_quest(self, places: List[Place]) -> Quest:
        """Create a budget-friendly quest"""
        total_cost = sum([p.price_level or 1 for p in places]) * 8
        
        return Quest(
            quest_id=str(uuid.uuid4()),
            title="$20 Budget Night",
            description="Affordable eats and hangout spots",
            category="budget",
            difficulty="low_energy",
            estimated_time=90,
            estimated_cost=total_cost,
            steps=[
                QuestStep(
                    order=i+1,
                    type="place",
                    item_id=place.place_id,
                    name=place.name,
                    description=f"Stop {i+1}",
                    estimated_time=45,
                    location=Location(lat=0, lng=0)
                ) for i, place in enumerate(places)
            ],
            tags=["cheap", "student", "food"],
            best_time="evening",
            created_at=datetime.now()
        )
    
    def _create_event_quest(self, event: Event, food_place: Place) -> Quest:
        """Create an event-based quest"""
        return Quest(
            quest_id=str(uuid.uuid4()),
            title=f"{event.name} Night Out",
            description=f"Dinner at {food_place.name} before {event.name}",
            category="social",
            difficulty="medium_energy",
            estimated_time=180,
            estimated_cost=50.0,
            steps=[
                QuestStep(
                    order=1,
                    type="place",
                    item_id=food_place.place_id,
                    name=food_place.name,
                    description="Pre-event dinner",
                    estimated_time=60,
                    location=Location(lat=0, lng=0)
                ),
                QuestStep(
                    order=2,
                    type="event",
                    item_id=event.event_id,
                    name=event.name,
                    description="Main event",
                    estimated_time=120,
                    location=Location(lat=0, lng=0)
                )
            ],
            tags=["events", "nightlife", "social"],
            best_time="evening",
            created_at=datetime.now()
        )
    
    def _score_quests(self, quests: List[Quest], preferences: dict) -> List[Quest]:
        """Score and sort quests based on user preferences"""
        scores = []
        
        for quest in quests:
            s = 0.0
            
            # Budget match
            budget = preferences.get('budget', 'moderate')
            if budget == 'broke' and quest.estimated_cost < 25:
                s += 2.0
            elif budget == 'moderate' and 25 <= quest.estimated_cost < 60:
                s += 2.0
            elif budget == 'bougie' and quest.estimated_cost >= 60:
                s += 2.0
            
            # Mood match
            mood = preferences.get('mood', '')
            if mood in quest.tags:
                s += 1.5
            
            scores.append((quest, s))
        
        # Sort by score (descending)
        scores.sort(key=lambda x: x[1], reverse=True)
        return [q for q, _ in scores]
    
    def _generate_fallback_quests(self, user_location: Location) -> List[Quest]:
        """Generate hardcoded fallback quests for demo purposes"""
        fallback_quests = []
        
        # McMaster Campus Tour
        fallback_quests.append(Quest(
            quest_id=str(uuid.uuid4()),
            title="McMaster Campus Explorer",
            description="Discover the hidden gems of McMaster University campus",
            category="educational",
            difficulty="low_energy",
            estimated_time=90,
            estimated_cost=15.0,
            steps=[
                QuestStep(
                    order=1,
                    type="place",
                    item_id="mcmaster_library",
                    name="Mills Memorial Library",
                    description="Start at the iconic library building",
                    estimated_time=20,
                    location=Location(lat=43.2609, lng=-79.9192)
                ),
                QuestStep(
                    order=2,
                    type="place",
                    item_id="centro",
                    name="Centro @ McMaster Student Centre",
                    description="Grab a coffee and snack",
                    estimated_time=30,
                    location=Location(lat=43.2614, lng=-79.9184)
                ),
                QuestStep(
                    order=3,
                    type="place",
                    item_id="rock_garden",
                    name="Rock Garden",
                    description="Relax in the beautiful rock garden",
                    estimated_time=40,
                    location=Location(lat=43.2623, lng=-79.9168)
                )
            ],
            tags=["campus", "educational", "relaxing", "student"],
            best_time="afternoon",
            created_at=datetime.now()
        ))
        
        # Downtown Hamilton Adventure
        fallback_quests.append(Quest(
            quest_id=str(uuid.uuid4()),
            title="Downtown Hamilton Food Tour",
            description="Taste your way through Hamilton's best spots",
            category="food",
            difficulty="medium_energy",
            estimated_time=120,
            estimated_cost=45.0,
            steps=[
                QuestStep(
                    order=1,
                    type="place",
                    item_id="cafe_name",
                    name="Local Coffee Shop",
                    description="Start with a specialty coffee",
                    estimated_time=30,
                    location=Location(lat=43.2567, lng=-79.8692)
                ),
                QuestStep(
                    order=2,
                    type="place",
                    item_id="restaurant",
                    name="James Street Restaurant",
                    description="Lunch at a local favorite",
                    estimated_time=60,
                    location=Location(lat=43.2575, lng=-79.8685)
                ),
                QuestStep(
                    order=3,
                    type="place",
                    item_id="dessert",
                    name="Sweet Shop",
                    description="End with something sweet",
                    estimated_time=30,
                    location=Location(lat=43.2580, lng=-79.8670)
                )
            ],
            tags=["food", "downtown", "social", "moderate"],
            best_time="afternoon",
            created_at=datetime.now()
        ))
        
        # Waterfront Walk
        fallback_quests.append(Quest(
            quest_id=str(uuid.uuid4()),
            title="Hamilton Waterfront Sunset Walk",
            description="Enjoy a peaceful walk along the waterfront",
            category="outdoor",
            difficulty="low_energy",
            estimated_time=60,
            estimated_cost=10.0,
            steps=[
                QuestStep(
                    order=1,
                    type="place",
                    item_id="pier_4",
                    name="Pier 4 Park",
                    description="Start at the waterfront park",
                    estimated_time=20,
                    location=Location(lat=43.2700, lng=-79.8650)
                ),
                QuestStep(
                    order=2,
                    type="place",
                    item_id="trail",
                    name="Waterfront Trail",
                    description="Walk along the scenic trail",
                    estimated_time=30,
                    location=Location(lat=43.2710, lng=-79.8620)
                ),
                QuestStep(
                    order=3,
                    type="place",
                    item_id="bench",
                    name="Lookout Point",
                    description="Watch the sunset from the pier",
                    estimated_time=10,
                    location=Location(lat=43.2720, lng=-79.8600)
                )
            ],
            tags=["outdoor", "relaxing", "nature", "cheap"],
            best_time="evening",
            created_at=datetime.now()
        ))
        
        return fallback_quests
