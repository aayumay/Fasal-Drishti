import os
import httpx
from typing import List, Dict, Any

MARKET_API_KEY = os.environ.get("MARKET_API_KEY", "")
DATASET_ID = "9ef84268-d588-465a-a308-a864a43d0070"
BASE_URL = "https://api.data.gov.in/resource"

async def fetch_mandi_prices(state: str = None, commodity: str = None) -> List[Dict[str, Any]]:
    """
    Fetch live Mandi prices from data.gov.in dynamically using filters.
    """
    if not MARKET_API_KEY:
        # Graceful fallback if no API key is provided
        return [
            {"crop": commodity or "Wheat", "price": "₹2,300/q", "trend": "stable", "change": "₹0", "mandi": "Mock Mandi"}
        ]
        
    url = f"{BASE_URL}/{DATASET_ID}"
    
    params = {
        "api-key": MARKET_API_KEY,
        "format": "json",
        "limit": 10
    }
    
    if state:
        params["filters[state.keyword]"] = state
    if commodity:
        params["filters[commodity]"] = commodity

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            records = data.get("records", [])
            formatted_prices = []
            
            for record in records:
                formatted_prices.append({
                    "crop": record.get("commodity", "Unknown").capitalize(),
                    "price": f"₹{record.get('modal_price', 0)}/q",
                    "trend": "stable",
                    "change": "₹0",
                    "mandi": record.get("market", "Unknown").capitalize(),
                    "date": record.get("arrival_date", "")
                })
            
            return formatted_prices if formatted_prices else [{"crop": commodity or "Unknown", "price": "No Data", "trend": "stable", "change": "₹0", "mandi": "-"}]
    except Exception as e:
        print(f"Error fetching mandi prices: {e}")
        return [
            {"crop": commodity or "Error", "price": "API Error", "trend": "stable", "change": "₹0", "mandi": "-"}
        ]
