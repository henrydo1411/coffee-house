import mongoose from "mongoose";
const itemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: "" },
  quantity: { type: Number, required: true, min: 1 },
  size: { type: String, enum: ["Small", "Medium", "Large"] },
  sugarLevel: { type: String, enum: ["0%", "50%", "100%"] },
  iceLevel: { type: String, enum: ["No Ice", "Less Ice", "Normal Ice"] },
  topping: { type: String, enum: ["None", "Pearl", "Cream"] },
  note: { type: String, default: "" },
});
const schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerAddress: { type: String, required: true, trim: true },
    note: { type: String, default: "" },
    items: { type: [itemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["COD"], default: "COD" },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true },
);
schema.index({ user: 1, createdAt: -1 });
schema.index({ createdAt: -1 });
schema.index({ status: 1, createdAt: -1 }); // khi admin lọc đơn theo trạng thái
export default mongoose.model("Order", schema);
