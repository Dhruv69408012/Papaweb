"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Filter,
  Star,
  ShoppingCart,
  Heart,
  Pill,
  ChevronDown,
} from "lucide-react";
import { remediesAPI } from "@/utils/api";
import "../globals.css";

interface Remedy {
  _id: string;
  name: string;
  price: number;
  rating: number;
  category: string;
  symptoms: string[];
  description: string;
  dosage: string;
  sideEffects: string[];
  contraindications: string[];
  inStock: boolean;
  reviewCount: number;
}

export default function Remedies() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRemedies: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showSymptomsDropdown, setShowSymptomsDropdown] = useState(false);
  const [selectedRemedies, setSelectedRemedies] = useState<string[]>([]);

  // Get current URL parameters
  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "all";
  const currentSymptoms = searchParams.get("symptoms") || "";
  const currentSortBy = searchParams.get("sortBy") || "name";
  const currentSortOrder = searchParams.get("sortOrder") || "asc";
  const currentPage = parseInt(searchParams.get("page") || "1");

  // Sync selectedSymptoms with URL
  useEffect(() => {
    if (currentSymptoms) {
      setSelectedSymptoms(currentSymptoms.split(",").filter(Boolean));
    } else {
      setSelectedSymptoms([]);
    }
  }, [currentSymptoms]);

  // Load remedies and filter options
  useEffect(() => {
    loadRemedies();
    loadFilterOptions();
  }, [
    currentSearch,
    currentCategory,
    currentSymptoms,
    currentSortBy,
    currentSortOrder,
    currentPage,
  ]);

  const loadRemedies = async () => {
    try {
      setLoading(true);
      const params = {
        search: currentSearch,
        category: currentCategory !== "all" ? currentCategory : undefined,
        symptoms: currentSymptoms,
        sortBy: currentSortBy,
        sortOrder: currentSortOrder,
        page: currentPage.toString(),
      };

      const response = await remediesAPI.getAll(params);
      setRemedies(response.products);
      setPagination({
        currentPage: response.pagination.currentPage,
        totalPages: response.pagination.totalPages,
        totalRemedies: response.pagination.totalProducts,
        hasNextPage: response.pagination.hasNextPage,
        hasPrevPage: response.pagination.hasPrevPage,
      });
    } catch (error) {
      console.error("Error loading remedies:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const [symptomsData, categoriesData] = await Promise.all([
        remediesAPI.getSymptoms(),
        remediesAPI.getCategories(),
      ]);
      setSymptoms(symptomsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading filter options:", error);
    }
  };

  const updateURLParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change
    if (
      newParams.search !== undefined ||
      newParams.category !== undefined ||
      newParams.symptoms !== undefined
    ) {
      params.set("page", "1");
    }

    router.push(`/remedies?${params.toString()}`);
  };

  const handleSymptomToggle = (symptom: string) => {
    let updated: string[];
    if (selectedSymptoms.includes(symptom)) {
      updated = selectedSymptoms.filter((s) => s !== symptom);
    } else {
      updated = [...selectedSymptoms, symptom];
    }
    setSelectedSymptoms(updated);
    updateURLParams({ symptoms: updated.join(",") });
  };

  // Helper to check if all remedies on current page are selected
  const allSelected =
    remedies.length > 0 &&
    remedies.every((r) => selectedRemedies.includes(r._id));

  // Handler for individual checkbox
  const handleRemedySelect = (remedyId: string) => {
    setSelectedRemedies((prev) =>
      prev.includes(remedyId)
        ? prev.filter((id) => id !== remedyId)
        : [...prev, remedyId]
    );
  };

  // Handler for select all
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedRemedies((prev) =>
        prev.filter((id) => !remedies.some((r) => r._id === id))
      );
    } else {
      setSelectedRemedies((prev) => [
        ...prev.filter((id) => !remedies.some((r) => r._id === id)),
        ...remedies.map((r) => r._id),
      ]);
    }
  };

  const addToCart = (remedy: Remedy) => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      if (!cart.find((item: Remedy) => item._id === remedy._id)) {
        cart.push({ ...remedy, type: "remedy" });
        localStorage.setItem("cart", JSON.stringify(cart));
        window.dispatchEvent(new Event("storage"));
        alert(`${remedy.name} added to cart!`);
      } else {
        alert(`${remedy.name} is already in the cart!`);
      }
    } catch {
      localStorage.setItem(
        "cart",
        JSON.stringify([{ ...remedy, type: "remedy" }])
      );
      window.dispatchEvent(new Event("storage"));
      alert(`${remedy.name} added to cart!`);
    }
  };

  const addToWishlist = (remedy: Remedy) => {
    console.log("Added to wishlist:", remedy);
    alert(`${remedy.name} added to wishlist!`);
  };

  const formatCategoryName = (category: string) => {
    return category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-white mb-2">Our Remedies</h1>
          <p className="text-gray-300">
            Find the right remedy for your symptoms
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-gray-800 rounded-lg shadow-sm p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search remedies..."
                value={currentSearch}
                onChange={(e) => updateURLParams({ search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={currentCategory}
                onChange={(e) => updateURLParams({ category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {formatCategoryName(category)}
                  </option>
                ))}
              </select>
            </div>

            {/* Symptoms Filter (Multi-select Dropdown) */}
            <div className="relative">
              <button
                type="button"
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={() => setShowSymptomsDropdown((v) => !v)}
              >
                {selectedSymptoms.length > 0
                  ? selectedSymptoms
                      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                      .join(", ")
                  : "All Symptoms"}
                <ChevronDown className="ml-2 h-4 w-4 text-gray-400" />
              </button>
              {showSymptomsDropdown && (
                <div className="absolute z-10 mt-2 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2">
                    {symptoms.map((symptom) => (
                      <label
                        key={symptom}
                        className="flex items-center space-x-2 py-1 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSymptoms.includes(symptom)}
                          onChange={() => handleSymptomToggle(symptom)}
                          className="form-checkbox h-4 w-4 text-primary-600 border-gray-600 bg-gray-800 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-white">
                          {symptom.charAt(0).toUpperCase() + symptom.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sort */}
            <div>
              <select
                value={`${currentSortBy}-${currentSortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split("-");
                  updateURLParams({ sortBy, sortOrder });
                }}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Highest Rated</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-end">
              <span className="text-gray-300">
                {pagination.totalRemedies} remedy
                {pagination.totalRemedies !== 1 ? "ies" : "y"} found
              </span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading remedies...</p>
          </div>
        )}

        {/* Select All Option */}
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={handleSelectAll}
            className="form-checkbox h-5 w-5 text-primary-600 border-gray-600 bg-gray-800 rounded focus:ring-primary-500 mr-2"
          />
          <span className="text-white">Select All</span>
        </div>
        {/* Add Selected to Cart Button */}
        {selectedRemedies.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                try {
                  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
                  let added = 0;
                  const newCart = [...cart];
                  remedies.forEach((remedy) => {
                    if (
                      selectedRemedies.includes(remedy._id) &&
                      !cart.find((item: Remedy) => item._id === remedy._id)
                    ) {
                      newCart.push({ ...remedy, type: "remedy" });
                      added++;
                    }
                  });
                  localStorage.setItem("cart", JSON.stringify(newCart));
                  window.dispatchEvent(new Event("storage"));
                  alert(
                    `${added} remed${added === 1 ? "y" : "ies"} added to cart!`
                  );
                  setSelectedRemedies([]);
                } catch {
                  alert("Error adding to cart.");
                }
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-semibold shadow"
            >
              Add Selected to Cart
            </button>
          </div>
        )}
        {/* Remedies Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {remedies.map((remedy) => (
              <div
                key={remedy._id}
                className="bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-700"
              >
                {/* Remedy Image */}
                <div className="h-48 bg-gray-700 flex items-center justify-center relative">
                  <Pill className="h-16 w-16 text-primary-400" />
                  <button
                    onClick={() => addToWishlist(remedy)}
                    className="absolute top-2 right-2 p-2 bg-gray-800 rounded-full shadow-sm hover:bg-gray-700 transition-colors border border-gray-600"
                  >
                    <Heart className="h-5 w-5 text-gray-400 hover:text-red-500" />
                  </button>
                </div>

                {/* Remedy Info */}
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={selectedRemedies.includes(remedy._id)}
                      onChange={() => handleRemedySelect(remedy._id)}
                      className="form-checkbox h-4 w-4 text-primary-600 border-gray-600 bg-gray-800 rounded focus:ring-primary-500 mr-2"
                    />
                    <h3 className="font-semibold text-white line-clamp-2">
                      {remedy.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                    {remedy.description}
                  </p>
                  {/* Symptoms */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 mb-1">For:</p>
                    <div className="flex flex-wrap gap-1">
                      {remedy.symptoms.slice(0, 3).map((symptom, index) => (
                        <span
                          key={index}
                          className="text-xs bg-primary-900 text-primary-300 px-2 py-1 rounded"
                        >
                          {symptom}
                        </span>
                      ))}
                      {remedy.symptoms.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{remedy.symptoms.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.floor(remedy.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-400 ml-1">
                      ({remedy.rating})
                    </span>
                  </div>
                  {/* Price and Actions */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary-400">
                      ${remedy.price.toFixed(2)}
                    </span>
                    <div className="flex space-x-2">
                      {/* Remove Add button here */}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && remedies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              No remedies found matching your criteria.
            </p>
            <button
              onClick={() => router.push("/remedies")}
              className="mt-4 text-primary-400 hover:text-primary-300 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              {pagination.hasPrevPage && (
                <button
                  onClick={() =>
                    updateURLParams({ page: (currentPage - 1).toString() })
                  }
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>
              )}

              <span className="px-4 py-2 text-gray-300">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              {pagination.hasNextPage && (
                <button
                  onClick={() =>
                    updateURLParams({ page: (currentPage + 1).toString() })
                  }
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
        {/* Add Selected to Cart Button (after pagination) */}
        {selectedRemedies.length > 0 && (
          <div className="flex justify-end mt-6 mb-4">
            <button
              onClick={() => {
                try {
                  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
                  let added = 0;
                  const newCart = [...cart];
                  remedies.forEach((remedy) => {
                    if (
                      selectedRemedies.includes(remedy._id) &&
                      !cart.find((item: Remedy) => item._id === remedy._id)
                    ) {
                      newCart.push({ ...remedy, type: "remedy" });
                      added++;
                    }
                  });
                  localStorage.setItem("cart", JSON.stringify(newCart));
                  window.dispatchEvent(new Event("storage"));
                  alert(
                    `${added} remed${added === 1 ? "y" : "ies"} added to cart!`
                  );
                  setSelectedRemedies([]);
                } catch {
                  alert("Error adding to cart.");
                }
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-semibold shadow"
            >
              Add Selected to Cart
            </button>
          </div>
        )}
      </div>
      {/* Button to Products Page */}
      <div className="flex flex-col items-center mt-12 mb-8">
        <p className="mb-3 text-gray-300 text-lg">
          Looking for more options? Check out our Products.
        </p>
        <button
          onClick={() => router.push("/products")}
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-semibold shadow"
        >
          Go to Products
        </button>
      </div>
    </div>
  );
}
