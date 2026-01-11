import os
import requests
from typing import List, Optional
from app.models import Place, Location

class GooglePlacesAPI:
    """Integration with Google Places API"""
    
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_MAPS_API_KEY")
        self.base_url = "https://maps.googleapis.com/maps/api/place"
    
    def nearby_search(self, lat: float, lng: float, radius: float, place_type: str = None, keyword: str = None) -> List[Place]:
        """
        Search for nearby places using Google Places API
        
        Args:
            lat: Latitude
            lng: Longitude
            radius: Search radius in kilometers
            place_type: Type of place to search for
            keyword: Keyword to search for
            
        Returns:
            List of Place objects
        """
        if not self.api_key:
            print("ERROR: GOOGLE_MAPS_API_KEY not found in environment variables!")
            return []
            
        url = f"{self.base_url}/nearbysearch/json"
        
        params = {
            "location": f"{lat},{lng}",
            "radius": min(radius * 1000, 50000),  # Convert km to meters
            "key": self.api_key
        }
        
        if place_type:
            params["type"] = place_type
        if keyword:
            params["keyword"] = keyword
        
        print(f"Calling Google Places API: {url}")
        print(f"  Location: {params['location']}")
        print(f"  Radius: {params['radius']} meters")
        
        places = []
        max_pages = 3  # Fetch up to 3 pages (60 results total)
        page_count = 0
        next_page_token = None
        
        try:
            while page_count < max_pages:
                # Add page token if we have one
                if next_page_token:
                    params['pagetoken'] = next_page_token
                    # Google requires a short delay before using page token
                    import time
                    time.sleep(2)
                
                response = requests.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                
                print(f"Google Places API Response Status (page {page_count + 1}): {data.get('status')}")
                if data.get('status') != 'OK' and data.get('status') != 'ZERO_RESULTS':
                    print(f"Google Places API Error: {data.get('error_message', 'Unknown error')}")
                    print(f"Full response: {data}")
                    break
                
                # Parse results from this page
                for result in data.get("results", []):
                    place = self._parse_place(result)
                    if place:
                        places.append(place)
                
                # Check if there's a next page
                next_page_token = data.get('next_page_token')
                page_count += 1
                
                if not next_page_token:
                    print(f"  No more pages available (fetched {page_count} pages)")
                    break
            
            print(f"Total places fetched: {len(places)} from {page_count} pages")
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
