const express = require("express");
const Remedy = require("../models/Remedy");

const router = express.Router();

// Get all remedies with filtering via URL parameters
router.get("/", async (req, res) => {
  try {
    const {
      search,
      category,
      symptoms,
      minPrice,
      maxPrice,
      sortBy = "name",
      sortOrder = "asc",
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (search) filter.$text = { $search: search };
    if (category && category !== "all") filter.category = category;
    if (symptoms) {
      const symptomArray = symptoms.split(",").map((s) => s.trim());
      filter.symptoms = { $in: symptomArray };
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const remedies = await Remedy.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    const total = await Remedy.countDocuments(filter);
    res.json({
      products: remedies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        hasNextPage: skip + remedies.length < total,
        hasPrevPage: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Remedies fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single remedy by ID
router.get("/:id", async (req, res) => {
  try {
    const remedy = await Remedy.findById(req.params.id);
    if (!remedy) {
      return res.status(404).json({ message: "Remedy not found" });
    }
    res.json(remedy);
  } catch (error) {
    console.error("Remedy fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all unique symptoms for filtering
router.get("/symptoms/all", async (req, res) => {
  try {
    const symptoms = await Remedy.distinct("symptoms");
    res.json(symptoms);
  } catch (error) {
    console.error("Remedy symptoms fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all categories for filtering
router.get("/categories/all", async (req, res) => {
  try {
    const categories = await Remedy.distinct("category");
    res.json(categories);
  } catch (error) {
    console.error("Remedy categories fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
