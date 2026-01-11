import os
import json
import google.generativeai as genai
from typing import Dict, List, Optional
from dotenv import load_dotenv

load_dotenv()

# Configure the Gemini API
GOOGLE_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY") # Often reused or specific GEMINI_API_KEY
if not GOOGLE_API_KEY:
    # Try alternate env var
    GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY")

if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

class GeminiService:
    def __init__(self):
        self.model = None
        if GOOGLE_API_KEY:
            try:
                self.model = genai.GenerativeModel('gemini-1.5-flash')
            except Exception as e:
                print(f"Error initializing Gemini model: {e}")
        else:
            print("Warning: No Google API Key found for Gemini Service")

    def enrich_quest_item(self, name: str, description: str, context: str = "") -> Dict:
        """
        Enrich a quest item (event or place) with estimated cost, duration, and categories
        using Gemini.
        """
        if not self.model:
            return self._get_fallback_enrichment(name)

        prompt = f"""
        Analyze the following event or place and provide estimated details in JSON format.
        
        Item Name: {name}
        Description: {description}
        Context: {context}
        
        Return ONLY a raw JSON object (no markdown formatting) with the following integer/string fields:
        - estimated_cost: estimated cost per person in CAD (integer)
        - estimated_time: estimated duration in minutes (integer)
        - categories: list of 3-5 relevant categories (strings, lowercase)
        - difficulty: "low_energy", "medium_energy", or "high_energy"
        
        Example JSON:
        {{
            "estimated_cost": 25,
            "estimated_time": 90,
            "categories": ["food", "social", "nightlife"],
            "difficulty": "medium_energy"
        }}
        """

        try:
            response = self.model.generate_content(prompt)
            text = response.text
            # Clean up potential markdown code blocks
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]
            
            data = json.loads(text.strip())
            return data
        except Exception as e:
            print(f"Error calling Gemini for {name}: {e}")
            return self._get_fallback_enrichment(name)

    def _get_fallback_enrichment(self, name: str) -> Dict:
        """Return safe fallback defaults if Gemini fails"""
        return {
            "estimated_cost": 20,
            "estimated_time": 60,
            "categories": ["general", "leisure"],
            "difficulty": "low_energy"
        }

gemini_service = GeminiService()
