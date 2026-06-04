# PawFit 3D Models Setup Guide

## Overview

This guide explains how to set up and load pre-combined 3D models for the PawFit virtual fitting system. Pre-combined models are 3D assets where a dog is already wearing specific apparel (e.g., a Labrador wearing a blue shirt).

## Architecture

### Model Types

1. **Avatar Models**: Individual dog models (without apparel)
   - Type: `avatar`
   - Example: Labrador, Shih Tzu, Dachshund, etc.

2. **Apparel Models**: Individual clothing items (can overlay on avatars)
   - Type: `apparel`
   - Example: Shirts, Coats, Sweaters, Hoodies

3. **Pre-Combined Models** (NEW):
   - Type: `pre-combined`
   - Single 3D model with dog wearing apparel
   - No dynamic composition needed
   - Faster rendering, better visual quality

## Database Schema

### Asset3D Model Structure

```javascript
{
  type: 'pre-combined',
  name: "Labrador in Blue Shirt",
  description: "A Labrador Retriever wearing a premium blue shirt",
  
  // Pre-combined specific fields
  preCombinedInfo: {
    dogBreed: "Labrador Retriever",
    apparelType: "Shirt",
    apparelName: "Premium Blue Tee"
  },
  
  // File and display info
  fileUrl: "https://your-cdn.com/labrador-blue-shirt.glb",
  thumbnailUrl: "https://your-cdn.com/labrador-blue-shirt-thumb.png",
  format: "glb",
  
  // Linking to products
  productId: "ObjectId of the product",
  
  // Standard metadata
  breed: "Labrador Retriever",
  apparelType: "Shirt",
  scale: 1.0,
  tags: ["labrador", "shirt", "blue"],
  
  uploadedBy: "userId",
  isActive: true,
  createdAt: "2026-04-20T10:00:00Z"
}
```

## Loading Sample Models

### Option 1: Admin Dashboard Upload

1. Go to **Admin Panel** → **3D Assets**
2. Click **"Upload New Asset"**
3. Select **"Pre-Combined Model"** as the Asset Type
4. Fill in the form:
   - **Asset Name**: e.g., "Labrador in Blue Shirt"
   - **Description**: What the model represents
   - **Dog Breed**: Select the breed (Labrador Retriever, Shih Tzu, etc.)
   - **Apparel Type**: Select clothing type (Shirt, Coat, Sweater, Hoodie)
   - **Apparel Name**: Product name (e.g., "Premium Blue Tee")
   - **GLB/glTF File URL**: Link to your 3D model file
   - **Thumbnail URL**: Preview image (optional)
   - **Product ID**: Link to a product in catalog (optional)
5. Click **"Upload Asset"**

### Option 2: API Direct Upload

```bash
POST /api/assets3d/create
Authorization: Bearer {token}

{
  "name": "Labrador in Blue Shirt",
  "description": "A Labrador wearing premium blue shirt",
  "type": "pre-combined",
  "breed": "Labrador Retriever",
  "apparelType": "Shirt",
  "fileUrl": "https://your-cdn.com/labrador-blue-shirt.glb",
  "thumbnailUrl": "https://your-cdn.com/labrador-blue-shirt-thumb.png",
  "scale": 1.0,
  "productId": "product_id_here",
  "preCombinedInfo": {
    "dogBreed": "Labrador Retriever",
    "apparelType": "Shirt",
    "apparelName": "Premium Blue Tee"
  }
}
```

### Option 3: MongoDB Direct Insert (Development Only)

```javascript
db.asset3ds.insertMany([
  {
    name: "Labrador in Premium Tee",
    description: "Labrador Retriever wearing a premium blue shirt",
    type: "pre-combined",
    breed: "Labrador Retriever",
    apparelType: "Shirt",
    fileUrl: "https://your-cdn.com/labrador-blue-shirt.glb",
    thumbnailUrl: "https://your-cdn.com/labrador-blue-shirt-thumb.png",
    format: "glb",
    scale: 1.0,
    productId: ObjectId("product_id"),
    preCombinedInfo: {
      dogBreed: "Labrador Retriever",
      apparelType: "Shirt",
      apparelName: "Premium Blue Tee"
    },
    uploadedBy: ObjectId("admin_user_id"),
    isActive: true,
    tags: ["labrador", "shirt", "blue"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // ... more models
])
```

## Sample Model Data

Here are example pre-combined models you can create:

### Labrador Models

1. **Labrador + Blue Shirt**
   ```
   Name: Labrador in Blue Shirt
   Breed: Labrador Retriever
   Apparel: Shirt
   Product: Premium Blue Tee
   ```

