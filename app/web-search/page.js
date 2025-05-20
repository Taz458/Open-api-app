"use client";

import { useState } from "react";

export default function WebSearchPage() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [contextSize, setContextSize] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [showRaw, setShowRaw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/openai/web-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, location, contextSize }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Unknown error");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-cyan-400 rounded-lg p-6 shadow-lg border border-cyan-700 max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-2 text-cyan-300">
        Web Search Tool Demo
      </h2>
      <p className="mb-4 text-cyan-200">
        <b>What is the web search tool?</b> The OpenAI web search tool allows
        the AI to access up-to-date information from the internet in real time,
        providing more accurate and current answers than models alone.
        <br />
        <br />
        <b>How does location-based search work?</b> If you provide a location
        (e.g., &quot;New York, NY&quot; or &quot;London, UK&quot;), the search
        will prioritise results relevant to that area.
        <br />
        <br />
        <b>How does context size affect results?</b> A larger context size
        allows the AI to use more information from the web search, which can
        improve answer detail but may take longer or use more tokens.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Search Query</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="e.g. Latest AI news, Best pizza places"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Location (optional)
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="e.g. New York, NY or London, UK"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Context Size</label>
          <select
            value={contextSize}
            onChange={(e) => setContextSize(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
      {error && (
        <div className="mt-4 text-red-400 bg-gray-800 p-2 rounded">{error}</div>
      )}
      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-cyan-200">Result</h3>
          <div className="bg-gray-800 p-4 rounded text-cyan-100 whitespace-pre-line mb-2">
            {result.processed}
          </div>
          <button
            className="text-xs text-cyan-400 underline mb-2"
            onClick={() => setShowRaw((v) => !v)}
          >
            {showRaw ? "Hide Raw Data" : "Show Raw Data"}
          </button>
          {showRaw && (
            <pre className="bg-gray-950 p-2 rounded text-xs text-cyan-300 overflow-x-auto max-h-64 mt-2">
              {JSON.stringify(result.raw, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
