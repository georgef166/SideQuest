from typing import List, Optional
from datetime import datetime
import uuid
import math
from app.models import Quest, QuestStep, Place, Event, Location

class QuestGenerator:
    """
    Rule-based quest generator that combines places and events
    into themed mini-adventures
    """
    
    def __init__(self):
        self.user_location = None
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
            List of generated Quest objects sorted by distance
        """
        self.user_location = user_location
        quests = []
        
        # Generate different types of quests based on available data
        if places:
            quests.extend(self._generate_place_quests(places, preferences))
        
        if events:
            quests.extend(self._generate_event_quests(events, places, preferences))
        
        # If no quests generated from real data, return empty list
        # Let the frontend handle the "no quests found" case
        if not quests:
            print("WARNING: No quests could be generated from places/events data")
            print(f"  Places found: {len(places)}")
            print(f"  Events found: {len(events)}")
            return []
        
        # Calculate distances for all quests
        for quest in quests:
            quest.distance = self._calculate_quest_distance(quest)
        
        # Sort by distance (closest first)
        quests.sort(key=lambda q: q.distance if hasattr(q, 'distance') else float('inf'))
        
        # Filter quests within the specified radius range
        radius_km = preferences.get('radius_km')
        if radius_km:
            min_distance = max(0, radius_km - 10)  # At least 10km before target, or 0
            max_distance = radius_km
            quests = [q for q in quests if hasattr(q, 'distance') and q.distance and min_distance <= q.distance <= max_distance]
            print(f"Filtered to {len(quests)} quests between {min_distance} km and {max_distance} km")
        
        return quests  # Return all quests sorted by distance
    
    def _generate_place_quests(
        self, 
        places: List[Place], 
        preferences: dict
    ) -> List[Quest]:
        """Generate quests from places only"""
        quests = []
        
        if not places:
            return quests
        
        # Filter out boring/utility places
        filtered_places = self._filter_interesting_places(places)
        print(f"Generating quests from {len(filtered_places)} places (filtered from {len(places)})...")
        
        if not filtered_places:
            print("  No interesting places found after filtering")
            return quests
        
        # Categorize places
        cafes = [p for p in filtered_places if 'cafe' in p.category.lower() or 'coffee' in p.category.lower()]
        parks = [p for p in filtered_places if 'park' in p.category.lower() or 'outdoor' in p.category.lower()]
        restaurants = [p for p in filtered_places if 'restaurant' in p.category.lower() or 'food' in p.category.lower()]
        bars = [p for p in filtered_places if 'bar' in p.category.lower() or 'night_club' in p.category.lower()]
        shops = [p for p in filtered_places if 'store' in p.category.lower() or 'shop' in p.category.lower() or 'shopping' in p.category.lower()]
        
        print(f"  Found {len(cafes)} cafes, {len(parks)} parks, {len(restaurants)} restaurants, {len(bars)} bars, {len(shops)} shops")
        
        # Coffee + Walk quests (create multiple if we have enough cafes/parks)
        for i in range(min(len(cafes), len(parks), 5)):
            if i < len(cafes) and i < len(parks):
                quest = self._create_coffee_walk_quest(cafes[i], parks[i] if i < len(parks) else parks[0])
                quests.append(quest)
                print(f"  Created Coffee Walk quest {i+1}")
        
        # Food tour quests (create ALL possible combinations)
        if len(restaurants) >= 2:
            for i in range(0, len(restaurants) - 1):
                for j in range(i + 1, min(i + 4, len(restaurants))):
                    quest = self._create_food_tour_quest([restaurants[i], restaurants[j]])
                    quests.append(quest)
                    print(f"  Created Food Tour quest")
        
        # Budget food quests (create more combinations)
        cheap_eats = [p for p in filtered_places if p.price_level and p.price_level <= 2]
        if len(cheap_eats) >= 2:
            for i in range(0, len(cheap_eats) - 1):
                for j in range(i + 1, min(i + 3, len(cheap_eats))):
                    quest = self._create_budget_quest([cheap_eats[i], cheap_eats[j]])
                    quests.append(quest)
                    print(f"  Created Budget quest")
        
        # Shopping + Cafe quests (create ALL combinations)
        if len(shops) > 0 and len(cafes) > 0:
            for i in range(len(shops)):
                for j in range(len(cafes)):
                    quest = self._create_shopping_quest(shops[i], cafes[j])
                    quests.append(quest)
                    print(f"  Created Shopping quest")
        
        # Night out quests (create ALL combinations of bars + restaurants)
        if len(bars) > 0 and len(restaurants) > 0:
            for i in range(len(restaurants)):
                for j in range(len(bars)):
                    quest = self._create_night_out_quest(restaurants[i], bars[j])
                    quests.append(quest)
                    print(f"  Created Night Out quest")
        
        # Generic exploration quests (create many combinations)
        for i in range(0, len(filtered_places) - 2):
            if i + 2 < len(filtered_places):
                quest = self._create_exploration_quest(filtered_places[i:i+3])
                quests.append(quest)
                print(f"  Created Exploration quest")
        
        return quests
    
    def _filter_interesting_places(self, places: List[Place]) -> List[Place]:
        """Filter out boring utility places and keep only interesting venues"""
        
        # Strict exclusions - definitely not interesting for quests
        exclude_keywords = [
            'gas_station', 'parking', 'atm', 
            'car_wash', 'car_repair', 'storage', 'laundry', 'locksmith',
            'plumber', 'electrician', 'lawyer', 'insurance', 'real_estate',
            'dentist', 'doctor', 'hospital', 'pharmacy', 'veterinary',
            'funeral', 'cemetery',
            'post_office', 'courthouse', 'embassy',
        ]
        
        # Always include these - definitely interesting
        include_keywords = [
            'restaurant', 'cafe', 'bar', 'night_club', 'food', 'bakery',
            'meal_delivery', 'meal_takeaway', 'pizza',
            'museum', 'art_gallery', 'library', 'aquarium', 'zoo',
            'park', 'amusement_park', 'bowling_alley', 'movie_theater', 
            'stadium', 'casino', 'spa', 'gym', 'tourist_attraction',
            'shopping_mall', 'department_store', 'clothing_store', 
            'book_store', 'jewelry_store', 'shoe_store', 'beauty_salon',
        ]
        
        filtered = []
        for place in places:
            category_lower = place.category.lower()
            name_lower = place.name.lower()
            
            # Hard exclude - skip definitely boring places
            if any(bad in category_lower for bad in exclude_keywords):
                continue
            
            # Skip generic administrative/locality entries
            if category_lower in ['locality, political', 'political, locality']:
                continue
            
            # Skip pure "lodging" or "establishment" without other context
            if category_lower in ['lodging', 'establishment', 'point_of_interest, establishment']:
                continue
            
            # Always include if it has interesting keywords
            if any(good in category_lower for good in include_keywords):
                filtered.append(place)
                continue
            
            # Be more lenient - keep stores that aren't explicitly excluded
            if 'store' in category_lower or 'shop' in category_lower:
                # Exclude utility stores specifically
                if not any(skip in name_lower for skip in ['ups', 'fedex', 'postal', 'hardware', 'tire', 'auto']):
                    filtered.append(place)
                    continue
            
            # Keep anything with "point_of_interest" that hasn't been excluded yet
            if 'point_of_interest' in category_lower and len(category_lower.split(',')) > 1:
                filtered.append(place)
        
        return filtered
    
    def _generate_event_quests(
        self,
        events: List[Event],
        places: List[Place],
        preferences: dict
    ) -> List[Quest]:
        """Generate quests combining events with nearby places"""
        quests = []
        
        print(f"Generating event quests from {len(events)} events...")
        
        # Filter interesting places for events
        filtered_places = self._filter_interesting_places(places)
        
        # Create quests for ALL events
        for event in events:
            # Create standalone event quest
            quest = self._create_standalone_event_quest(event)
            quests.append(quest)
            print(f"  Created standalone event quest: {event.name}")
            
            # Find nearby restaurants/bars
            nearby_food = [p for p in filtered_places if 
                          'restaurant' in p.category.lower() or 
                          'bar' in p.category.lower() or
                          'cafe' in p.category.lower()]
            
            # Create event + food combinations
            for food_place in nearby_food:
                quest = self._create_event_quest(event, food_place)
                quests.append(quest)
                print(f"  Created event combo quest")
        
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
                    location=cafe.location or Location(lat=0, lng=0)
                ),
                QuestStep(
                    order=2,
                    type="place",
                    item_id=park.place_id,
                    name=park.name,
                    description="Enjoy a relaxing walk",
                    estimated_time=45,
                    location=park.location or Location(lat=0, lng=0)
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
                    location=place.location or Location(lat=0, lng=0)
                ) for i, place in enumerate(places)
            ],
            tags=["cheap", "student", "food"],
            best_time="evening",
            created_at=datetime.now()
        )
    
    def _create_food_tour_quest(self, places: List[Place]) -> Quest:
        """Create a food tour quest"""
        total_cost = sum([p.price_level or 2 for p in places]) * 15
        
        return Quest(
            quest_id=str(uuid.uuid4()),
            title=f"Food Tour: {places[0].name} & More",
            description=f"Sample the best local flavors",
            category="food",
            difficulty="low_energy",
            estimated_time=90,
            estimated_cost=float(total_cost),
            steps=[
                QuestStep(
                    order=i+1,
                    type="place",
                    item_id=place.place_id,
                    name=place.name,
                    description=f"Try the specialties at {place.name}",
                    estimated_time=45,
                    location=place.location or Location(lat=0, lng=0)
                ) for i, place in enumerate(places)
            ],
            tags=["food", "local", "dining"],
            best_time="lunch",
            created_at=datetime.now()
        )
    
    def _create_shopping_quest(self, shop: Place, cafe: Place) -> Quest:
        """Create a shopping + cafe break quest"""
        total_cost = ((shop.price_level or 2) + (cafe.price_level or 2)) * 12
        
        return Quest(
            quest_id=str(uuid.uuid4()),
            title=f"Shop & Relax at {shop.name}",
            description=f"Browse {shop.name}, then recharge at {cafe.name}",
            category="leisure",
            difficulty="low_energy",
            estimated_time=75,
            estimated_cost=float(total_cost),
            steps=[
                QuestStep(
                    order=1,
                    type="place",
                    item_id=shop.place_id,
                    name=shop.name,
                    description="Browse and shop",
                    estimated_time=45,
                    location=shop.location or Location(lat=0, lng=0)
                ),
                QuestStep(
                    order=2,
                    type="place",
                    item_id=cafe.place_id,
                    name=cafe.name,
                    description="Grab a coffee and relax",
                    estimated_time=30,
                    location=cafe.location or Location(lat=0, lng=0)
                )
            ],
            tags=["shopping", "coffee", "leisure"],
            best_time="afternoon",
            created_at=datetime.now()
        )
    
    def _create_night_out_quest(self, restaurant: Place, bar: Place) -> Quest:
        """Create a dinner + drinks quest"""
        total_cost = ((restaurant.price_level or 3) + (bar.price_level or 2)) * 20
        
        return Quest(
            quest_id=str(uuid.uuid4()),
            title=f"Night Out: {restaurant.name} & {bar.name}",
            description=f"Dinner at {restaurant.name}, drinks at {bar.name}",
            category="nightlife",
            difficulty="medium_energy",
            estimated_time=150,
            estimated_cost=float(total_cost),
            steps=[
                QuestStep(
                    order=1,
                    type="place",
                    item_id=restaurant.place_id,
                    name=restaurant.name,
                    description="Enjoy dinner",
                    estimated_time=75,
                    location=restaurant.location or Location(lat=0, lng=0)
                ),
                QuestStep(
                    order=2,
                    type="place",
                    item_id=bar.place_id,
                    name=bar.name,
                    description="Drinks and good vibes",
                    estimated_time=75,
                    location=bar.location or Location(lat=0, lng=0)
                )
            ],
            tags=["nightlife", "social", "dining", "drinks"],
            best_time="evening",
            created_at=datetime.now()
        )
    
    def _create_exploration_quest(self, places: List[Place]) -> Quest:
        """Create a generic exploration quest from any places"""
        total_cost = sum([p.price_level or 2 for p in places]) * 10
        
        return Quest(
            quest_id=str(uuid.uuid4()),
            title=f"Explore {places[0].name} Area",
            description=f"Discover interesting spots near {places[0].name}",
            category="exploration",
            difficulty="low_energy",
            estimated_time=120,
            estimated_cost=float(total_cost),
            steps=[
                QuestStep(
                    order=i+1,
                    type="place",
                    item_id=place.place_id,
                    name=place.name,
                    description=f"Visit {place.name}",
                    estimated_time=40,
                    location=place.location or Location(lat=0, lng=0)
                ) for i, place in enumerate(places)
            ],
            tags=["exploration", "local", "adventure"],
            best_time="afternoon",
            created_at=datetime.now()
        )
    
    def _create_standalone_event_quest(self, event: Event) -> Quest:
        """Create a standalone event quest"""
        return Quest(
            quest_id=str(uuid.uuid4()),
            title=event.name,
            description=f"Attend {event.name}" + (f" at {event.venue}" if event.venue else ""),
            category="event",
            difficulty="medium_energy",
            estimated_time=120,
            estimated_cost=30.0,
            steps=[
                QuestStep(
                    order=1,
                    type="event",
                    item_id=event.event_id,
                    name=event.name,
                    description=f"Enjoy the event",
                    estimated_time=120,
                    location=event.location or Location(lat=0, lng=0)
                )
            ],
            tags=["event", "entertainment", event.category.lower()],
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
                    location=food_place.location or Location(lat=0, lng=0)
                ),
                QuestStep(
                    order=2,
                    type="event",
                    item_id=event.event_id,
                    name=event.name,
                    description="Main event",
                    estimated_time=120,
                    location=event.location or Location(lat=0, lng=0)
                )
            ],
            tags=["events", "nightlife", "social"],
            best_time="evening",
            created_at=datetime.now()
        )
    
    def _calculate_quest_distance(self, quest: Quest) -> float:
        """
        Calculate distance from user to first step of quest using Haversine formula
        
        Returns:
            Distance in kilometers
        """
        if not quest.steps or not self.user_location:
            return float('inf')
        
        first_step = quest.steps[0]
        if not first_step.location:
            return float('inf')
        
        # Haversine formula
        lat1, lon1 = math.radians(self.user_location.lat), math.radians(self.user_location.lng)
        lat2, lon2 = math.radians(first_step.location.lat), math.radians(first_step.location.lng)
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        # Earth radius in kilometers
        radius = 6371
        
        return c * radius
    
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
