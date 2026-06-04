# Static GLB File Serving Guide

## Overview

GLB files are now served directly from your backend as **static assets**. No external file-sharing services needed. This approach is:
- ✅ Stable and reliable
- ✅ Under your control
- ✅ No external dependencies
- ✅ Easy to deploy
- ✅ Scalable

## Directory Structure

```
PAWFIT-Backend/
├── public/
│   ├── models/           ← GLB files go here
│   │   ├── labrador-blue-shirt.glb
│   │   ├── shih-tzu-pink-sweater.glb
│   │   └── dachshund-coat.glb
│   │
│   └── assets/           ← Thumbnails and previews go here
│       ├── labrador-blue-shirt-thumb.png
│       ├── shih-tzu-pink-sweater-thumb.png
│       └── dachshund-coat-thumb.png
```

## Step-by-Step Workflow

### 1. Prepare Your GLB Files

**File Requirements:**
- Format: GLB (binary glTF)
- Size: 1-3MB per file
- Name: Use descriptive, lowercase names with hyphens
  - ✅ Good: `labrador-blue-shirt.glb`
  - ✅ Good: `shih-tzu-winter-coat.glb`
  - ❌ Bad: `model.glb`
  - ❌ Bad: `Model 1.glb`

### 2. Add Files to Your Backend

**Copy GLB files to:** `PAWFIT-Backend/public/models/`

Example:
```
PAWFIT-Backend/public/models/
├── labrador-blue-shirt.glb
├── labrador-winter-coat.glb
├── shih-tzu-pink-sweater.glb
├── dachshund-red-shirt.glb
└── pomeranian-hoodie.glb
```

### 3. Optional: Add Thumbnail Images

Copy PNG/JPG preview images to: `PAWFIT-Backend/public/assets/`

Example:
```
PAWFIT-Backend/public/assets/
├── labrador-blue-shirt-thumb.png
├── shih-tzu-pink-sweater-thumb.png
└── dachshund-red-shirt-thumb.png
```

### 4. Use Admin Dashboard to Register Models

1. **Start your backend server:**
   ```bash
   cd PAWFIT-Backend
   npm start
   # Server runs on http://localhost:5000
   ```

2. **Go to Admin Dashboard:**
   - Navigate to Admin → 3D Assets
   - Click "Upload New Asset"

3. **Fill in the form:**

   **Asset Name:** `Labrador in Blue Shirt`
   
   **Asset Type:** `Pre-Combined Model`
   
   **Dog Breed:** `Labrador Retriever`
   
   **Apparel Type:** `Shirt`
   
   **Apparel Name:** `Premium Blue Tee`
   
   **GLB/glTF File URL:** `/models/labrador-blue-shirt.glb`
   
   **Thumbnail URL:** `/assets/labrador-blue-shirt-thumb.png`
   
   **Product ID:** (optional - link to product)

4. **Click "Upload Asset"**

5. **Model appears immediately** in:
   - Product pages
   - Virtual fitting
   - Checkout previews

## URL Formats

### During Development
```
Local Backend Running:
- Relative URL: /models/labrador-blue-shirt.glb
- Absolute URL: http://localhost:5000/models/labrador-blue-shirt.glb

These are equivalent - use relative URLs for flexibility
```

### In Production
```
Production Backend:
- Relative URL: /models/labrador-blue-shirt.glb
- Absolute URL: https://your-domain.com/models/labrador-blue-shirt.glb

Same relative path works everywhere!
```

## How Backend Serving Works

**Backend (Express):**
```javascript
// server.js
app.use('/models', express.static('public/models'))
app.use('/assets', express.static('public/assets'))
```

**File Mapping:**
```
File Location:     → URL Served As:
public/models/labrador-blue-shirt.glb  →  /models/labrador-blue-shirt.glb
public/assets/labrador-thumb.png       →  /assets/labrador-thumb.png
```

## Complete Example

### 1. Add Files to Backend

```
Copy these to PAWFIT-Backend/public/models/:
- labrador-blue-shirt.glb (2.1 MB)
- labrador-winter-coat.glb (1.8 MB)
- shih-tzu-pink-sweater.glb (0.9 MB)
- dachshund-red-shirt.glb (1.5 MB)

Copy these to PAWFIT-Backend/public/assets/:
- labrador-blue-shirt-thumb.png
- shih-tzu-pink-sweater-thumb.png
- dachshund-red-shirt-thumb.png
```

### 2. Register in Admin Dashboard

**Model 1:**
- Name: `Labrador in Blue Shirt`
- Type: `Pre-Combined Model`
- Breed: `Labrador Retriever`
- Apparel: `Shirt`
- Apparel Name: `Premium Blue Tee`
- **File URL:** `/models/labrador-blue-shirt.glb`
- **Thumbnail:** `/assets/labrador-blue-shirt-thumb.png`

