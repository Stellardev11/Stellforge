# StellForge Deployment Guide

## ✅ Recommended Production Solution (Implemented)

### Single-Service Deployment
The backend Express server now serves the built frontend in production, providing a unified deployment with one HTTPS endpoint.

**How it works:**
1. In development: Vite proxy handles `/api` routing
2. In production: Express serves both frontend static files and API routes

This solution:
- ✅ Works in Replit HTTPS deployment
- ✅ No additional infrastructure needed
- ✅ Standard SPA + API pattern
- ✅ Maintains development workflow

### Production Build & Deploy

```bash
# Build frontend
cd frontend && npm run build

# Start production server
cd backend && NODE_ENV=production npm start
```

The server will:
- Serve API routes at `/api/*`
- Serve frontend static files from `frontend/dist`
- Fall back to `index.html` for SPA routing

## Current Status

### ✅ Development Environment (Working)
- Frontend: Running on port 5000 with Vite dev server
- Backend: Running on port 3001 with Express API
- API Integration: Using Vite proxy (`/api` → `http://localhost:3001/api`)
- Real Stellar Data: Connected to mainnet Horizon (https://horizon.stellar.org)

### Real Top Stellar Tokens Integrated
1. **XLM** (Stellar Lumens) - Native token
2. **USDC** (Circle USD Coin) - `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN`
3. **AQUA** (Aquarius) - `GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA`
4. **yUSDC** (Ultra Stellar) - `GDGTVWSM4MGS4T7Z6W4RPWOCHE2I6RDFCIFZGS3DOA63LWQTRNZNTTFF`
5. **USDT** (Tether) - `GCQTGZQQ5G4PTM2GL7CDIFKUBIPEC52BROAQIAPW53XBRJVN6ZJVTG6V`

### Working Features
- ✅ Swap page displays real Stellar tokens from mainnet
- ✅ Liquidity page shows real liquidity pools
- ✅ Backend APIs serve live blockchain data
- ✅ Professional UI with dark theme

## Production Deployment (Next Steps)

### Option 1: Serve Frontend Through Backend (Recommended for Replit)
Modify `backend/src/server.ts` to serve the built frontend:

```typescript
import path from 'path';

// After API routes, add:
app.use(express.static(path.join(__dirname, '../../frontend/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});
```

Then build frontend:
```bash
cd frontend && npm run build
```

### Option 2: Use Environment Variables
Update `frontend/src/api/client.ts`:

```typescript
const API_BASE = import.meta.env.VITE_API_URL || '/api';
```

Set `VITE_API_URL` in production environment.

### Option 3: Reverse Proxy
Configure a reverse proxy (nginx, Caddy) to route:
- `/` → Frontend (port 5000)
- `/api` → Backend (port 3001)

## Current Configuration Files

### Backend (.env)
```
PORT=3001
STELLAR_NETWORK=mainnet
STELLAR_HORIZON_URL=https://horizon.stellar.org
CORS_ORIGIN=*
```

### Frontend (vite.config.ts)
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
}
```

## Testing in Development

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Access app: http://localhost:5000
4. Test swap: Real tokens should load (XLM, USDC, AQUA, etc.)
5. Test liquidity: Real pools should display

## Notes

- Development environment is fully functional with real Stellar mainnet data
- Production deployment requires one of the above options to be configured
- All APIs are working and returning live blockchain data
- Frontend UI is professional and ready for production use
