"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { productsAPI } from "@/utils/api";
import { ArrowLeft, Pill, Star } from "lucide-react";

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

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filteredIndex, setFilteredIndex] = useState<number>(-1);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
    try {
      const arr = JSON.parse(localStorage.getItem("filteredProducts") || "[]");
      const idx = JSON.parse(localStorage.getItem("filteredIndex") || "-1");
      setFilteredProducts(arr);
      setFilteredIndex(idx);
    } catch {
      setFilteredProducts([]);
      setFilteredIndex(-1);
    }
    // eslint-disable-next-line
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getById(id as string);
      setProduct(data);
    } catch (err: any) {
      setError("Product not found");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <p className="text-xl mb-4">{error || "Product not found"}</p>
        <button
          onClick={() => router.push("/products")}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <ArrowLeft className="inline-block mr-2 h-5 w-5" /> Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-gray-800 rounded-lg shadow-md p-8 border border-gray-700">
        <button
          onClick={() => router.push("/products")}
          className="mb-6 flex items-center text-primary-400 hover:text-primary-300"
        >
          <ArrowLeft className="inline-block mr-2 h-5 w-5" /> Back to Products
        </button>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0 flex flex-col items-center justify-center">
            <Pill className="h-24 w-24 text-primary-400 mb-4" />
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                product.inStock
                  ? "bg-green-900 text-green-300"
                  : "bg-red-900 text-red-300"
              }`}
            >
              {product.inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">
              {product.name}
            </h1>
            <div className="flex items-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.floor(product.rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-600"
                  }`}
                />
              ))}
              <span className="ml-2 text-gray-400 text-sm">
                ({product.rating} / {product.reviewCount} reviews)
              </span>
            </div>
            <p className="text-lg text-primary-400 font-semibold mb-4">
              ${product.price.toFixed(2)}
            </p>
            <p className="text-gray-300 mb-6">{product.description}</p>
            <div className="mb-4">
              <h2 className="text-md font-semibold text-white mb-1">
                Symptoms Treated:
              </h2>
              <div className="flex flex-wrap gap-2">
                {product.symptoms.map((symptom, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-primary-900 text-primary-300 px-2 py-1 rounded"
                  >
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <h2 className="text-md font-semibold text-white mb-1">Dosage:</h2>
              <p className="text-gray-300 text-sm">{product.dosage}</p>
            </div>
            {product.sideEffects.length > 0 && (
              <div className="mb-4">
                <h2 className="text-md font-semibold text-white mb-1">
                  Possible Side Effects:
                </h2>
                <ul className="list-disc list-inside text-gray-400 text-sm">
                  {product.sideEffects.map((effect, idx) => (
                    <li key={idx}>{effect}</li>
                  ))}
                </ul>
              </div>
            )}
            {product.contraindications.length > 0 && (
              <div className="mb-4">
                <h2 className="text-md font-semibold text-white mb-1">
                  Contraindications:
                </h2>
                <ul className="list-disc list-inside text-gray-400 text-sm">
                  {product.contraindications.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-8 flex gap-4">
              <button
                className="px-6 py-2 bg-primary-600 text-white rounded-md font-semibold hover:bg-primary-700 transition-colors"
                disabled={!product.inStock}
              >
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </button>
              {filteredProducts.length > 0 && filteredIndex > 0 && (
                <button
                  className="px-6 py-2 bg-gray-700 text-white rounded-md font-semibold hover:bg-gray-600 transition-colors"
                  onClick={() => {
                    const prevProduct = filteredProducts[filteredIndex - 1];
                    if (prevProduct) {
                      localStorage.setItem(
                        "filteredIndex",
                        JSON.stringify(filteredIndex - 1)
                      );
                      router.replace(
                        `/payment/${prevProduct._id}?fromDetails=1`
                      );
                    }
                  }}
                >
                  Previous
                </button>
              )}
              {filteredProducts.length > 0 &&
                filteredIndex > -1 &&
                filteredIndex < filteredProducts.length - 1 && (
                  <button
                    className="px-6 py-2 bg-gray-700 text-white rounded-md font-semibold hover:bg-gray-600 transition-colors"
                    onClick={() => {
                      const nextProduct = filteredProducts[filteredIndex + 1];
                      if (nextProduct) {
                        localStorage.setItem(
                          "filteredIndex",
                          JSON.stringify(filteredIndex + 1)
                        );
                        router.replace(
                          `/payment/${nextProduct._id}?fromDetails=1`
                        );
                      }
                    }}
                  >
                    Next
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
