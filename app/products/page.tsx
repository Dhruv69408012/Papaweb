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
import { productsAPI } from "@/utils/api";
import "../globals.css";
import { useLanguage } from "@/components/LanguageContext";

interface Product {
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

export default function Products() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const [products, setProducts] = useState<Product[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showSymptomsDropdown, setShowSymptomsDropdown] = useState(false);
  // Add state for selected products
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

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

  // Load products and filter options
  useEffect(() => {
    loadProducts();
    loadFilterOptions();
  }, [
    currentSearch,
    currentCategory,
    currentSymptoms,
    currentSortBy,
    currentSortOrder,
    currentPage,
  ]);

  const loadProducts = async () => {
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

      const response = await productsAPI.getAll(params);
      setProducts(response.products);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const [symptomsData, categoriesData] = await Promise.all([
        productsAPI.getSymptoms(),
        productsAPI.getCategories(),
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

    router.push(`/products?${params.toString()}`);
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

  const addToCart = (product: Product) => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      if (!cart.find((item: Product) => item._id === product._id)) {
        cart.push({ ...product, type: "product" });
        localStorage.setItem("cart", JSON.stringify(cart));
        window.dispatchEvent(new Event("storage"));
        alert(`${product.name} added to cart!`);
      } else {
        alert(`${product.name} is already in the cart!`);
      }
    } catch {
      localStorage.setItem(
        "cart",
        JSON.stringify([{ ...product, type: "product" }])
      );
      window.dispatchEvent(new Event("storage"));
      alert(`${product.name} added to cart!`);
    }
  };

  const addToWishlist = (product: Product) => {
    console.log("Added to wishlist:", product);
    alert(`${product.name} added to wishlist!`);
  };

  const formatCategoryName = (category: string) => {
    return category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Helper to check if all products on current page are selected
  const allSelected =
    products.length > 0 &&
    products.every((p) => selectedProducts.includes(p._id));

  // Handler for individual checkbox
  const handleProductSelect = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Handler for select all
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedProducts((prev) =>
        prev.filter((id) => !products.some((p) => p._id === id))
      );
    } else {
      setSelectedProducts((prev) => [
        ...prev.filter((id) => !products.some((p) => p._id === id)),
        ...products.map((p) => p._id),
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t("our_products")}
          </h1>
          <p className="text-gray-300">{t("find_right_medication")}</p>
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
                placeholder={t("search_medications")}
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
                <option value="all">{t("all_categories")}</option>
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
                  : t("all_symptoms")}
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
                <option value="name-asc">{t("name_a_z")}</option>
                <option value="name-desc">{t("name_z_a")}</option>
                <option value="price-asc">{t("price_low_to_high")}</option>
                <option value="price-desc">{t("price_high_to_low")}</option>
                <option value="rating-desc">{t("highest_rated")}</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-end">
              <span className="text-gray-300">
                {pagination.totalProducts} {t("medication_found")}
              </span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">{t("loading_medications")}</p>
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
          <span className="text-white">{t("select_all")}</span>
        </div>
        {/* Add Selected to Cart Button */}
        {selectedProducts.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                try {
                  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
                  let added = 0;
                  const newCart = [...cart];
                  products.forEach((product) => {
                    if (
                      selectedProducts.includes(product._id) &&
                      !cart.find((item: Product) => item._id === product._id)
                    ) {
                      newCart.push({ ...product, type: "product" });
                      added++;
                    }
                  });
                  localStorage.setItem("cart", JSON.stringify(newCart));
                  window.dispatchEvent(new Event("storage"));
                  alert(
                    `${added} ${t("product_added_to_cart", { count: added })}`
                  );
                  setSelectedProducts([]);
                } catch {
                  alert(t("error_adding_to_cart"));
                }
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-semibold shadow"
            >
              {t("add_selected_to_cart")}
            </button>
          </div>
        )}
        {/* Products Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-700"
              >
                {/* Product Image */}
                <div className="h-48 bg-gray-700 flex items-center justify-center relative">
                  <Pill className="h-16 w-16 text-primary-400" />
                  <button
                    onClick={() => addToWishlist(product)}
                    className="absolute top-2 right-2 p-2 bg-gray-800 rounded-full shadow-sm hover:bg-gray-700 transition-colors border border-gray-600"
                  >
                    <Heart className="h-5 w-5 text-gray-400 hover:text-red-500" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product._id)}
                      onChange={() => handleProductSelect(product._id)}
                      className="form-checkbox h-4 w-4 text-primary-600 border-gray-600 bg-gray-800 rounded focus:ring-primary-500 mr-2"
                    />
                    <h3 className="font-semibold text-white line-clamp-2">
                      {product.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  {/* Symptoms */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 mb-1">{t("for")}:</p>
                    <div className="flex flex-wrap gap-1">
                      {product.symptoms.slice(0, 3).map((symptom, index) => (
                        <span
                          key={index}
                          className="text-xs bg-primary-900 text-primary-300 px-2 py-1 rounded"
                        >
                          {symptom}
                        </span>
                      ))}
                      {product.symptoms.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{product.symptoms.length - 3} {t("more")}
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
                            star <= Math.floor(product.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-400 ml-1">
                      ({product.rating})
                    </span>
                  </div>
                  {/* Price and Actions */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary-400">
                      ${product.price.toFixed(2)}
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
        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">{t("no_medications_found")}</p>
            <button
              onClick={() => router.push("/products")}
              className="mt-4 text-primary-400 hover:text-primary-300 font-medium"
            >
              {t("clear_filters")}
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
                  {t("previous")}
                </button>
              )}

              <span className="px-4 py-2 text-gray-300">
                {t("page_of", {
                  current: pagination.currentPage,
                  total: pagination.totalPages,
                })}
              </span>

              {pagination.hasNextPage && (
                <button
                  onClick={() =>
                    updateURLParams({ page: (currentPage + 1).toString() })
                  }
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  {t("next")}
                </button>
              )}
            </div>
          </div>
        )}
        {/* Add Selected to Cart Button (after pagination) */}
        {selectedProducts.length > 0 && (
          <div className="flex justify-end mt-6 mb-4">
            <button
              onClick={() => {
                try {
                  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
                  let added = 0;
                  const newCart = [...cart];
                  products.forEach((product) => {
                    if (
                      selectedProducts.includes(product._id) &&
                      !cart.find((item: Product) => item._id === product._id)
                    ) {
                      newCart.push({ ...product, type: "product" });
                      added++;
                    }
                  });
                  localStorage.setItem("cart", JSON.stringify(newCart));
                  window.dispatchEvent(new Event("storage"));
                  alert(
                    `${added} ${t("product_added_to_cart", { count: added })}`
                  );
                  setSelectedProducts([]);
                } catch {
                  alert(t("error_adding_to_cart"));
                }
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-semibold shadow"
            >
              {t("add_selected_to_cart")}
            </button>
          </div>
        )}
      </div>
      {/* Button to Remedies Page */}
      <div className="flex flex-col items-center mt-12 mb-8">
        <p className="mb-3 text-gray-300 text-lg">
          {t("interested_in_natural_solutions")}
        </p>
        <button
          onClick={() => router.push("/remedies")}
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-semibold shadow"
        >
          {t("go_to_remedies")}
        </button>
      </div>
    </div>
  );
}
