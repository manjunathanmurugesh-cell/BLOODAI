# Blood Donor Finder — corrected local setup

## Fix applied
The frontend previously defaulted to `http://localhost:5000/api`, while the backend `.env` configured `PORT=5001`. The frontend API base URL now uses port 5001, so registration/login requests target the backend port.

## Requirements
- Node.js (LTS recommended)
- MongoDB Community Server running locally, or your own MongoDB Atlas URI
- VS Code

## Backend setup (terminal 1)
Open a terminal in `blood-donor-backend/backend`:
```bash
npm install
npm run dev
```
The included development `.env` uses local MongoDB at `mongodb://127.0.0.1:27017/blood-donor` and port 5001. Make sure MongoDB Community Server is installed and running first. If using Atlas, replace `MONGODB_URI` in `backend/.env` with your own Atlas connection string. Do not share or commit `.env`.

Expected logs include MongoDB connected and `Server running on http://localhost:5001`.

Check the API in a browser: `http://localhost:5001/api/health` should return `{"ok":true}`.

## Frontend setup (terminal 2)
Open another terminal in `blood-donor-frontend/frontend`:
```bash
npm install
npm run dev
```
Open the URL Vite prints (commonly `http://localhost:5173`).

## Verify registration saves to MongoDB
1. Register a new email through the website.
2. If successful, the frontend should redirect to Login.
3. In MongoDB Compass, connect to `mongodb://127.0.0.1:27017`.
4. Open database `blood-donor` → collection `users`.
5. Confirm the new user document exists. The `password` field should be a bcrypt hash, not the original password.
6. Test login using the same email and password.

## If registration still fails
- Check the backend terminal at the exact time you submit the form.
- Confirm `/api/health` returns `{"ok":true}` on port 5001.
- Confirm MongoDB is running and the backend logs say MongoDB connected.
- Check browser DevTools → Network → `auth/register` → Response.
- Do not paste MongoDB credentials or JWT secrets into chat.

## Notes
- The project has not been tested against your local MongoDB service from this environment.
- Location-based driving-time features need an optional OpenRouteService API key in `ORS_API_KEY`; registration and normal donor storage do not require it.


## Live hospital search
The Hospital Directory now searches OpenStreetMap using the entered city/district/state. Results found from OpenStreetMap are also cached in MongoDB with an OpenStreetMap ID to avoid duplicate records. Clear the optional Hospital Name field to list all mapped hospitals/clinics in the location. OpenStreetMap data is community-maintained, so it may not include every hospital or current phone/rating details.
