"use client";

import { useRouter } from "next/navigation";

export default function DummyPaymentPage() {
  const router = useRouter();

  const handlePaid = () => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      if (cart.some((item: any) => item.type === "product")) {
        router.push("/payment/address");
      } else {
        router.push("/payment/all");
      }
    } catch {
      router.push("/payment/all");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <button
        onClick={handlePaid}
        className="px-8 py-4 bg-primary-600 text-white text-2xl rounded-lg shadow hover:bg-primary-700 transition-colors"
      >
        Paid
      </button>
    </div>
  );
}
