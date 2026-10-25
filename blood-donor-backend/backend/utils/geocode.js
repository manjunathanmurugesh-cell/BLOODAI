// Helpers that talk to OpenRouteService (openrouteservice.org) — a free
// mapping API (no credit card needed) used for:
//   1. Geocoding: turning "city, district, state" text into lat/lng
//   2. Matrix: computing driving time from one point to many points

const ORS_BASE = "https://api.openrouteservice.org";

function getApiKey() {
  const key = process.env.ORS_API_KEY;
  if (!key) {
    console.warn(
      "⚠️  ORS_API_KEY is not set — location features will be skipped."
    );
  }
  return key;
}

// Turns an address string into { latitude, longitude }, or null if it
// can't be geocoded (missing key, no match, or a network error).
async function geocodeAddress(addressText) {
  const apiKey = getApiKey();
  if (!apiKey || !addressText) return null;

  try {
    const url = `${ORS_BASE}/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(
      addressText
    )}&size=1`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    const coords = data?.features?.[0]?.geometry?.coordinates; // [lng, lat]
    if (!coords) return null;

    return { latitude: coords[1], longitude: coords[0] };
  } catch (err) {
    console.error("Geocoding failed:", err.message);
    return null;
  }
}

// Given the user's { latitude, longitude } and an array of donor
// { latitude, longitude } points, returns an array of driving durations in
// seconds (same order as donorPoints), or null entries where unavailable.
// Returns null entirely if the whole request fails.
async function getDrivingDurations(userPoint, donorPoints) {
  const apiKey = getApiKey();
  if (!apiKey || donorPoints.length === 0) return null;

  try {
    // ORS matrix wants [lng, lat] pairs, source first, then destinations
    const locations = [
      [userPoint.longitude, userPoint.latitude],
      ...donorPoints.map((p) => [p.longitude, p.latitude]),
    ];

    const response = await fetch(
      `${ORS_BASE}/v2/matrix/driving-car`,
      {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locations,
          sources: [0],
          destinations: locations.map((_, i) => i).slice(1),
          metrics: ["duration"],
        }),
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    // durations is [[d1, d2, d3, ...]] — one row for our single source
    return data?.durations?.[0] || null;
  } catch (err) {
    console.error("Matrix request failed:", err.message);
    return null;
  }
}

module.exports = { geocodeAddress, getDrivingDurations };
