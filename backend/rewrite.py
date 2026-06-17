import os

NEW_MAIN = """from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import random
import os
import requests
import base64
import sqlite3
import json
from datetime import datetime

# Import our ML inference logic
try:
    from ml_model.inference import predict_image
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False

app = FastAPI(title="FasalDrishti API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SQLite Database Setup ---
DB_FILE = "fasaldrishti.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, password TEXT, name TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS farms
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, name TEXT, crop TEXT, area_acres REAL, coordinates TEXT, created_at TEXT)''')
    conn.commit()
    conn.close()

init_db()

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    # For hackathon, token is just base64 encoded "email:password"
    try:
        decoded = base64.b64decode(token).decode('utf-8')
        email, _ = decoded.split(":", 1)
        
        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = c.fetchone()
        conn.close()
        
        if user:
            return {"uid": user["id"], "email": user["email"], "name": user["name"]}
    except Exception as e:
        pass
    raise HTTPException(status_code=401, detail="Invalid authentication credentials")

# Models
class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class DiagnosisRequest(BaseModel):
    image_base64: str

class FarmRegistration(BaseModel):
    name: str
    crop: str
    area_acres: float
    coordinates: list

@app.post("/api/register")
def register(user: UserRegister, db: sqlite3.Connection = Depends(get_db)):
    try:
        c = db.cursor()
        c.execute("INSERT INTO users (email, password, name) VALUES (?, ?, ?)", 
                 (user.email, user.password, user.name))
        db.commit()
        
        # Issue hackathon token
        token = base64.b64encode(f"{user.email}:{user.password}".encode()).decode('utf-8')
        return {"status": "success", "token": token, "user": {"name": user.name, "email": user.email}}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Email already registered")

@app.post("/api/login")
def login(user: UserLogin, db: sqlite3.Connection = Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT * FROM users WHERE email = ? AND password = ?", (user.email, user.password))
    row = c.fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = base64.b64encode(f"{user.email}:{user.password}".encode()).decode('utf-8')
    return {"status": "success", "token": token, "user": {"name": row["name"], "email": row["email"]}}

@app.get("/api/auth/me")
def get_current_user(user: dict = Depends(verify_token)):
    return {"status": "authenticated", "uid": user["uid"], "email": user["email"], "name": user["name"]}

@app.post("/api/farms")
def save_farm(farm: FarmRegistration, user: dict = Depends(verify_token), db: sqlite3.Connection = Depends(get_db)):
    try:
        c = db.cursor()
        coords_json = json.dumps(farm.coordinates)
        now = datetime.now().isoformat()
        c.execute("INSERT INTO farms (user_id, name, crop, area_acres, coordinates, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                  (user["uid"], farm.name, farm.crop, farm.area_acres, coords_json, now))
        db.commit()
        return {"status": "success", "farm_id": c.lastrowid, "message": "Farm saved successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save farm: {e}")

@app.get("/api/farms")
def get_farms(user: dict = Depends(verify_token), db: sqlite3.Connection = Depends(get_db)):
    try:
        c = db.cursor()
        c.execute("SELECT * FROM farms WHERE user_id = ?", (user["uid"],))
        rows = c.fetchall()
        farms = []
        for r in rows:
            f = dict(r)
            f["coordinates"] = json.loads(f["coordinates"])
            f["score"] = random.randint(60, 95)
            f["status"] = "Healthy" if f["score"] > 75 else "Watch"
            farms.append(f)
        return farms
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch farms: {e}")

@app.post("/api/diagnose")
def diagnose_crop(request: DiagnosisRequest):
    try:
        header, encoded = request.image_base64.split(",", 1)
        image_bytes = base64.b64decode(encoded)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image format")

    if ML_AVAILABLE:
        result = predict_image(image_bytes)
        if result:
            disease = result["disease"]
            confidence = result["confidence"]
        else:
            disease = "Error analyzing"
            confidence = 0
    else:
        diseases = ["Early Blight", "Late Blight", "Healthy"]
        disease = random.choice(diseases)
        confidence = random.randint(75, 99)
    
    severity = "Low"
    if confidence > 90 and "Healthy" not in disease:
        severity = "High"
    elif confidence > 80 and "Healthy" not in disease:
        severity = "Moderate"
        
    recommendations = {
        "Early Blight": "Spray Mancozeb (2g/L). Avoid overhead watering.",
        "Late Blight": "Apply Chlorothalonil. Remove infected plants immediately.",
        "Healthy": "Crop is healthy! Maintain regular watering schedule.",
    }
    rec = recommendations.get(disease, f"Consult local expert for {disease}.")

    return {
        "disease": disease,
        "confidence": confidence,
        "severity": severity if "Healthy" not in disease else "N/A",
        "recommendation": rec
    }

@app.get("/api/weather")
def get_weather(lat: float = 28.7041, lon: float = 77.1025):
    api_key = os.environ.get("OPENWEATHER_API_KEY")
    if not api_key:
        return {
            "temp": 28,
            "condition": "Sunny (Mock Data - No API Key)",
            "rainProb": 10,
            "advisory": "Clear weather. Good time for pesticide application."
        }
        
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        response = requests.get(url)
        data = response.json()
        temp = round(data.get("main", {}).get("temp", 0))
        condition = data.get("weather", [{}])[0].get("main", "Unknown")
        rain_prob = 80 if "Rain" in condition or "Thunderstorm" in condition else 10
        advisory = "Clear weather ahead. Good time for pesticide application if needed."
        if rain_prob > 50:
            advisory = "Heavy rain expected. Avoid spraying pesticides today as they might wash away."
        return {"temp": temp, "condition": condition, "rainProb": rain_prob, "advisory": advisory}
    except Exception as e:
        return {"error": str(e), "temp": 0, "condition": "Error Fetching", "rainProb": 0}

@app.get("/api/mandi")
def get_mandi_prices():
    return [
        {"crop": "Soybean", "price": "₹4,200/q", "trend": "up", "change": "+₹150"},
        {"crop": "Cotton", "price": "₹6,800/q", "trend": "down", "change": "-₹50"},
        {"crop": "Wheat", "price": "₹2,300/q", "trend": "stable", "change": "₹0"}
    ]

@app.post("/api/map/ndvi")
def generate_ndvi_heatmap(polygon: list):
    total_area_acres = random.uniform(0.5, 5.0)
    red_zone_acres = total_area_acres * random.uniform(0.1, 0.4)
    standard_pesticide_ml = total_area_acres * 400
    precision_pesticide_ml = red_zone_acres * 400
    savings_percent = ((standard_pesticide_ml - precision_pesticide_ml) / standard_pesticide_ml) * 100
    return {
        "area_acres": round(total_area_acres, 2),
        "red_zone_acres": round(red_zone_acres, 2),
        "pesticide_volume_ml": int(precision_pesticide_ml),
        "savings_percent": round(savings_percent, 1)
    }

class SpreadRequest(BaseModel):
    farm_id: str
    current_red_zone_acres: float

@app.post("/api/disease/spread")
def predict_disease_spread(req: SpreadRequest):
    wind_direction = "North-East"
    confidence = random.randint(80, 95)
    spread_progression = []
    current_area = req.current_red_zone_acres
    for day in range(1, 6):
        growth_factor = random.uniform(1.1, 1.4)
        current_area = current_area * growth_factor
        spread_progression.append({"day": f"Day {day}", "predicted_acres": round(current_area, 2)})
    return {"direction": wind_direction, "confidence": confidence, "progression": spread_progression}
"""

with open(r"d:\HACKathon\FasalDrisht\backend\main.py", "w", encoding="utf-8") as f:
    f.write(NEW_MAIN)

print("Updated main.py successfully with SQLite auth.")
