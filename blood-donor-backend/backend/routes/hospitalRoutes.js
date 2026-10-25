
const express = require("express");
const axios = require("axios");
const Hospital = require("../models/Hospital");

const router = express.Router();

const GEOAPIFY_KEY = process.env.GEOAPIFY_API_KEY;
const CACHE_DURATION = 10 * 60 * 1000;
const SEARCH_RADIUS = 12000;
const MAX_RESULTS = 100;

// Cache results separately for each normalized search.
const hospitalCache = new Map();

function normalize(value = "") {
  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeHospitalName(value = "") {
  return normalize(value)
    .replace(/\b(the|hospital|clinic|medical centre|medical center)\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function distanceInMeters(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371000;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function deduplicateHospitals(hospitals = []) {
  const results = [];
  const seenIds = new Set();
  const seenNames = [];

  for (const hospital of hospitals) {
    if (!hospital || !hospital.name) continue;

    const id = String(hospital.osmId || hospital.placeId || "");
    const normalizedName = normalizeHospitalName(hospital.name);

    if (id && seenIds.has(id)) continue;

    const latitude = Number(hospital.latitude);
    const longitude = Number(hospital.longitude);

    const duplicate = seenNames.some((item) => {
      if (
        !normalizedName ||
        item.normalizedName !== normalizedName
      ) {
        return false;
      }

      const coordinatesAvailable =
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        Number.isFinite(item.latitude) &&
        Number.isFinite(item.longitude);

      if (!coordinatesAvailable) return true;

      return (
        distanceInMeters(
          latitude,
          longitude,
          item.latitude,
          item.longitude
        ) < 150
      );
    });

    if (duplicate) continue;

    if (id) seenIds.add(id);

    seenNames.push({
      normalizedName,
      latitude,
      longitude,
    });

    results.push(hospital);
  }

  return results;
}

function buildCacheKey({ city, district, state, name }) {
  return [
    normalize(city),
    normalize(district),
    normalize(state),
    normalize(name),
  ].join("|");
}

function getCachedResponse(key) {
  const cached = hospitalCache.get(key);

  if (!cached) return null;

  if (Date.now() - cached.timestamp >= CACHE_DURATION) {
    hospitalCache.delete(key);
    return null;
  }

  return {
    ...cached.response,
    cached: true,
  };
}

function setCachedResponse(key, response) {
  hospitalCache.set(key, {
    timestamp: Date.now(),
    response,
  });
}

async function fetchGeoapify(url, params) {
  const response = await axios.get(url, {
    params,
    timeout: 20000,
  });

  return response.data;
}

async function geocodeLocation(city, district, state) {
  const location = [city, district, state, "India"]
    .filter(Boolean)
    .join(", ");

  const data = await fetchGeoapify(
    "https://api.geoapify.com/v1/geocode/search",
    {
      text: location,
      limit: 1,
      format: "json",
      apiKey: GEOAPIFY_KEY,
    }
  );

  const result = data?.results?.[0];

  if (!result) {
    throw new Error(`Could not find coordinates for: ${location}`);
  }

  return {
    latitude: Number(result.lat),
    longitude: Number(result.lon),
  };
}

async function searchGeoapifyHospitals(latitude, longitude) {
  const data = await fetchGeoapify(
    "https://api.geoapify.com/v2/places",
    {
      categories: "healthcare",
      filter: `circle:${longitude},${latitude},${SEARCH_RADIUS}`,
      bias: `proximity:${longitude},${latitude}`,
      limit: MAX_RESULTS,
      apiKey: GEOAPIFY_KEY,
    }
  );

  return Array.isArray(data?.features) ? data.features : [];
}

function formatHospital(feature, fallback = {}) {
  const properties = feature?.properties || {};
  const coordinates = feature?.geometry?.coordinates || [];

  const longitude = Number(coordinates[0]);
  const latitude = Number(coordinates[1]);

  const categories = Array.isArray(properties.categories)
    ? properties.categories
    : [];

  const healthcarePlace = categories.some((category) =>
    /(^|\.)hospital($|\.)|(^|\.)clinic($|\.)|clinic_or_praxis/i.test(
      category
    )
  );

  if (!healthcarePlace) return null;

  const name = properties.name || properties.address_line1;

  if (!name) return null;

  const address =
    properties.formatted ||
    [properties.address_line1, properties.address_line2]
      .filter(Boolean)
      .join(", ") ||
    "Address not listed";

  const placeId = properties.place_id;

  return {
    name,
    state: properties.state || fallback.state || "Tamil Nadu",
    district:
      properties.county ||
      properties.state_district ||
      fallback.district ||
      fallback.city ||
      "Not listed",
    city:
      properties.city ||
      properties.town ||
      properties.village ||
      properties.suburb ||
      fallback.city ||
      fallback.district ||
      "Not listed",
    phone: properties.datasource?.raw?.phone || "Not listed",
    email: properties.datasource?.raw?.email || "Not listed",
    address,
    rating: "Not available",
    emergency: "Please contact hospital",
    latitude: Number.isFinite(latitude) ? latitude : undefined,
    longitude: Number.isFinite(longitude) ? longitude : undefined,
    osmId: placeId ? `geoapify/${placeId}` : undefined,
    source: "Geoapify",
    map:
      Number.isFinite(latitude) && Number.isFinite(longitude)
        ? `https://www.google.com/maps?q=${latitude},${longitude}`
        : "",
  };
}

// Return hospitals already stored in MongoDB.
router.get("/", async (req, res) => {
  try {
    const records = await Hospital.find().lean();
    const hospitals = deduplicateHospitals(records);

    return res.json({
      source: "MongoDB",
      count: hospitals.length,
      data: hospitals,
    });
  } catch (error) {
    console.error("Get hospitals error:", error.message);

    return res.status(500).json({
      message: "Failed to retrieve hospitals",
    });
  }
});

// Search hospitals using Geoapify.
router.get("/search", async (req, res) => {
  const city = String(req.query.city || "").trim();
  const district = String(req.query.district || "").trim();
  const state = String(req.query.state || "").trim();
  const name = String(req.query.name || "").trim();

  if (!city && !district && !state) {
    return res.status(400).json({
      message: "Enter a city, district, or state to search.",
      data: [],
      count: 0,
    });
  }

  const cacheKey = buildCacheKey({
    city,
    district,
    state,
    name,
  });

  // Exact same location + same optional name gets its own cache entry.
  const cachedResponse = getCachedResponse(cacheKey);

  if (cachedResponse) {
    return res.json(cachedResponse);
  }

  try {
    if (!GEOAPIFY_KEY) {
      throw new Error("GEOAPIFY_API_KEY is missing in the backend .env file.");
    }

    const coordinates = await geocodeLocation(
      city,
      district,
      state
    );

    const features = await searchGeoapifyHospitals(
      coordinates.latitude,
      coordinates.longitude
    );

    const formatted = features
      .map((feature) =>
        formatHospital(feature, { city, district, state })
      )
      .filter(Boolean);

    // Filter by hospital name only when the user supplied a name.
    const nameFiltered = name
      ? formatted.filter((hospital) =>
          normalize(hospital.name).includes(normalize(name))
        )
      : formatted;

    const hospitals = deduplicateHospitals(nameFiltered);

    // Save/update results in MongoDB without duplicating Geoapify places.
    const operations = hospitals
      .filter((hospital) => hospital.osmId)
      .map((hospital) => ({
        updateOne: {
          filter: { osmId: hospital.osmId },
          update: { $set: hospital },
          upsert: true,
        },
      }));

    if (operations.length > 0) {
      await Hospital.bulkWrite(operations, { ordered: false });
    }

    const responseData = {
      source: "Geoapify",
      cached: false,
      count: hospitals.length,
      data: hospitals,
    };

    // Cache even an empty successful result for this exact search.
    setCachedResponse(cacheKey, responseData);

    return res.json(responseData);
  } catch (error) {
    console.error(
      "Geoapify hospital search error:",
      error.response?.status || "",
      error.response?.data || error.message
    );

    // Try matching the requested location from the database.
    try {
      const records = await Hospital.find().lean();

      let hospitals = records.filter((hospital) => {
        const matchesCity =
          !city || normalize(hospital.city).includes(normalize(city));

        const matchesDistrict =
          !district ||
          normalize(hospital.district).includes(normalize(district));

        const matchesState =
          !state || normalize(hospital.state).includes(normalize(state));

        const matchesName =
          !name || normalize(hospital.name).includes(normalize(name));

        return (
          matchesCity &&
          matchesDistrict &&
          matchesState &&
          matchesName
        );
      });

      hospitals = deduplicateHospitals(hospitals);

      return res.json({
        source: "MongoDB",
        cached: false,
        count: hospitals.length,
        warning: "Geoapify live search failed. Showing saved hospitals.",
        data: hospitals,
      });
    } catch (dbError) {
      console.error("MongoDB hospital fallback error:", dbError.message);

      return res.status(500).json({
        message: "Hospital search failed",
        data: [],
        count: 0,
      });
    }
  }
});

module.exports = router;
