import { cloudinaryUpload } from '../../../lib/cloudinaryUpload.js';
// Your helper for consistent responses
// import fs from 'fs';
import Item from './content.model.js';
import Header from './header.model.js';
import { generateResponse } from '../../../lib/responseFormate.js';

/**
 * Create Item
 * Accepts: title, subtitle, type + image file
 * Expects multerUpload([{ name: "image", maxCount: 1 }])
 */

export const createItem = async (req, res) => {
  try {
    let { title, subtitle, type, prompt, color } = req.body;
    // Always store type in lowercase and trimmed for consistency
    if (type) type = type.trim().toLowerCase();

    // Check if image exists
    const file = req.files?.image?.[0];
    if (!file) {
      return generateResponse(res, 400, false, 'Item image is required');
    }

    // Upload main image to Cloudinary
    const sanitizedTitle = `${title.replace(/\s+/g, '-')}-${Date.now()}`;
    const result = await cloudinaryUpload(file.path, sanitizedTitle, 'items');

    // Upload gallery images (optional)
    const galleryFiles = req.files?.gallery || [];
    const gallery = [];
    for (const galleryFile of galleryFiles) {
      const galleryTitle = `${title.replace(/\s+/g, '-')}-gallery-${Date.now()}`;
      const galleryResult = await cloudinaryUpload(
        galleryFile.path,
        galleryTitle,
        'items'
      );
      gallery.push(galleryResult.url);
    }

    // Create DB entry
    const newItem = await Item.create({
      title,
      subtitle,
      type,
      prompt,
      color,
      image: result.url,
      gallery
    });

    return generateResponse(
      res,
      201,
      true,
      'Item created successfully',
      newItem
    );
  } catch (error) {
    console.error('Create Item Error:', error);
    return generateResponse(
      res,
      500,
      false,
      error.message || 'Failed to create item'
    );
  }
};
/**
 * Get all items
 */
export const getAllItems = async (req, res) => {
  try {
    // Get type from query string
    const { type } = req.query;

    // Build filter object
    const filter = {};
    if (type) filter.type = type.trim().toLowerCase();

    // Fetch items matching the filter
    const items = await Item.find(filter);

    return generateResponse(
      res,
      200,
      true,
      'Items fetched successfully',
      items
    );
  } catch (error) {
    console.error(error);
    return generateResponse(res, 500, false, 'Failed to fetch items');
  }
};

/**
 * Get item by ID
 */
export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return generateResponse(res, 404, false, 'Item not found');
    return generateResponse(res, 200, true, 'Item fetched successfully', item);
  } catch (error) {
    console.error(error);
    return generateResponse(res, 500, false, 'Failed to fetch item');
  }
};

/**
 * Update item
 */
// export const updateItem = async (req, res) => {
//   try {
//     let { title, subtitle, type, color, prompt } = req.body;
//     // Always store type in lowercase and trimmed for consistency
//     if (type) type = type.trim().toLowerCase();

//     const updateData = { title, subtitle, type, color };
//     if (prompt !== undefined) updateData.prompt = prompt;

//     if (req.files?.image && req.files.image[0]) {
//       const file = req.files.image[0];
//       const sanitizedTitle = `${title?.replace(/\s+/g, '-') || 'item'}-${Date.now()}`;

//       const cloudinaryResult = await cloudinaryUpload(
//         file.path,
//         sanitizedTitle,
//         'items'
//       );
//       updateData.image = cloudinaryResult.url;
//     }

//     if (req.files?.gallery && req.files.gallery.length > 0) {
//       const gallery = [];
//       for (const galleryFile of req.files.gallery) {
//         const galleryTitle = `${title?.replace(/\s+/g, '-') || 'item'}-gallery-${Date.now()}`;
//         const galleryResult = await cloudinaryUpload(
//           galleryFile.path,
//           galleryTitle,
//           'items'
//         );
//         gallery.push(galleryResult.url);
//       }
//       updateData.gallery = gallery;
//     }

//     const updatedItem = await Item.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true }
//     );
//     if (!updatedItem)
//       return generateResponse(res, 404, false, 'Item not found');

//     return generateResponse(
//       res,
//       200,
//       true,
//       'Item updated successfully',
//       updatedItem
//     );
//   } catch (error) {
//     console.error(error);
//     return generateResponse(res, 500, false, 'Failed to update item');
//   }
// };

