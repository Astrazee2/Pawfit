# Quick Start: Add GLB Files (5 Minutes)

## What You Need

- GLB files (1-3MB each)
- Running backend server
- Admin dashboard access

## Steps

### 1️⃣ Copy GLB Files to Backend

```
Copy your GLB files to:
PAWFIT-Backend/public/models/

Example files:
- labrador-blue-shirt.glb
- shih-tzu-pink-sweater.glb
- dachshund-coat.glb
```

### 2️⃣ Start Backend Server

```bash
cd PAWFIT-Backend
npm start
```

Check console shows: `Server running on port 5000`

### 3️⃣ Open Admin Dashboard

```
http://localhost:5173/admin
```

Navigate to: **Admin → 3D Assets**

### 4️⃣ Click "Upload New Asset"

Fill in the form:

| Field             | Example                           |
| ----------------- | --------------------------------- |
| **Asset Name**    | `Labrador in Blue Shirt`          |
| **Asset Type**    | `Pre-Combined Model`              |
| **Dog Breed**     | `Labrador Retriever`              |
| **Apparel Type**  | `Shirt`                           |
| **Apparel Name**  | `Premium Blue Tee`                |
| **GLB File URL**  | `/models/labrador-blue-shirt.glb` |
| **Thumbnail URL** | (optional)                        |

⚠️ **IMPORTANT: Use `/models/filename.glb` format**

### 5️⃣ Click "Upload Asset"

✅ Done! Model appears in:

- Product pages
- Virtual fitting
- Checkout

## URL Format

```
File location:  PAWFIT-Backend/public/models/labrador-blue-shirt.glb
URL to use:     /models/labrador-blue-shirt.glb

✅ Correct:   /models/labrador-blue-shirt.glb
❌ Wrong:     labrador-blue-shirt.glb
❌ Wrong:     http://localhost:5000/models/labrador-blue-shirt.glb
❌ Wrong:     ./public/models/labrador-blue-shirt.glb
```

## Troubleshooting

**Model not showing?**

- ✓ Check file is in `public/models/`
- ✓ Verify URL: `/models/filename.glb`
- ✓ Restart backend server
- ✓ Browser cache: Ctrl+Shift+Delete

**File not found (404)?**

- ✓ Check exact filename (case-sensitive)
- ✓ Use forward slashes: `/models/`
- ✓ Don't include `public/` in URL path

**Still stuck?**
See full guide: `STATIC_GLB_FILES_GUIDE.md`

## File Naming Convention

```
✅ labrador-blue-shirt.glb
✅ shih-tzu-pink-sweater.glb
✅ dachshund-winter-coat.glb

❌ model.glb
❌ model 1.glb
❌ MODEL.GLB
❌ labrador blue shirt.glb
```

## Example Complete Setup

```
Files created:
✓ PAWFIT-Backend/public/models/labrador-blue-shirt.glb
✓ PAWFIT-Backend/public/models/shih-tzu-pink-sweater.glb
✓ PAWFIT-Backend/public/models/dachshund-coat.glb

Admin dashboard entries:
✓ Name: "Labrador in Blue Shirt"
  URL: /models/labrador-blue-shirt.glb

✓ Name: "Shih Tzu in Pink Sweater"
  URL: /models/shih-tzu-pink-sweater.glb

✓ Name: "Dachshund in Coat"
  URL: /models/dachshund-coat.glb

Result:
✓ All models show in product pages
✓ All models available in virtual fitting
✓ All models preview in checkout
```

## That's It!

Your GLB files are now:

- ✅ Served by your backend
- ✅ Integrated with 3D viewer
- ✅ Available in admin dashboard
- ✅ Working in all pages
- ✅ No external services needed

For more details, see: `STATIC_GLB_FILES_GUIDE.md`
