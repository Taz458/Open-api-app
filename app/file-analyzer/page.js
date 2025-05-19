"use client";

import { useState } from "react";

export default function FileAnalyzerPage() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file || !question) {
      alert("Please upload a file and enter a question.");
      return;
    }

    setLoading(true);
    setAnswer(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("question", question);

      const res = await fetch("/api/openai/file-analyzer", {
        method: "POST",
        body: formData,
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
      <h1 className="text-2xl font-bold mb-6 text-cyan-300">File Analyzer</h1>

      <form onSubmit={handleAnalyze} className="space-y-4 w-full max-w-md">
        <div>
          <label className="block text-sm font-medium mb-1">Upload File</label>
          <input
            type="file"
            accept=".txt,.pdf,.json,.md"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full p-2 rounded bg-gray-700 border border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Question about the File</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="E.g. What is the main topic?"
            className="w-full p-2 rounded bg-gray-700 border border-cyan-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded"
        >
          {loading ? "Analyzing..." : "Analyze File"}
        </button>
      </form>

      {answer && (
        <div className="mt-6 bg-gray-800 p-4 rounded shadow max-w-xl w-full">
          <h2 className="font-semibold text-cyan-300 mb-2">Response</h2>
          <pre className="text-cyan-100 whitespace-pre-wrap">{answer}</pre>
        </div>
      )}
    </div>
  );
}
