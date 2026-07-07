/**
 * weatherService.js
 * Real-data-only weather fetching with a multi-layer fallback chain:
 *  1. Browser GPS (works on HTTPS or localhost)
 *  2. IP-based geolocation (works even without GPS permission)
 *  3. Backend API proxy (/api/weather)
 *  4. Open-Meteo direct (free, no key)
 *  5. 30-min localStorage cache (from a previous real fetch)
 *  → Throws only if everything fails so the UI shows a proper error.
 */

const WEATHER_CACHE_KEY = 'fasal_weather_cache';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function saveToCache(data) {
  try {
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
}

function getFromCache() {
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp < CACHE_TTL_MS) return { ...data, fromCache: true };
  } catch {}
  return null;
}

/** Get GPS from browser (only works on HTTPS / localhost). */
export function getGPSPosition() {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, source: 'gps' }),
      ()    => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 }
    );
  });
}

/** IP-based geolocation — no browser permission needed, works on HTTP too. */
async function getPositionFromIP() {
  const apis = [
    'https://ipapi.co/json/',
    'https://ip-api.com/json/?fields=lat,lon,city,regionName,country',
  ];
  for (const url of apis) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;
      const d = await res.json();
      const lat = d.lat ?? d.latitude;
      const lon = d.lon ?? d.longitude;
      if (lat && lon) {
        return {
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          city: d.city || '',
          region: d.regionName || d.region || '',
          source: 'ip'
        };
      }
    } catch {}
  }
  return null;
}

/** Fetch directly from Open-Meteo (free, no API key, no proxy needed). */
async function fetchFromOpenMeteo(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current_weather=true` +
    `&hourly=relative_humidity_2m,precipitation_probability,precipitation` +
    `&forecast_days=1&timezone=auto`;

  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
  const data = await res.json();

  const cw          = data.current_weather || {};
  const temp        = cw.temperature  ?? null;
  const windSpeed   = cw.windspeed    ?? null;
  const weatherCode = cw.weathercode  ?? 0;
  const currentTime = cw.time;

  let humidity = null, rainProb = null, rainMm = 0;
  try {
    const roundedTime = currentTime ? currentTime.substring(0, 14) + '00' : null;
    const idx = data.hourly.time.indexOf(roundedTime);
    if (idx !== -1) {
      humidity = data.hourly.relative_humidity_2m[idx]         ?? null;
      rainProb = data.hourly.precipitation_probability[idx]    ?? null;
      rainMm   = data.hourly.precipitation[idx]                ?? 0;
    }
  } catch {}

  let condition;
  if ([61, 63, 65, 80, 81, 82].includes(weatherCode)) condition = 'Rain';
  else if (weatherCode >= 95)                          condition = 'Thunderstorm';
  else if (weatherCode > 1)                            condition = 'Cloudy';
  else                                                 condition = 'Clear';

  let advisory;
  if (rainMm > 0 || (rainProb !== null && rainProb > 40)) {
    advisory = `${condition} expected (${rainProb}% rain chance). Avoid spraying pesticides — rain will wash them away.`;
  } else if (windSpeed > 15) {
    advisory = `High winds (${windSpeed} km/h). Avoid spraying to prevent chemical drift.`;
  } else if (temp > 35) {
    advisory = `Extreme heat (${temp}°C). Spray only in late evening to avoid leaf burn.`;
  } else {
    advisory = 'Optimal weather. Good time for pesticide or fertilizer application.';
  }

  return { temp, condition, rainProb: rainMm, humidity, windSpeed, advisory };
}

/**
 * Master function: resolve coordinates then fetch weather.
 * Pass lat/lon if you already have them; otherwise we figure it out.
 */
export async function fetchWeather(lat = null, lon = null) {
  let coords = (lat !== null && lon !== null) ? { lat, lon } : null;
  let locationSource = 'provided';

  // Step 1 — GPS (only works on HTTPS/localhost, fails silently otherwise)
  if (!coords) {
    const gps = await getGPSPosition();
    if (gps) { coords = gps; locationSource = 'gps'; }
  }

  // Step 2 — IP geolocation (always works, no permissions needed)
  if (!coords) {
    const ip = await getPositionFromIP();
    if (ip) { coords = ip; locationSource = 'ip'; }
  }

  const errors = [];

  if (coords) {
    // Step 3 — Backend proxy
    try {
      const res = await fetch(`/api/weather?lat=${coords.lat}&lon=${coords.lon}`, {
        signal: AbortSignal.timeout(8000)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.temp !== undefined && data.temp !== null) {
          saveToCache({ ...data, locationSource });
          return { ...data, locationSource };
        }
      }
      throw new Error(`Backend HTTP ${res.status}`);
    } catch (e) {
      errors.push(`Backend: ${e.message}`);
      console.warn('[Weather] Backend proxy failed:', e.message);
    }

    // Step 4 — Open-Meteo direct
    try {
      const data = await fetchFromOpenMeteo(coords.lat, coords.lon);
      saveToCache({ ...data, locationSource });
      return { ...data, locationSource };
    } catch (e) {
      errors.push(`Open-Meteo: ${e.message}`);
      console.warn('[Weather] Open-Meteo failed:', e.message);
    }
  } else {
    errors.push('No location available (GPS denied and IP lookup failed)');
  }

  // Step 5 — LocalStorage cache (a real fetch < 30 min old)
  const cached = getFromCache();
  if (cached) {
    console.info('[Weather] Using cached real data');
    return cached;
  }

  throw new Error(`Weather unavailable. ${errors.join(' | ')}`);
}

/**
 * Resolve the user's location:
 * Try GPS first (HTTPS), fall back to IP-based lookup.
 * Returns { lat, lon, city?, region?, source } or null.
 */
export async function resolveLocation() {
  const gps = await getGPSPosition();
  if (gps) return gps;
  const ip = await getPositionFromIP();
  return ip;
}

/** Reverse geocode coordinates → human-readable city string. */
export async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      { signal: AbortSignal.timeout(5000) }
    );
    const d = await res.json();
    const city  = d.city || d.locality || '';
    const state = d.principalSubdivision || d.countryName || '';
    return city ? `${city}${state ? `, ${state}` : ''}` : null;
  } catch { return null; }
}
