"use client";
import React, { useState } from "react";
import Image from "next/image";

const BRAND_PERSONALITIES = [
  "Friendly",
  "Professional",
  "Playful",
  "Luxury",
  "Minimalist",
  "Bold",
];

const OUTPUT_FORMATS = [
  { key: "website", label: "Website Product Description" },
  { key: "social", label: "Social Media Post (Instagram)" },
  { key: "email", label: "Email Marketing Copy" },
];

const API_DESCRIPTION_URL = "/api/openai/product-description-generator";
const API_IMAGE_URL = "/api/openai/product-image-generator";

function PreviewCard({
  format,
  label,
  content,
  imageUrl,
  loading,
  error,
  onRegenerate,
}) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-cyan-700 p-4 flex flex-col gap-3 w-full md:w-1/3 text-cyan-200">
      <div className="font-semibold text-lg mb-2 text-cyan-300">{label}</div>
      {loading ? (
        <div className="text-cyan-400">Generating...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : (
        <>
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={label + " image"}
              width={512}
              height={384}
              className="w-full h-48 object-cover rounded mb-2 border border-cyan-700"
              unoptimized
            />
          )}
          <pre className="whitespace-pre-wrap text-sm bg-gray-900 p-2 rounded border border-cyan-800 overflow-x-auto text-cyan-200">
            {content}
          </pre>
        </>
      )}
      <button
        type="button"
        onClick={onRegenerate}
        className="mt-2 text-cyan-400 hover:underline self-end text-sm"
        disabled={loading}
      >
        Regenerate
      </button>
    </div>
  );
}

