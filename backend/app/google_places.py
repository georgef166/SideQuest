import os
import requests
from typing import List, Optional
from app.models import Place, Location

class GooglePlacesAPI:
    """Integration with Google Places API"""
    
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_MAPS_API_KEY")
        self.base_url = "https://maps.googleapis.com/maps/api/place"
    
    def nearby_search(
        self,
        location: Location,
        radius: float = 5000,  # meters
        place_type: Optional[str] = None,
        keyword: Optional[str] = None
    ) -> List[Place]:
        """
        Search for places near a location
        
        Args:
            location: Lat/lng coordinates
            radius: Search radius in meters (max 50000)
            place_type: Type of place (restaurant, cafe, park, etc.)
            keyword: Search keyword
        
        Returns:
            List of Place objects
        """
        if not self.api_key:
            print("ERROR: GOOGLE_MAPS_API_KEY not found in environment variables!")
            return []
            
        url = f"{self.base_url}/nearbysearch/json"
        
        params = {
            "location": f"{location.lat},{location.lng}",
            "radius": min(radius, 50000),
            "key": self.api_key
        }
        
        if place_type:
            params["type"] = place_type
        if keyword:
            params["keyword"] = keyword
        
        print(f"Calling Google Places API: {url}")
        print(f"  Location: {params['location']}")
        print(f"  Radius: {params['radius']} meters")
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            print(f"Google Places API Response Status: {data.get('status')}")
            if data.get('status') != 'OK':
                print(f"Google Places API Error: {data.get('error_message', 'Unknown error')}")
                print(f"Full response: {data}")
                return []
            
            places = []
            for result in data.get("results", []):  # Get all results
                place = self._parse_place(result)
                if place:
                    places.append(place)
            
            return places
        
        except requests.RequestException as e:
            print(f"Error fetching places: {e}")
            return []
    
    def _parse_place(self, result: dict) -> Optional[Place]:
        """Parse Google Places API result into Place model"""
        try:
            photo_url = None
            if result.get("photos"):
                photo_ref = result["photos"][0].get("photo_reference")
                if photo_ref:
                    photo_url = f"{self.base_url}/photo?maxwidth=400&photoreference={photo_ref}&key={self.api_key}"
            
            # Get location from geometry
            place_location = None
            if result.get("geometry") and result["geometry"].get("location"):
                loc = result["geometry"]["location"]
                place_location = Location(lat=loc["lat"], lng=loc["lng"])
            
            return Place(
                place_id=result["place_id"],
                name=result["name"],
                category=", ".join(result.get("types", [])),
                address=result.get("vicinity"),
                rating=result.get("rating"),
                price_level=result.get("price_level"),
                photo_url=photo_url,
                distance=None,  # Calculate separately if needed
                location=place_location
            )
        except KeyError as e:
            print(f"Error parsing place: {e}")
            return None
    
    def get_place_details(self, place_id: str) -> Optional[dict]:
        """Get detailed information about a specific place"""
        url = f"{self.base_url}/details/json"
        params = {
            "place_id": place_id,
            "fields": "name,rating,formatted_phone_number,opening_hours,website,price_level,photos",
            "key": self.api_key
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            return response.json().get("result")
        except requests.RequestException as e:
            print(f"Error fetching place details: {e}")
            return None
