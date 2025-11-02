import express from "express";
import Restaurant from "../models/restaurantModel.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ------------------------------------------------------------
   ✅ Add or Update Restaurant Details (Admin Only)
------------------------------------------------------------ */
router.post("/details", verifyToken, async (req, res) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ message: "Unauthorized" });

    const { restaurantName, location, openTime, closeTime, availableTables } = req.body;

    let restaurant = await Restaurant.findOne({ adminId });

    // Helper to rebuild tables array
    const createTablesArray = (count) =>
      Array.from({ length: count }, (_, i) => ({
        number: i + 1,
        isBooked: false,
        userId: null,
        userName: "N/A",
        userPhone: "N/A",
        reservationTime: "N/A",
      }));

    if (restaurant) {
      // Update existing details
      restaurant.restaurantName = restaurantName;
      restaurant.location = location;
      restaurant.openTime = openTime;
      restaurant.closeTime = closeTime;

      if (restaurant.availableTables !== availableTables) {
        restaurant.availableTables = availableTables;
        restaurant.tables = createTablesArray(availableTables);
      }

      await restaurant.save();
    } else {
      // Create new restaurant
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

/* ------------------------------------------------------------
   ✅ Get Restaurant Details (Admin)
------------------------------------------------------------ */
router.get("/details", verifyToken, async (req, res) => {
  try {
    const adminId = req.user?.id;
    const restaurant = await Restaurant.findOne({ adminId });

    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });

    res.status(200).json(restaurant);
  } catch (err) {
    console.error("❌ Error fetching restaurant:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------------------------------------------------
   ✅ Get All Restaurants (Public)
------------------------------------------------------------ */
router.get("/all", async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ restaurantName: 1 });
    res.status(200).json(restaurants);
  } catch (err) {
    console.error("❌ Error fetching all restaurants:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------------------------------------------------
   ✅ Reserve a Table (User)
------------------------------------------------------------ */
router.post("/reserve/:id", verifyToken, async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const userId = req.user?.id;
    const { tableNumber, userName, userPhone, reservationTime } = req.body;

    if (!tableNumber || !userName || !userPhone || !reservationTime) {
      return res.status(400).json({ message: "Missing reservation details" });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });

    const tableIndex = restaurant.tables.findIndex(
      (t) => t.number === Number(tableNumber)
    );

    if (tableIndex === -1)
      return res.status(404).json({ message: "Table not found" });

    if (restaurant.tables[tableIndex].isBooked)
      return res.status(400).json({ message: "Table already booked" });

    // ✅ Book table
    restaurant.tables[tableIndex].isBooked = true;
    restaurant.tables[tableIndex].bookedBy = userId;
    restaurant.tables[tableIndex].userName = userName;
    restaurant.tables[tableIndex].userPhone = userPhone;
    restaurant.tables[tableIndex].reservationTime = reservationTime;

    console.log("📝 Booking table:", restaurant);

    await restaurant.save();

    res.status(200).json({ message: "✅ Table reserved successfully!" });
  } catch (err) {
    console.error("❌ Reservation error:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

/* ------------------------------------------------------------
   ✅ Get User’s Bookings
------------------------------------------------------------ */
router.get("/mybookings", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const restaurants = await Restaurant.find({ "tables.bookedBy": userId });

    const myBookings = [];

    restaurants.forEach((restaurant) => {
      restaurant.tables.forEach((table) => {
        if (table.bookedBy?.toString() === userId) {
          myBookings.push({
            bookingId: `${restaurant._id}_${table.number}`, // unique ID
            restaurantId: restaurant._id,
            restaurantName: restaurant.restaurantName,
            restaurantLocation: restaurant.location,
            tableNumber: table.number,
            reservationTime: table.reservationTime,
          });
        }
      });
    });

    res.status(200).json(myBookings);
  } catch (err) {
    console.error("❌ Error fetching bookings:", err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});


/* ------------------------------------------------------------
   ✅ Cancel a Reservation (User)
------------------------------------------------------------ */
/* ------------------------------------------------------------
   ✅ Cancel a Reservation (User)
------------------------------------------------------------ */
router.delete("/cancel/:bookingId", verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    // Extract restaurantId and tableNumber from bookingId
    const [restaurantId, tableNumberStr] = bookingId.split("_");
    const tableNumber = parseInt(tableNumberStr);

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    const table = restaurant.tables.find((t) => t.number === tableNumber);
    if (!table) return res.status(404).json({ message: "Table not found" });

    if (!table.isBooked || table.bookedBy?.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only cancel your own reservations" });
    }

    // Reset booking details
    table.isBooked = false;
    table.bookedBy = null;
    table.userName = "N/A";
    table.userPhone = "N/A";
    table.reservationTime = "N/A";

    await restaurant.save();

    res.status(200).json({ message: "✅ Reservation cancelled successfully!" });
  } catch (err) {
    console.error("❌ Error cancelling booking:", err);
    res.status(500).json({ message: "Server error" });
  }
});



export default router;
