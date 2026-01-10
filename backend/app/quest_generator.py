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
        # Simple scoring for now - can be enhanced
        def score(quest: Quest) -> float:
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
            
            return s
        
        return sorted(quests, key=score, reverse=True)
