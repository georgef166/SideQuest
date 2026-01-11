"""
Google Places Reviews Service
Fetches place details and reviews from Google Places API
"""

import os
import logging
import requests
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

class GooglePlacesReviewsService:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_MAPS_API_KEY")
        if not self.api_key:
            logger.warning("GOOGLE_MAPS_API_KEY not found in environment variables")
        
        # Using Places API (New) - Text Search and Place Details
        self.text_search_url = "https://places.googleapis.com/v1/places:searchText"
        self.place_details_url = "https://places.googleapis.com/v1/places"
    
    def get_place_id_by_coordinates(self, lat: float, lng: float) -> Optional[str]:
        """
        Find place ID using nearby search based on coordinates
        """
        try:
            headers = {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": self.api_key,
                "X-Goog-FieldMask": "places.id,places.displayName"
            }
            
            payload = {
                "locationBias": {
                    "circle": {
                        "center": {
                            "latitude": lat,
                            "longitude": lng
                        },
                        "radius": 50.0  # 50 meters radius
                    }
                }
            }
            
            response = requests.post(self.text_search_url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            if data.get("places") and len(data["places"]) > 0:
                place_id = data["places"][0].get("id")
                logger.info(f"Found place ID: {place_id} for coordinates ({lat}, {lng})")
                return place_id
            
            logger.warning(f"No place found for coordinates ({lat}, {lng})")
            return None
            
        except Exception as e:
            logger.error(f"Error finding place ID: {str(e)}")
            return None
    
    def get_place_reviews(self, lat: float, lng: float) -> Dict:
        """
        Get place details including reviews for a location
        Returns structured review data
        """
        try:
            # First, get the place ID
            place_id = self.get_place_id_by_coordinates(lat, lng)
            
            if not place_id:
                return self._get_fallback_data()
            
            # Fetch place details with reviews
            headers = {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": self.api_key,
                "X-Goog-FieldMask": "displayName,rating,userRatingCount,reviews"
            }
            
            url = f"{self.place_details_url}/{place_id}"
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            # Extract and structure the data
            reviews_data = {
                "place_name": data.get("displayName", {}).get("text", "Unknown Place"),
                "rating": data.get("rating", 0),
                "total_reviews": data.get("userRatingCount", 0),
                "reviews": []
            }
            
            # Process reviews
            raw_reviews = data.get("reviews", [])
            for review in raw_reviews[:5]:  # Limit to 5 most recent reviews
                reviews_data["reviews"].append({
                    "author_name": review.get("authorAttribution", {}).get("displayName", "Anonymous"),
                    "rating": review.get("rating", 0),
                    "text": review.get("text", {}).get("text", ""),
                    "relative_time": review.get("relativePublishTimeDescription", "Recently"),
                    "author_photo": review.get("authorAttribution", {}).get("photoUri", "")
                })
            
            logger.info(f"Successfully fetched {len(reviews_data['reviews'])} reviews for place {place_id}")
            return reviews_data
            
        except Exception as e:
            logger.error(f"Error fetching place reviews: {str(e)}")
            return self._get_fallback_data()
    
    def _get_fallback_data(self) -> Dict:
        """
        Return fallback data when API fails
        """
        return {
            "place_name": "Location",
            "rating": 4.0,
            "total_reviews": 0,
            "reviews": []
        }
