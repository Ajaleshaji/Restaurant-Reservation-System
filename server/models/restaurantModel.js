import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
  number: Number,
  isBooked: { type: Boolean, default: false },
  bookedBy: { type: String, default: "" },
});

const restaurantSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  restaurantName: String,
  location: String,
  openTime: String,
  closeTime: String,
  availableTables: Number,
  tables: [tableSchema], // 👈 stores all table details
});

export default mongoose.model("Restaurant", restaurantSchema);
