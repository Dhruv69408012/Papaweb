"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
}

export default function CartPage() {
  const [cart, setCart] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("cart") || "[]");
      setCart(stored);
    } catch {
      setCart([]);
    }
    function syncCart() {
      try {
        const stored = JSON.parse(localStorage.getItem("cart") || "[]");
        setCart(stored);
      } catch {
        setCart([]);
      }
    }
    window.addEventListener("storage", syncCart);
    return () => window.removeEventListener("storage", syncCart);
  }, []);

  const removeFromCart = (id: string) => {
    const updated = cart.filter((item) => item._id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const handleBuyAll = () => {
    router.push("/payment");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Your Cart</h1>
        {cart.length === 0 ? (
          <p className="text-gray-400 text-center">Your cart is empty.</p>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {cart.map((product: any) => (
                <div
                  key={product._id}
                  className="bg-gray-800 p-4 rounded flex flex-col md:flex-row md:justify-between md:items-center gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-semibold">{product.name}</h2>
                      {product.type === "remedy" && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-700 text-blue-100 text-xs rounded-full">
                          Remedy
                        </span>
                      )}
                      {product.type === "product" && (
                        <span className="ml-2 px-2 py-0.5 bg-green-700 text-green-100 text-xs rounded-full">
                          Product
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      {product.description}
                    </p>
                    <span className="text-primary-400 font-bold text-lg">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-row md:flex-col items-center gap-2 md:gap-4">
                    <Link
                      href={`/payment/${product._id}`}
                      className="px-4 py-2 bg-primary-600 rounded text-white hover:bg-primary-700 transition-colors w-full text-center"
                    >
                      Buy
                    </Link>
                    <button
                      onClick={() => removeFromCart(product._id)}
                      className="px-4 py-2 bg-red-600 rounded text-white hover:bg-red-700 transition-colors w-full text-center"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gray-800 p-6 rounded mb-8 shadow-lg border border-gray-700">
              <span className="text-2xl font-bold text-primary-400 mb-4 md:mb-0">
                Total: ${total.toFixed(2)}
              </span>
              <button
                onClick={handleBuyAll}
                className="px-8 py-3 bg-primary-600 text-white text-lg rounded-lg shadow hover:bg-primary-700 transition-colors w-full md:w-auto"
              >
                Buy Entire Cart
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