export const updateItem = async (req, res) => {
  try {
    let { title, subtitle, type, color, prompt } = req.body;
    if (type) type = type.trim().toLowerCase();

    const updateData = {};

    // ✅ Only add fields that are actually provided
    if (title    !== undefined) updateData.title    = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (type     !== undefined) updateData.type     = type;
    if (color    !== undefined) updateData.color    = color;
    if (prompt   !== undefined) updateData.prompt   = prompt;

    // ✅ Fetch existing item first so we can preserve old images if needed
    const existingItem = await Item.findById(req.params.id);
    if (!existingItem) return generateResponse(res, 404, false, "Item not found");

    // ✅ Handle single image upload
    if (req.files?.image && req.files.image[0]) {
      const file          = req.files.image[0];
      const sanitizedTitle = `${(title || existingItem.title).replace(/\s+/g, "-")}-${Date.now()}`;

      const cloudinaryResult = await cloudinaryUpload(file.path, sanitizedTitle, "items");
      updateData.image = cloudinaryResult.url;
    }

    // ✅ Handle gallery — support three modes via req.body.galleryAction
    // galleryAction: "replace" | "append" | "remove"  (default: "append")
    if (req.files?.gallery && req.files.gallery.length > 0) {
      const uploadedUrls = [];

      // ✅ Upload in parallel instead of sequential for loop
      await Promise.all(
        req.files.gallery.map(async (galleryFile) => {
          const galleryTitle = `${(title || existingItem.title).replace(/\s+/g, "-")}-gallery-${Date.now()}`;
          const galleryResult = await cloudinaryUpload(galleryFile.path, galleryTitle, "items");
          uploadedUrls.push(galleryResult.url);
        })
      );

      const galleryAction = req.body.galleryAction || "append";

      if (galleryAction === "replace") {
        // Wipe old gallery and set new one
        updateData.gallery = uploadedUrls;
      } else {
        // ✅ Append new images to existing gallery
        updateData.gallery = [...existingItem.gallery, ...uploadedUrls];
      }
    }

    // ✅ Handle gallery item removal by index or URL
    // Send: { removeGalleryUrls: ["url1", "url2"] }
    if (req.body.removeGalleryUrls) {
      const toRemove        = Array.isArray(req.body.removeGalleryUrls)
        ? req.body.removeGalleryUrls
        : [req.body.removeGalleryUrls];
      const currentGallery  = updateData.gallery || existingItem.gallery;
      updateData.gallery    = currentGallery.filter((url) => !toRemove.includes(url));
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },   // ✅ $set prevents wiping untouched fields
      { new: true, runValidators: true }
    );

    return generateResponse(res, 200, true, "Item updated successfully", updatedItem);
  } catch (error) {
    console.error("[updateItem]", error);
    return generateResponse(res, 500, false, "Failed to update item");
  }
};


/**
 * Delete item
 */
export const deleteItem = async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem)
      return generateResponse(res, 404, false, 'Item not found');

    return generateResponse(res, 200, true, 'Item deleted successfully');
  } catch (error) {
    console.error(error);
    return generateResponse(res, 500, false, 'Failed to delete item');
  }
};

// ==================== HEADER CONTROLLERS ====================

/**
 * Create or Update Header (upsert - only one header exists)
 */
export const createOrUpdateHeader = async (req, res) => {
  try {
    const { title, subtitle } = req.body;

    if (!title) {
      return generateResponse(res, 400, false, 'Title is required');
    }

    // Upsert: update if exists, create if not
    const header = await Header.findOneAndUpdate(
      {},
      { title, subtitle },
      { new: true, upsert: true }
    );

    return generateResponse(
      res,
      200,
      true,
      'Header saved successfully',
      header
    );
  } catch (error) {
    console.error('Create/Update Header Error:', error);
    return generateResponse(
      res,
      500,
      false,
      error.message || 'Failed to save header'
    );
  }
};

/**
 * Get Header
 */
export const getHeader = async (req, res) => {
  try {
    const header = await Header.findOne();
    if (!header) {
      return generateResponse(res, 404, false, 'Header not found');
    }
    return generateResponse(
      res,
      200,
      true,
      'Header fetched successfully',
      header
    );
  } catch (error) {
    console.error('Get Header Error:', error);
    return generateResponse(res, 500, false, 'Failed to fetch header');
  }
};

/**
 * Get distinct types
 * GET /admin/content/types/list
 */
export const getDistinctTypes = async (req, res) => {
  try {
    const types = await Item.distinct('type');
    return generateResponse(
      res,
      200,
      true,
      'Types fetched successfully',
      types
    );
  } catch (error) {
    console.error('Get Distinct Types Error:', error);
    return generateResponse(res, 500, false, 'Failed to fetch types');
  }
};
