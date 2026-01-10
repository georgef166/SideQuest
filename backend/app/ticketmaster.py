import os
import requests
from typing import List, Optional
from datetime import datetime
from app.models import Event, Location

class TicketmasterAPI:
    """Integration with Ticketmaster Discovery API"""
    
    def __init__(self):
        self.api_key = os.getenv("TICKETMASTER_API_KEY")
        self.base_url = "https://app.ticketmaster.com/discovery/v2"
    
    def search_events(
        self,
        location: Location,
        radius: int = 25,  # km
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        size: int = 20
    ) -> List[Event]:
        """
        Search for events near a location
        
        Args:
            location: Lat/lng coordinates
            radius: Search radius in km
            start_date: Start date in format YYYY-MM-DDTHH:MM:SSZ
            end_date: End date in format YYYY-MM-DDTHH:MM:SSZ
            size: Number of results to return (max 200)
        
        Returns:
            List of Event objects
        """
        url = f"{self.base_url}/events.json"
        
        params = {
            "apikey": self.api_key,
            "latlong": f"{location.lat},{location.lng}",
            "radius": radius,
            "unit": "km",
            "size": min(size, 200),
            "sort": "date,asc"
        }
        
        if start_date:
            params["startDateTime"] = start_date
        if end_date:
            params["endDateTime"] = end_date
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            events = []
            embedded = data.get("_embedded", {})
            for event_data in embedded.get("events", []):
                event = self._parse_event(event_data, location)
                if event:
                    events.append(event)
            
            return events
        
        except requests.RequestException as e:
            print(f"Error fetching events: {e}")
            return []
    
    def _parse_event(self, data: dict, user_location: Location) -> Optional[Event]:
        """Parse Ticketmaster API result into Event model"""
        try:
            # Get venue info and location
            venue = None
            venue_location = None
            if data.get("_embedded", {}).get("venues"):
                venue_data = data["_embedded"]["venues"][0]
                venue = venue_data.get("name")
                
                # Get venue coordinates
                if venue_data.get("location"):
                    try:
                        lat = float(venue_data["location"].get("latitude"))
                        lng = float(venue_data["location"].get("longitude"))
                        venue_location = Location(lat=lat, lng=lng)
                    except (ValueError, TypeError):
                        pass
            
            # Get start time
            start_time = None
            if data.get("dates", {}).get("start", {}).get("dateTime"):
                start_time = datetime.fromisoformat(
                    data["dates"]["start"]["dateTime"].replace("Z", "+00:00")
                )
            
            # Get price range
            price_range = None
            if data.get("priceRanges"):
                price_range = {
                    "min": data["priceRanges"][0].get("min"),
                    "max": data["priceRanges"][0].get("max"),
                    "currency": data["priceRanges"][0].get("currency", "CAD")
                }
            
            return Event(
                event_id=data["id"],
                name=data["name"],
                category=data.get("classifications", [{}])[0].get("segment", {}).get("name", "Event"),
                venue=venue,
                start_time=start_time,
                price_range=price_range,
                url=data.get("url"),
                distance=None,
                location=venue_location
            )
        
        except (KeyError, ValueError) as e:
            print(f"Error parsing event: {e}")
            return None
