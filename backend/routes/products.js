const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// Get all products with filtering via URL parameters
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

    // Build filter object
    const filter = {};

    // Search filter
    if (search) {
      filter.$text = { $search: search };
    }

    // Category filter
    if (category && category !== "all") {
      filter.category = category;
    }

    // Symptoms filter
    if (symptoms) {
      const symptomArray = symptoms.split(",").map((s) => s.trim());
      filter.symptoms = { $in: symptomArray };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        hasNextPage: skip + products.length < total,
        hasPrevPage: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Products fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Product fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all unique symptoms for filtering
router.get("/symptoms/all", async (req, res) => {
  try {
    const symptoms = await Product.distinct("symptoms");
    res.json(symptoms);
  } catch (error) {
    console.error("Symptoms fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all categories for filtering
router.get("/categories/all", async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json(categories);
  } catch (error) {
    console.error("Categories fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
