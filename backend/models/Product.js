const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  symptoms: [
    {
      type: String,
      required: true,
    },
  ],
  category: {
    type: String,
    required: true,
    enum: [
      "pain-relief",
      "fever",
      "cough-cold",
      "allergy",
      "digestive",
      "vitamins",
      "other",
    ],
  },
  dosage: {
    type: String,
    required: true,
  },
  sideEffects: [
    {
      type: String,
    },
  ],
  contraindications: [
    {
      type: String,
    },
  ],
  image: {
    type: String,
    default: "/medication-placeholder.jpg",
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for better search performance
productSchema.index({ name: "text", description: "text", symptoms: "text" });

module.exports = mongoose.model("Product", productSchema);
