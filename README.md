# PAAS_App_Backend

Backend scaffold for the PAAS API testing tool.

Structure
- `server.js` - entry point that starts the HTTP server
- `app.js` - Express application, mounts routes and global error handler
- `router/paasRouter.js` - routes for `/api/paas`
- `controllers/` - controller functions (e.g., `requestController.js`)
- `util/` - helper utilities: `appError.js`, `catchAsync.js`, `supabaseClient.js`

Key endpoint
- `POST /api/paas/request` - proxy a request. Request body:
	```json
	{
		"method": "GET|POST|...",
		"url": "https://example.com/path",
		"headers": { /* optional */ },
		"body": {} // optional, string or JSON
	}
	```

Security notes
- The proxy implements a basic URL validation and prevents requests to localhost and RFC1918 private IP ranges.
- Review and harden this before exposing to production.

Quick start
1. Install dependencies in `PAAS_App_Backend`:

```powershell
cd PAAS_App_Backend
npm install
```

2. Create a `.env` file with optional `PORT`, `SUPABASE_URL`, `SUPABASE_KEY`.

3. Run in development:

```powershell
npm run dev
```

4. The frontend can call `http://localhost:4000/api/paas/request` to proxy requests.