2. **Labrador + Winter Coat**
   ```
   Name: Labrador in Winter Coat
   Breed: Labrador Retriever
   Apparel: Coat
   Product: Waterproof Winter Coat
   ```

3. **Labrador + Hoodie**
   ```
   Name: Labrador in Cozy Hoodie
   Breed: Labrador Retriever
   Apparel: Hoodie
   Product: Cozy Fleece Hoodie
   ```

### Shih Tzu Models

1. **Shih Tzu + Pink Sweater**
   ```
   Name: Shih Tzu in Pink Sweater
   Breed: Shih Tzu
   Apparel: Sweater
   Product: Soft Pink Sweater
   ```

2. **Shih Tzu + Shirt**
   ```
   Name: Shih Tzu in Designer Shirt
   Breed: Shih Tzu
   Apparel: Shirt
   Product: Designer Luxury Shirt
   ```

### Other Breeds

Similar models for:
- Dachshund
- Pomeranian
- Aspin/Mixed breeds

## File Format & Requirements

### GLB File Requirements

- **Format**: GLB (binary glTF) or glTF (recommended: GLB for smaller file size)
- **Maximum File Size**: 5MB per model
- **Recommended File Size**: 1-2MB
- **Polygon Count**: 50k-100k triangles
- **Texture Resolution**: 2048x2048 or lower

### Optimization Tips

1. **Use GLB format** - Smaller file size than glTF
2. **Bake textures** - Combine materials into single textures
3. **Limit bones** - Keep skeletal structure minimal
4. **Remove unused data** - Trim unused vertices/bones
5. **Use LOD (Level of Detail)** - Provide lower-poly versions for loading

## Integration Points

### Where Pre-Combined Models are Used

1. **Product Detail Page**
   - Shows 3D preview when viewing a product
   - Looks for pre-combined model matching product

2. **Virtual Fitting Page**
   - Displays model when user selects a product
   - Auto-loads breed-specific pre-combined model
   - Falls back to avatar + apparel if no pre-combined available

3. **Checkout Page**
   - Displays small 3D preview of each cart item
   - Shows pre-combined model if available

4. **Order Confirmation Page**
   - Shows 3D previews of ordered items
   - Helps customer verify their purchase

## API Endpoints

### Get Pre-Combined Models

```bash
# Get all pre-combined models for a breed and apparel type
GET /api/assets3d/type-breed/pre-combined/{breed}?apparelType=Shirt

# Get pre-combined models for a specific product
GET /api/assets3d?type=pre-combined&productId={productId}

# Get all pre-combined models
GET /api/assets3d?type=pre-combined
```

### Create/Update Models

```bash
# Create new pre-combined model
POST /api/assets3d/create

# Update existing model
PUT /api/assets3d/{modelId}

# Delete model
DELETE /api/assets3d/{modelId}
```

## Troubleshooting

### Model Not Showing

1. Check that model `type` is set to `pre-combined`
2. Verify `breed` and `apparelType` match your selection
3. Ensure `fileUrl` is publicly accessible
4. Check browser console for loading errors

### Model Looks Wrong

1. Verify GLB file is valid (open in three.js editor)
2. Check model scale matches viewer expectations
3. Ensure model is properly oriented (Y-up)
4. Check material/texture loading in browser DevTools

### Performance Issues

1. Reduce polygon count in GLB file
2. Lower texture resolution (1024x1024)
3. Use GLB instead of glTF
4. Check browser network tab for slow loads

## Best Practices

1. **Consistent Naming**: Use clear, descriptive names
   - ❌ Bad: "model123"
   - ✅ Good: "Labrador in Blue Shirt"

2. **Breed Consistency**: Always specify correct breed
   - Helps with filtering and virtual fitting

3. **Link to Products**: Connect models to product catalog
   - Enables automatic model loading on product pages

4. **Thumbnail Images**: Provide preview thumbnails
   - Improves admin interface UX

5. **Version Control**: Keep track of model versions
   - Update `version` field when making changes

6. **Testing**: Test in all three views
   - Product Detail page
   - Virtual Fitting page
   - Checkout page

## Migration from Separate Models

If you have existing separate avatar and apparel models:

1. **Keep the originals** - They're still useful as fallback
2. **Create new pre-combined versions** - For better performance
3. **Link by product** - Use `productId` field
4. **Test compatibility** - Ensure models work in all views

## Next Steps

1. Prepare your 3D model files (GLB format)
2. Upload to CDN or file hosting service
3. Use Admin Dashboard to register models
4. Test in virtual fitting system
5. Monitor user feedback and iterate

## Support

For issues with 3D models:
- Check if GLB file is valid
- Verify file is publicly accessible
- Ensure metadata matches expectations
- Review browser console for errors
