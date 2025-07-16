"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddressFormPage() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [hasProduct, setHasProduct] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setHasProduct(cart.some((item: any) => item.type === "product"));
    } catch {
      setHasProduct(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending email (dummy)
    alert(`Confirmation email sent to ${email}`);
    // Remove only products from the cart
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const remediesOnly = cart.filter((item: any) => item.type !== "product");
      localStorage.setItem("cart", JSON.stringify(remediesOnly));
      window.dispatchEvent(new Event("storage"));
      if (remediesOnly.length === 0) {
        router.push("/products");
        return;
      }
    } catch {}
    router.push("/payment/all");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded shadow-lg w-full max-w-md border border-gray-700"
      >
        <h1 className="text-2xl font-bold mb-6 text-primary-400 text-center">
          Enter Address Details
        </h1>
        {hasProduct && (
          <div className="bg-yellow-100 text-yellow-900 rounded p-4 mb-6 text-center font-semibold">
            You have selected one or more products. Please provide your address
            and email to proceed.
          </div>
        )}
        <label className="block mb-4">
          <span className="text-gray-200">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full rounded bg-gray-700 border border-gray-600 text-white p-2"
          />
        </label>
        <label className="block mb-4">
          <span className="text-gray-200">Address</span>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="mt-1 block w-full rounded bg-gray-700 border border-gray-600 text-white p-2"
          />
        </label>
        <label className="block mb-6">
          <span className="text-gray-200">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded bg-gray-700 border border-gray-600 text-white p-2"
          />
        </label>
        <button
          type="submit"
          className="w-full px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-semibold shadow"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
