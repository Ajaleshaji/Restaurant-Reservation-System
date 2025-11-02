import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  isBooked: { type: Boolean, default: false },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  userName: { type: String, default: "N/A" },
  userPhone: { type: String, default: "N/A" },
  reservationTime: { type: String, default: "N/A" },
});

const restaurantSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  restaurantName: { type: String, required: true },
  location: { type: String, required: true },
  openTime: String,
  closeTime: String,
  availableTables: { type: Number, required: true },
  tables: [tableSchema],
});

export default mongoose.model("Restaurant", restaurantSchema);