**Model 2:**
- Name: `Labrador in Winter Coat`
- Type: `Pre-Combined Model`
- Breed: `Labrador Retriever`
- Apparel: `Coat`
- Apparel Name: `Waterproof Winter Coat`
- **File URL:** `/models/labrador-winter-coat.glb`
- **Thumbnail:** `/assets/labrador-winter-coat-thumb.png`

### 3. Models Work Everywhere

- ✅ Product Detail page shows 3D model
- ✅ Virtual Fitting displays model
- ✅ Checkout shows preview
- ✅ Order Confirmation verifies model

## Deployment

### For Production

**Option 1: Keep Backend Static Serving** (Recommended)
- GLB files stay in `public/models/`
- Same URL format works
- No changes needed in code
- Backend serves static files

**Option 2: Use CDN (Optional)**
- Upload `public/models/` to CDN
- Update URLs: `https://cdn.yoursite.com/models/labrador-blue-shirt.glb`
- For even faster delivery

### Git & Version Control

**.gitignore** (already configured):
```
public/models/
public/assets/
```

This keeps large binary files out of git. Instead:
1. Store files separately (on your deployment server)
2. Or sync during deployment
3. Or include in deployment archive

## Troubleshooting

### Model Not Found (404 Error)

**Check:**
1. File actually exists in `PAWFIT-Backend/public/models/`
2. Filename matches exactly (case-sensitive)
3. Backend server is running on port 5000
4. URL format is correct: `/models/filename.glb`

**Example:**
```
File: PAWFIT-Backend/public/models/labrador-blue-shirt.glb
URL:  /models/labrador-blue-shirt.glb  ✅ Correct
URL:  /models/Labrador-Blue-Shirt.glb  ❌ Wrong (case mismatch)
URL:  /labrador-blue-shirt.glb         ❌ Wrong (missing /models)
```

### File Upload Failing

1. Check file size (max 3MB recommended)
2. Ensure filename is valid (no spaces, special chars)
3. Verify permissions on `public/models/` folder
4. Restart backend after adding files

### Model Loads Slowly

1. Check file size (reduce to 1-2MB if possible)
2. Optimize polygon count in GLB file
3. Use lower texture resolution
4. Check network bandwidth

## File Naming Convention

Use this pattern for consistency:
```
{breed}-{apparel-type}-{color/style}.glb

Examples:
labrador-shirt-blue.glb
labrador-coat-winter.glb
shih-tzu-sweater-pink.glb
dachshund-hoodie-red.glb
pomeranian-shirt-designer.glb
mixed-breed-sweater-cozy.glb
```

## Managing Models

### Add New Model
1. Copy GLB file to `public/models/`
2. Optional: Add thumbnail to `public/assets/`
3. Use admin dashboard to register
4. Done!

### Update Existing Model
1. Replace file in `public/models/` (same filename)
2. Restart backend or let cache expire
3. Model updates automatically

### Delete Model
1. Remove file from `public/models/`
2. Optional: Delete thumbnail from `public/assets/`
3. Remove record from admin dashboard

## Best Practices

✅ **Use relative URLs:** `/models/filename.glb`
- Works in dev and production
- No hardcoded domain names
- Easy to move between servers

✅ **Descriptive filenames:** `labrador-blue-shirt.glb`
- Easy to manage
- Clear what's what
- Helps with version control

✅ **Optimize file sizes:** 1-2MB per model
- Faster loading
- Better user experience
- Saves bandwidth

✅ **Keep backup:** Store originals separately
- Binary files not ideal for git
- Keep master copies elsewhere
- Sync during deployment

✅ **Document your models:** Use admin form
- Name, breed, apparel type
- Link to products
- Add thumbnails
- Makes management easier

## Scaling

If you have many models:

**Option 1: Keep Growing**
- Keep adding to `public/models/`
- Works for 100+ files
- Simple to manage

**Option 2: Use CDN**
- Upload to Cloudflare, AWS, etc.
- Change URLs in admin
- Faster global delivery

**Option 3: Organize by Breed**
```
public/models/
├── labrador/
│   ├── blue-shirt.glb
│   └── winter-coat.glb
├── shih-tzu/
│   ├── pink-sweater.glb
│   └── designer-shirt.glb
└── ...
```

Update admin URLs accordingly: `/models/labrador/blue-shirt.glb`

## Support

**Backend not serving files?**
1. Check `app.use('/models', express.static('public/models'))` in server.js
2. Verify `public/models/` folder exists
3. Check file permissions

**URL format confusion?**
- Use: `/models/filename.glb`
- Not: `./public/models/filename.glb`
- Not: `https://example.com/models/filename.glb`

**Files not updating?**
- Restart backend server
- Check browser cache (Ctrl+Shift+Delete)
- Verify file was actually copied
