"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// @ts-ignore
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";

interface Remedy {
  _id: string;
  name: string;
  price: number;
  description: string;
  dosage: string;
  sideEffects: string[];
  contraindications: string[];
  symptoms: string[];
}

export default function PaymentAllPage() {
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const router = useRouter();

  useEffect(() => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setRemedies(cart.filter((item: any) => item.type === "remedy"));
    } catch {
      setRemedies([]);
    }
    // Remove cart clearing from cleanup
  }, []);

  // Clear cart after remedies are loaded and set
  useEffect(() => {
    if (remedies.length > 0) {
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("storage"));
    }
  }, [remedies]);

  const handleDownload = async () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Your Remedies",
                  bold: true,
                  size: 36,
                }),
              ],
              spacing: { after: 400 },
            }),
            ...remedies
              .map((remedy) => [
                new Paragraph({
                  children: [
                    new TextRun({ text: remedy.name, bold: true, size: 28 }),
                  ],
                  spacing: { after: 200 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Price: $${remedy.price.toFixed(2)}`,
                      bold: true,
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: `Description: ${remedy.description}` }),
                  ],
                }),
                new Paragraph({
                  children: [new TextRun({ text: `Dosage: ${remedy.dosage}` })],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Symptoms: ${remedy.symptoms?.join(", ")}`,
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Side Effects: ${remedy.sideEffects?.join(", ")}`,
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Contraindications: ${remedy.contraindications?.join(
                        ", "
                      )}`,
                    }),
                  ],
                }),
                new Paragraph({ text: "" }),
              ])
              .flat(),
          ],
        },
      ],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "remedies.docx");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Your Remedies</h1>
        <div className="bg-yellow-100 text-yellow-900 rounded p-4 mb-6 text-center font-semibold">
          You will not be able to view this data again if you move away from the
          page.
        </div>
        <div className="flex justify-end mb-6">
          <button
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-semibold shadow"
            onClick={handleDownload}
          >
            Download as Word
          </button>
        </div>
        {remedies.length === 0 ? (
          <p className="text-gray-400 text-center">No remedies found.</p>
        ) : (
          <div className="space-y-6">
            {remedies.map((remedy) => (
              <div
                key={remedy._id}
                className="bg-gray-800 p-4 rounded shadow border border-gray-700"
              >
                <h2 className="text-xl font-bold mb-2">{remedy.name}</h2>
                <p className="mb-2 text-primary-400 font-semibold">
                  ${remedy.price.toFixed(2)}
                </p>
                <p className="mb-2 text-gray-300">{remedy.description}</p>
                <div className="mb-2">
                  <span className="font-semibold text-gray-200">Dosage:</span>{" "}
                  {remedy.dosage}
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-200">Symptoms:</span>{" "}
                  {remedy.symptoms?.join(", ")}
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-200">
                    Side Effects:
                  </span>{" "}
                  {remedy.sideEffects?.join(", ")}
                </div>
                <div>
                  <span className="font-semibold text-gray-200">
                    Contraindications:
                  </span>{" "}
                  {remedy.contraindications?.join(", ")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
