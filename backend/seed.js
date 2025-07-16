const mongoose = require("mongoose");
const Product = require("./models/Product");
const Remedy = require("./models/Remedy");

const products = [
  {
    name: "Paracetamol",
    description: "Pain and fever reducer.",
    price: 20,
    symptoms: ["fever", "pain"],
    category: "fever",
    dosage: "500mg twice daily",
    sideEffects: ["nausea"],
    contraindications: ["liver disease"],
    image: "/medication-placeholder.jpg",
    inStock: true,
    rating: 4.5,
    reviewCount: 10,
  },
  {
    name: "Ibuprofen",
    description: "Anti-inflammatory painkiller.",
    price: 30,
    symptoms: ["pain", "inflammation"],
    category: "pain-relief",
    dosage: "400mg three times daily",
    sideEffects: ["stomach upset"],
    contraindications: ["ulcer"],
    image: "/medication-placeholder.jpg",
    inStock: true,
    rating: 4.2,
    reviewCount: 8,
  },
  {
    name: "Cetirizine",
    description: "Allergy relief tablet.",
    price: 15,
    symptoms: ["allergy", "sneezing"],
    category: "allergy",
    dosage: "10mg once daily",
    sideEffects: ["drowsiness"],
    contraindications: ["kidney disease"],
    image: "/medication-placeholder.jpg",
    inStock: true,
    rating: 4.0,
    reviewCount: 5,
  },
];

const remedies = [
  {
    name: "Ginger Tea",
    description: "Natural remedy for nausea and digestion.",
    price: 10,
    symptoms: ["nausea", "digestion"],
    category: "digestive",
    dosage: "1 cup after meals",
    sideEffects: [],
    contraindications: ["gallstones"],
    image: "/remedy-placeholder.jpg",
    inStock: true,
    rating: 4.8,
    reviewCount: 15,
  },
  {
    name: "Honey Lemon Drink",
    description: "Soothes sore throat and cough.",
    price: 12,
    symptoms: ["cough", "sore throat"],
    category: "cough-cold",
    dosage: "1 cup twice daily",
    sideEffects: [],
    contraindications: ["diabetes"],
    image: "/remedy-placeholder.jpg",
    inStock: true,
    rating: 4.7,
    reviewCount: 12,
  },
  {
    name: "Turmeric Milk",
    description: "Traditional anti-inflammatory drink.",
    price: 14,
    symptoms: ["inflammation", "pain"],
    category: "herbal",
    dosage: "1 cup at bedtime",
    sideEffects: [],
    contraindications: ["pregnancy"],
    image: "/remedy-placeholder.jpg",
    inStock: true,
    rating: 4.6,
    reviewCount: 9,
  },
];

async function seed() {
  await mongoose.connect(
    "mongodb+srv://dhruvvayugundla:DDD123ddd@cluster1.j4w98fr.mongodb.net/"
  );
  await Product.deleteMany({});
  await Remedy.deleteMany({});
  await Product.insertMany(products);
  await Remedy.insertMany(remedies);
  console.log("Database seeded!");
  mongoose.disconnect();
}

seed();
