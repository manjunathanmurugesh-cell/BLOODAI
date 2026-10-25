# Blood Donor Finder — Backend (Express + MongoDB Atlas)

This replaces the old `localStorage`-based data (users, donors, hospitals,
emergency requests) with a real MongoDB database, reachable through a small
REST API.

## 1. Create a free MongoDB Atlas cluster

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account.
2. Create a new project, then click **Build a Database** → choose the **free
   M0** tier → pick any cloud/region → **Create**.
3. **Database Access** (left sidebar) → **Add New Database User**:
   - Username/password authentication.
   - Give the user "Read and write to any database" and remember the password.
4. **Network Access** (left sidebar) → **Add IP Address**:
   - While developing, choose **Allow Access From Anywhere** (`0.0.0.0/0`).
     (Tighten this later if you deploy for real.)
5. Go to **Database** → **Connect** → **Drivers** → copy the connection
   string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## 2. Configure the project

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
- Paste your connection string into `MONGODB_URI`, replacing `<username>`
  and `<password>` with the database user you created. Add a database name
  before the `?`, e.g. `.../blood-donor?retryWrites=...`.
- Set `JWT_SECRET` to any long random string (used to sign login tokens).

## 3. Install dependencies and run

```bash
npm install
npm run seed     # loads the 4 sample hospitals into the database (one-time)
npm start         # starts the API on http://localhost:5000
```

You should see:
```
✅ MongoDB connected: cluster0-shard-...
🚀 Server running on http://localhost:5000
```

Use `npm run dev` instead of `npm start` if you install `nodemon` and want
auto-restart on file changes.

## 3b. (Optional) Enable "Find Near Me" driving times

The Find Donor page has a "Find Near Me" button that shows real driving
time to each donor, powered by the free OpenRouteService API.

1. Go to https://openrouteservice.org/dev/#/signup and create a free
   account (no credit card required).
2. Go to your Dashboard → **Request a token** → Standard token → copy the key.
3. Paste it into `.env` as `ORS_API_KEY=your-key-here`.
4. Restart the backend (`npm start`).

Donor addresses are geocoded automatically when someone registers as a
donor via "Become a Donor" — no extra step needed. If `ORS_API_KEY` is
left blank, donors are still saved normally, but driving times just won't
be available.

## 4. Run the frontend

The frontend is now a React (Vite) app in the sibling `frontend/` folder:

```bash
cd ../frontend
npm install
npm run dev        # http://localhost:5173
```

It calls `http://localhost:5000/api/...` by default (change it with
`VITE_API_URL` in `frontend/.env`). CORS is already enabled in `server.js`.

## API summary

| Method | Route              | Auth | Purpose                          |
|--------|---------------------|------|-----------------------------------|
| POST   | /api/auth/register  | no   | Create a user account             |
| POST   | /api/auth/login     | no   | Log in, returns a JWT token       |
| GET    | /api/donors         | no   | List all donors                   |
| GET    | /api/donors/nearby  | no   | Donors sorted by driving time (`?lat=&lng=`) |
| GET    | /api/donors/me      | yes  | Get the logged-in user's donor record |
| POST   | /api/donors         | yes  | Register the logged-in user as a donor |
| GET    | /api/hospitals      | no   | List all hospitals                |
| GET    | /api/emergency      | no   | List all emergency requests       |
| POST   | /api/emergency      | no   | Submit an emergency request       |

Protected routes expect `Authorization: Bearer <token>`, using the token
returned from login/register (the frontend already handles this — it's
stored in `localStorage` under `token`).
