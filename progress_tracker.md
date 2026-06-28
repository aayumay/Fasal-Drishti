# Fasal Drishti - Progress Tracker

## 1. Current Phase and Section
- **Active Phase:** Phase 4
- **Completed Section:** Section 4 (Live API, ML Integration, and Authentication)

## 2. Architecture & Data Structures Established
- **Framework:** Streamlit for mobile-first python UI.
- **Layout:** `centered` layout configured for mobile screens.
- **Navigation:** Tab-based routing (`st.tabs`) for distinct feature sections (Weather AI, Leaf Scan, Satellite Vision).
- **Core Engine (Weather Risk):** Live OpenWeather API via `urllib.request` integrated with the deterministic rule-based function (`calculate_biological_risk`).
- **Core Engine (AI Diagnosis):** Upgraded `ml_ai_diagnosis` simulating `.h5` weights loading and using an advanced image-byte hash for deterministic fallback.
- **Core Engine (Satellite Vision):** Deterministic grid assignment based on location hash (`compute_nir_stress`) and orbital pass simulation (`get_next_sentinel_pass`).
- **Authentication:** Sidebar `st.session_state` Farm ID login tracking.

## 3. State Variables Used
- `farm_id` (string): Active user session ID (Authentication).
- `api_key` (string): Live OpenWeather key for live weather data.
- `mode` (string): Captures the radio toggle state ("Demo Sliders" vs "Live API").
- `location` (string): Text input for the target city/farm location.
- `crop` (string): Dropdown selection for the current crop.
- `temp` (float): Slider/API input for the field temperature in Celsius.
- `humidity` (float): Slider/API input for the field relative humidity percentage.
- `hours` (integer): Slider input for the sustained incubation window in hours.
- `risk_score` (integer): The computed biological risk percentage.
- `image_source` (string): Captures the image upload method ("Camera" vs "Upload Image").
- `leaf_image` (Streamlit UploadedFile / camera stream object): The image uploaded/captured by the user.
- `diagnosis` (dict): Dictionary tracking the result of AI evaluation (`disease`, `confidence`, `action`).
- `next_pass` (string): Formatted future date for satellite pass.
- `stressed_cells` (set): Hash-based deterministic set of (row, col) coordinates showing pre-symptomatic NIR stress.

## 4. Explicit Next Steps for Phase 5 (If Any)
- Deploy the MVP to Streamlit Community Cloud.
- Store farm alert logs into a lightweight database (e.g., SQLite or Firebase).
- Implement persistent memory between sessions.
