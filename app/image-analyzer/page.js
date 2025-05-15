"use client";

import { useState } from "react";

export default function ImageAnalyzerPage() {
  const [imageUrl, setImageUrl] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAnswer(null);

    try {
      const res = await fetch("/api/openai/image-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, question }),
      });

      const data = await res.json();
      if (data.success) {
        setAnswer(data.answer);
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-cyan-400 p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6 text-cyan-300">Image Analyzer</h1>

      <form onSubmit={handleAnalyze} className="space-y-4 w-full max-w-md">
        <div>
          <label className="block text-sm font-medium mb-1">Image URL</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Enter image URL"
            className="w-full p-2 rounded bg-gray-700 border border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Question about the Image</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="E.g. What’s happening in the image?"
            className="w-full p-2 rounded bg-gray-700 border border-cyan-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded"
        >
          {loading ? "Analyzing..." : "Analyze Image"}
        </button>
      </form>

      {answer && (
        <div className="mt-6 bg-gray-800 p-4 rounded shadow max-w-xl w-full">
          <h2 className="font-semibold text-cyan-300 mb-2">Response</h2>
          <p className="text-cyan-100 whitespace-pre-wrap">{answer}</p>
        </div>
      )}
    </div>
  );
}
