import express from "express";
import Restaurant from "../models/restaurantModel.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * POST /api/restaurant/details
 * Save or update restaurant details (Admin only)
 */
router.post("/details", verifyToken, async (req, res) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ message: "Unauthorized" });

    const { restaurantName, location, openTime, closeTime, availableTables } = req.body;

    let restaurant = await Restaurant.findOne({ adminId });

    // Rebuild tables array safely
    const createTablesArray = (count) =>
      Array.from({ length: count }, (_, i) => ({
        number: i + 1,
        isBooked: false,
        bookedBy: null, // ✅ null not ""
        userName: "N/A",
        userPhone: "N/A",
        reservationTime: "N/A",
      }));

    if (restaurant) {
      restaurant.restaurantName = restaurantName;
      restaurant.location = location;
      restaurant.openTime = openTime;
      restaurant.closeTime = closeTime;

      // Rebuild if count changed
      if (restaurant.availableTables !== availableTables) {
        restaurant.availableTables = availableTables;
        restaurant.tables = createTablesArray(availableTables);
      }

      await restaurant.save();
    } else {
      restaurant = await Restaurant.create({
        adminId,
        restaurantName,
        location,
        openTime,
        closeTime,
        availableTables,
        tables: createTablesArray(availableTables),
      });
    }

    res.status(200).json({ message: "✅ Restaurant saved successfully!", restaurant });
  } catch (err) {
    console.error("❌ Error saving restaurant:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/restaurant/details
 * Get restaurant details for admin
 */
router.get("/details", verifyToken, async (req, res) => {
  try {
    const adminId = req.user?.id;
    const restaurant = await Restaurant.findOne({ adminId });
    if (!restaurant) return res.status(404).json({ message: "Not found" });
    res.status(200).json(restaurant);
  } catch (err) {
    console.error("❌ Error fetching details:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/restaurant/all
 * Public route — List all restaurants for users
 */
router.get("/all", async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ restaurantName: 1 });
    res.status(200).json(restaurants);
  } catch (err) {
    console.error("❌ Error fetching all restaurants:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/restaurant/reserve/:id
 * Reserve a table (User)
 */
router.post("/reserve/:id", verifyToken, async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const userId = req.user?.id;
    const { tableNumber, userName, userPhone, reservationTime } = req.body;

    if (!tableNumber || !userName || !userPhone || !reservationTime) {
      return res.status(400).json({ message: "Missing reservation details" });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const tableIndex = restaurant.tables.findIndex(
      (t) => t.number === Number(tableNumber)
    );
    if (tableIndex === -1) {
      return res.status(404).json({ message: "Table not found" });
    }

    const table = restaurant.tables[tableIndex];
    if (table.isBooked) {
      return res.status(400).json({ message: "Table already booked" });
    }

    // ✅ Update booking details
     restaurant.tables[tableIndex].isBooked = true;
    restaurant.tables[tableIndex].bookedBy = userId;
    restaurant.tables[tableIndex].userName = userName;
    restaurant.tables[tableIndex].userPhone = userPhone;
    restaurant.tables[tableIndex].reservationTime = reservationTime;

    await restaurant.save();

    res.status(200).json({ message: "✅ Table reserved successfully!" });
  } catch (err) {
    console.error("❌ Reservation error:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
});

// CANCEL TABLE BOOKING (User)
// ✅ Get all bookings for the logged-in user




export default router;  