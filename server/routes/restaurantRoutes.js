import express from "express";
import Restaurant from "../models/restaurantModel.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * POST /api/restaurant/details
 * Save or update restaurant details for the logged-in admin.
 */
// Save or update restaurant details (admin)
router.post("/details", verifyToken, async (req, res) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ message: "Unauthorized" });

    const { restaurantName, location, openTime, closeTime, availableTables } = req.body;

    let restaurant = await Restaurant.findOne({ adminId });

    if (restaurant) {
      // Update existing restaurant
      restaurant.restaurantName = restaurantName;
      restaurant.location = location;
      restaurant.openTime = openTime;
      restaurant.closeTime = closeTime;

      // If the admin updates the number of tables, rebuild table list
      if (restaurant.availableTables !== availableTables) {
        restaurant.availableTables = availableTables;
        restaurant.tables = Array.from({ length: availableTables }, (_, i) => ({
          number: i + 1,
          isBooked: false,
          bookedBy: "",
        }));
      }

      await restaurant.save();
    } else {
      // Create new restaurant with generated tables
      restaurant = await Restaurant.create({
        adminId,
        restaurantName,
        location,
        openTime,
        closeTime,
        availableTables,
        tables: Array.from({ length: availableTables }, (_, i) => ({
          number: i + 1,
          isBooked: false,
          bookedBy: "",
        })),
      });
    }

    res.status(200).json({ message: "Restaurant saved successfully!", restaurant });
  } catch (err) {
    console.error("❌ Error saving restaurant:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/**
 * GET /api/restaurant/details
 * Fetch restaurant details for the logged-in admin
 */
router.get("/details", verifyToken, async (req, res) => {
  try {
    const adminId = req.user?.id;
    const restaurant = await Restaurant.findOne({ adminId });
    if (!restaurant) return res.status(404).json({ message: "Not found" });

    res.status(200).json(restaurant);
  } catch (err) {
    console.error("Error fetching details:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/restaurant/all
 * Public route for users to view all restaurants
 */
router.get("/all", async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ restaurantName: 1 });
    res.status(200).json(restaurants);
  } catch (err) {
    console.error("Error fetching all restaurants:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/restaurant/reserve/:id
 * User reserves a specific table
 */
// Reserve a table (User)
router.post("/reserve/:restaurantId", verifyToken, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { tableNumber } = req.body;
    const userId = req.user?.id;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    const table = restaurant.tables.find((t) => t.number === tableNumber);
    if (!table) return res.status(400).json({ message: "Invalid table number" });
    if (table.isBooked)
      return res.status(400).json({ message: "This table is already booked" });

    // Mark table as booked
    table.isBooked = true;
    table.bookedBy = userId;
    await restaurant.save();

    res.status(200).json({ message: `Table ${tableNumber} booked successfully!` });
  } catch (err) {
    console.error("❌ Error reserving table:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
