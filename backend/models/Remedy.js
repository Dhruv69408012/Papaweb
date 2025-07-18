const mongoose = require("mongoose");

const remedySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  ingredients: { type: String, required: true },
  procedure: { type: String, required: true },
  application: { type: String, required: true },
  duration: { type: String, required: true },
  precautions: { type: String },
  modificationIfAny: { type: String },
  prescribedAgeGroup: { type: String },
  symptoms: [{ type: String, required: true }],
  price: { type: Number, required: true, min: 0 },
});

module.exports = mongoose.model("Remedy", remedySchema);
