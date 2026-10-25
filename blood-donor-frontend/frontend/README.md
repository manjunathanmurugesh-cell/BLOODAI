# Frontend (React + Vite)

```bash
npm install
npm run dev       # development
npm run build     # production build -> dist/
```

```
src/
├── main.jsx            entry: Router + AuthProvider
├── App.jsx             all routes (+ ProtectedRoute for login-only pages)
├── index.css           tiny global stylesheet
├── services/api.js     every backend call (replaces config.js + scattered fetch())
├── context/AuthContext.jsx   token/currentUser in localStorage (same keys as before)
├── hooks/useDocumentTitle.js
├── components/         Navbar, Footer, ProtectedRoute, ScrollToTop
└── pages/              one .jsx + one .css per old .html page
```

**Page CSS is scoped.** The nine old stylesheets all defined their own `*`, `body`,
`.container`, `.card`, `.btn`… which would clash in one app. Each page's CSS is
wrapped under its own class (`.page-home`, `.page-login`, …) using `:where()`,
so specificity is exactly what it was in the original files.

Set `VITE_API_URL` (see `.env.example`) if the API isn't at `http://localhost:5000/api`.
