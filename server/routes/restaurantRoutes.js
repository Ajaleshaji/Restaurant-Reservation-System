import express from "express";
import Restaurant from "../models/restaurantModel.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Save or Update restaurant details
router.post("/details", verifyToken, async (req, res) => {
  try {
    const adminId = req.user.id;
    const { restaurantName, location, openTime, closeTime, availableTables } = req.body;

    // Find by adminId and update.
    // 'upsert: true' creates a new doc if one doesn't exist for this adminId.
    const restaurant = await Restaurant.findOneAndUpdate(
      { adminId: adminId },
      {
        $set: {
          restaurantName,
          location,
          openTime,
          closeTime,
          availableTables,
          adminId, // Ensures adminId is set on creation
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ message: "Restaurant details saved successfully!", restaurant });
  } catch (err) {
    console.error("❌ Error saving restaurant details:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Fetch restaurant details for *logged-in* admin
router.get("/details", verifyToken, async (req, res) => {
  try {
    // This is the key: It *only* finds the restaurant matching the token's adminId
    const restaurant = await Restaurant.findOne({ adminId: req.user.id });
    
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (err) {
    console.error("❌ Error fetching restaurant details:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;