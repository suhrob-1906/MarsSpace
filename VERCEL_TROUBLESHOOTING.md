# Vercel Deployment Troubleshooting

## Issues Fixed

### 1. ✅ Favicon 404 Error
**Problem**: Browser was requesting `/favicon.ico` but your project only had `/vite.svg`

**Solution**:
- Created a custom MarsSpace favicon (`favicon.png`)
- Updated `index.html` to reference the proper favicon
- Added Vercel configuration for proper asset handling

### 2. ✅ Vercel Configuration
Created `vercel.json` to ensure proper SPA routing and asset handling.

---

## Deployment Steps for Vercel

### Prerequisites
1. Make sure all changes are committed to Git
2. Push your changes to GitHub

```bash
git add .
git commit -m "Fix favicon and add Vercel configuration"
git push origin main
```

### Deploy to Vercel

#### Option 1: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. **CRITICAL**: Configure the following settings:

   **Framework Preset**: Vite
   
   **Root Directory**: `frontend` (click Edit and select the frontend folder)
   
   **Build Command**: `npm run build`
   
   **Output Directory**: `dist`
   
   **Install Command**: `npm install`

5. **Environment Variables** - Add this:
   ```
   VITE_API_URL=https://marsspace-backend.onrender.com/api/v1
   ```
   *(Replace with your actual Render backend URL)*

6. Click **Deploy**

#### Option 2: Deploy via Vercel CLI
```bash
cd frontend
npx vercel --prod
```

---

## Common Vercel Deployment Issues

### Issue: Build Fails
**Check these:**
- ✅ Root directory is set to `frontend`
- ✅ `package.json` has all dependencies
- ✅ Node version compatibility (Vercel uses Node 18+ by default)

**Fix**: Add a `.node-version` file if needed:
```bash
echo "18" > frontend/.node-version
```

### Issue: 404 on Page Refresh
**Cause**: SPA routing not configured

**Fix**: Already handled by `vercel.json` rewrites

### Issue: API Calls Fail (CORS/404)
**Causes**:
1. `VITE_API_URL` not set in Vercel environment variables
2. Backend CORS not allowing your Vercel domain

**Fix**:
1. Add `VITE_API_URL` in Vercel Dashboard → Settings → Environment Variables
2. Update Render backend environment variable:
   ```
   CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
   ```

### Issue: Blank Page After Deployment
**Causes**:
1. Missing environment variables
2. API URL not configured
3. Build errors

**Debug Steps**:
1. Check Vercel build logs
2. Open browser DevTools → Console for errors
3. Verify `VITE_API_URL` is set correctly

---

## Verify Deployment

After deployment, test these:

1. **Favicon loads**: Check browser tab for MarsSpace icon
2. **Pages load**: Navigate to different routes and refresh
3. **API works**: Login/register functionality works
4. **CORS**: No CORS errors in browser console

---

## Quick Reference

### Vercel Environment Variables
```
VITE_API_URL=https://marsspace-backend.onrender.com/api/v1
```

### Render Environment Variables (Update these)
```
CORS_ALLOWED_ORIGINS=https://your-marsspace-app.vercel.app
ALLOWED_HOSTS=*.onrender.com
```

---

## Next Steps After Deployment

1. Copy your Vercel URL (e.g., `https://marsspace.vercel.app`)
2. Update Render backend `CORS_ALLOWED_ORIGINS` with this URL
3. Test the full application flow
4. Update README.md with the live URL

---

## Support

If you encounter specific errors during deployment, check:
- Vercel build logs (in the Vercel dashboard)
- Browser console (F12 → Console tab)
- Network tab for failed API calls

Common error patterns:
- `Failed to load resource: 404` → Check `VITE_API_URL`
- `CORS policy` → Update backend `CORS_ALLOWED_ORIGINS`
- `Cannot GET /some-route` → Vercel routing issue (should be fixed by vercel.json)
