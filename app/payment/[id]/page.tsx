"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";

export default function PaymentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = params;
  const fromDetails = searchParams.get("fromDetails") === "1";
  const handlePaid = () => {
    if (fromDetails) {
      router.replace(`/products/${id}`);
    } else {
      router.replace(`/products/${id}`);
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
