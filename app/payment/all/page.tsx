"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// @ts-ignore
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";

interface Remedy {
  _id: string;
  name: string;
  ingredients: string;
  procedure: string;
  application: string;
  duration: string;
  precautions?: string;
  modificationIfAny?: string;
  prescribedAgeGroup?: string;
  symptoms: string[];
  price: number;
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
                    new TextRun({
                      text: remedy.name,
                      bold: true,
                      size: 32,
                      color: "2E74B5",
                    }),
                  ],
                  spacing: { after: 200 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Ingredients: ${remedy.ingredients}`,
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: `Procedure: ${remedy.procedure}` }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: `Application: ${remedy.application}` }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: `Duration: ${remedy.duration}` }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Precautions: ${remedy.precautions || "-"}`,
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Modification if any: ${
                        remedy.modificationIfAny || "-"
                      }`,
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Prescribed age group: ${
                        remedy.prescribedAgeGroup || "-"
                      }`,
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
                <div className="mb-2">
                  <span className="text-2xl font-bold text-primary-400 block mb-1">
                    {remedy.name}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-200">
                    Ingredients:
                  </span>{" "}
                  {remedy.ingredients}
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-200">
                    Procedure:
                  </span>{" "}
                  {remedy.procedure}
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-200">
                    Application:
                  </span>{" "}
                  {remedy.application}
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-200">Duration:</span>{" "}
                  {remedy.duration}
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-200">
                    Precautions:
                  </span>{" "}
                  {remedy.precautions || "-"}
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-200">
                    Modification if any:
                  </span>{" "}
                  {remedy.modificationIfAny || "-"}
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-200">
                    Prescribed age group:
                  </span>{" "}
                  {remedy.prescribedAgeGroup || "-"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
