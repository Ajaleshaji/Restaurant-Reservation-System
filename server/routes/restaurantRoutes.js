// routes/restaurantRoutes.js
import express from "express";
import Restaurant from "../models/restaurantModel.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // make sure verifyToken is exported from authMiddleware

const router = express.Router();

/**
 * POST /api/restaurant/details
 * Save or update restaurant details for the logged-in admin.
 * Protected by verifyToken (assumes verifyToken sets req.user = { id: ... })
 */
router.post("/details", verifyToken, async (req, res) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ message: "Unauthorized" });

    const { restaurantName, location, openTime, closeTime, availableTables } = req.body;

    // find and update or create (upsert)
    const restaurant = await Restaurant.findOneAndUpdate(
      { adminId },
      {
        $set: {
          restaurantName,
          location,
          openTime,
          closeTime,
          availableTables,
          adminId, // ensure adminId is present on creation
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({ message: "Restaurant details saved successfully!", restaurant });
  } catch (err) {
    console.error("❌ Error saving restaurant details:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/restaurant/details
 * Fetch restaurant details for the logged-in admin.
 * Protected route.
 */
router.get("/details", verifyToken, async (req, res) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ message: "Unauthorized" });

    const restaurant = await Restaurant.findOne({ adminId });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    return res.status(200).json(restaurant);
  } catch (err) {
    console.error("❌ Error fetching restaurant details:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/restaurant/all
 * Public endpoint — returns all restaurants (for user dashboard).
 */
router.get("/all", async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ restaurantName: 1 });
    return res.status(200).json(restaurants);
  } catch (err) {
    console.error("❌ Error fetching all restaurants:", err);
    return res.status(500).json({ message: "Failed to fetch restaurants" });
  }
});

export default router;
