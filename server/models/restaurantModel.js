import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin", // Assumes you have an "Admin" model
    required: true,
    unique: true, // Added unique: true, as one admin should only have one restaurant
  },
  restaurantName: { type: String, required: true },
  location: { type: String, required: true },
  openTime: { type: String, required: true },
  closeTime: { type: String, required: true },
  availableTables: { type: Number, required: true },
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;