export default function ProductDescriptionGeneratorPage() {
  const [form, setForm] = useState({
    name: "",
    category: "",
    features: [""],
    audience: "",
    price: "",
    personality: BRAND_PERSONALITIES[0],
    formats: [OUTPUT_FORMATS[0].key],
  });
  const [results, setResults] = useState({});
  const [loadingAll, setLoadingAll] = useState(false);
  const [errorAll, setErrorAll] = useState("");
  const [exported, setExported] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeatureChange = (idx, value) => {
    setForm((prev) => {
      const features = [...prev.features];
      features[idx] = value;
      return { ...prev, features };
    });
  };

  const addFeature = () => {
    setForm((prev) => ({ ...prev, features: [...prev.features, ""] }));
  };

  const removeFeature = (idx) => {
    setForm((prev) => {
      const features = prev.features.filter((_, i) => i !== idx);
      return { ...prev, features };
    });
  };

  const handleFormatToggle = (key) => {
    setForm((prev) => {
      const formats = prev.formats.includes(key)
        ? prev.formats.filter((f) => f !== key)
        : [...prev.formats, key];
      return { ...prev, formats };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingAll(true);
    setErrorAll("");
    setExported(false);
    const newResults = {};
    for (const f of form.formats) {
      newResults[f] = { loading: true, error: "", content: "", imageUrl: "" };
    }
    setResults(newResults);
    try {
      const descRes = await fetch(API_DESCRIPTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const descData = await descRes.json();
      if (!descData.success)
        throw new Error(descData.error || "Failed to generate content");
      const imagePromises = form.formats.map(async (format) => {
        const imgRes = await fetch(API_IMAGE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            category: form.category,
            features: form.features,
            personality: form.personality,
            platform: format,
          }),
        });
        const imgData = await imgRes.json();
        return imgData.success ? imgData.url : "";
      });
      const imageUrls = await Promise.all(imagePromises);
      const merged = {};
      form.formats.forEach((f, i) => {
        merged[f] = {
          loading: false,
          error: "",
          content: descData.content[f],
          imageUrl: imageUrls[i],
        };
      });
      setResults(merged);
    } catch (err) {
      setErrorAll(err.message || "Unknown error");
    } finally {
      setLoadingAll(false);
    }
  };

  const handleRegenerate = async (format) => {
    setResults((prev) => ({
      ...prev,
      [format]: { ...prev[format], loading: true, error: "" },
    }));
    try {
      const descRes = await fetch(API_DESCRIPTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, formats: [format] }),
      });
      const descData = await descRes.json();
      if (!descData.success)
        throw new Error(descData.error || "Failed to generate content");
      const imgRes = await fetch(API_IMAGE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          features: form.features,
          personality: form.personality,
          platform: format,
        }),
      });
      const imgData = await imgRes.json();
      setResults((prev) => ({
        ...prev,
        [format]: {
          loading: false,
          error: "",
          content: descData.content[format],
          imageUrl: imgData.success ? imgData.url : "",
        },
      }));
    } catch (err) {
      setResults((prev) => ({
        ...prev,
        [format]: {
          ...prev[format],
          loading: false,
          error: err.message || "Unknown error",
        },
      }));
    }
  };

  const handleExport = () => {
    let exportText = "";
    form.formats.forEach((f) => {
      exportText += `--- ${
        OUTPUT_FORMATS.find((x) => x.key === f)?.label
      } ---\n`;
      if (results[f]?.content) exportText += results[f].content + "\n";
      if (results[f]?.imageUrl) exportText += results[f].imageUrl + "\n";
      exportText += "\n";
    });
    navigator.clipboard.writeText(exportText);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-cyan-400 py-10 px-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-cyan-400 text-center">
        Multimodal Product Description Generator
      </h1>
      <form
        className="bg-gray-800 rounded-lg shadow-lg border border-cyan-700 p-6 space-y-6 w-full max-w-2xl"
        onSubmit={handleSubmit}
      >
        <div>
          <label className="block font-medium mb-1 text-cyan-300">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full bg-gray-900 border border-cyan-800 rounded px-3 py-2 text-cyan-200 focus:ring-cyan-500 focus:border-cyan-500"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-cyan-300">
            Category
          </label>
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full bg-gray-900 border border-cyan-800 rounded px-3 py-2 text-cyan-200 focus:ring-cyan-500 focus:border-cyan-500"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-cyan-300">
            Key Features
          </label>
          {form.features.map((feature, idx) => (
            <div key={idx} className="flex items-center mb-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => handleFeatureChange(idx, e.target.value)}
                className="flex-1 bg-gray-900 border border-cyan-800 rounded px-3 py-2 text-cyan-200 focus:ring-cyan-500 focus:border-cyan-500"
                required
              />
              {form.features.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFeature(idx)}
                  className="ml-2 text-red-400 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addFeature}
            className="mt-1 text-cyan-400 hover:underline"
          >
            + Add Feature
          </button>
        </div>
        <div>
          <label className="block font-medium mb-1 text-cyan-300">
            Target Audience
          </label>
          <input
            type="text"
            name="audience"
            value={form.audience}
            onChange={handleChange}
            className="w-full bg-gray-900 border border-cyan-800 rounded px-3 py-2 text-cyan-200 focus:ring-cyan-500 focus:border-cyan-500"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-cyan-300">
            Price Point
          </label>
          <input
            type="text"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="w-full bg-gray-900 border border-cyan-800 rounded px-3 py-2 text-cyan-200 focus:ring-cyan-500 focus:border-cyan-500"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-cyan-300">
            Brand Personality / Tone
          </label>
          <select
            name="personality"
            value={form.personality}
            onChange={handleChange}
            className="w-full bg-gray-900 border border-cyan-800 rounded px-3 py-2 text-cyan-200 focus:ring-cyan-500 focus:border-cyan-500"
          >
            {BRAND_PERSONALITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1 text-cyan-300">
            Output Formats
          </label>
          <div className="flex flex-wrap gap-4">
            {OUTPUT_FORMATS.map((format) => (
              <label
                key={format.key}
                className="flex items-center gap-2 text-cyan-200"
              >
                <input
                  type="checkbox"
                  checked={form.formats.includes(format.key)}
                  onChange={() => handleFormatToggle(format.key)}
                  className="form-checkbox text-cyan-500 bg-gray-900 border-cyan-800"
                />
                {format.label}
              </label>
            ))}
          </div>
        </div>
        <div className="pt-4">
          <button
            type="submit"
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-6 py-2 rounded-md transition duration-200 w-full"
            disabled={loadingAll}
          >
            {loadingAll ? "Generating..." : "Generate Content"}
          </button>
        </div>
        {errorAll && <div className="text-red-400 mt-2">{errorAll}</div>}
      </form>
      <div className="mt-10 w-full max-w-4xl">
        {form.formats.length > 0 && (
          <div className="flex flex-col md:flex-row gap-6">
            {form.formats.map((f) => (
              <PreviewCard
                key={f}
                format={f}
                label={OUTPUT_FORMATS.find((x) => x.key === f)?.label}
                content={results[f]?.content}
                imageUrl={results[f]?.imageUrl}
                loading={results[f]?.loading}
                error={results[f]?.error}
                onRegenerate={() => handleRegenerate(f)}
              />
            ))}
          </div>
        )}
        {Object.keys(results).length > 0 && (
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={handleExport}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold"
            >
              {exported ? "Copied!" : "Copy All Content"}
            </button>
          </div>
        )}
        {Object.keys(results).length === 0 && (
          <div className="text-cyan-700 text-center">
            Generated content preview will appear here.
          </div>
        )}
      </div>
    </div>
  );
}
