"use client";

import { useState } from "react";

export default function ParseAudio() {
  const [audioFile, setAudioFile] = useState(null);
  const [transcription, setTranscription] = useState(null);
  const [transcribeLoading, setTranscribeLoading] = useState(false);
  const [transcribeError, setTranscribeError] = useState(null);

  const [ttsText, setTtsText] = useState("");
  const [ttsAudioUrl, setTtsAudioUrl] = useState(null);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState(null);

  const handleAudioChange = (e) => {
    setAudioFile(e.target.files[0]);
    setTranscription(null);
    setTranscribeError(null);
  };

  const handleTranscribe = async () => {
    if (!audioFile) return;
    setTranscribeLoading(true);
    setTranscribeError(null);
    setTranscription(null);
    const formData = new FormData();
    formData.append("audio", audioFile);
    try {
      const res = await fetch("/api/openai/audio-transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Transcription failed");
      setTranscription(data.transcription);
    } catch (err) {
      setTranscribeError(err.message);
    } finally {
      setTranscribeLoading(false);
    }
  };

  const handleTts = async () => {
    setTtsLoading(true);
    setTtsError(null);
    setTtsAudioUrl(null);
    try {
      const res = await fetch("/api/openai/audio-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: ttsText }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      setTtsAudioUrl(URL.createObjectURL(blob));
    } catch (err) {
      setTtsError(err.message);
    } finally {
      setTtsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-4 py-8 md:px-12 lg:px-24 bg-gray-900">
      <div className="w-full max-w-xl bg-gray-900 flex flex-col items-center justify-center text-white rounded-lg shadow-lg py-12 px-4 md:px-8">
        <h1 className="text-3xl font-bold mb-8 text-cyan-400 text-center">
          Audio & Speech Features
        </h1>
        <section className="mb-10 w-full">
          <h2 className="text-xl font-semibold mb-4 text-cyan-300 text-center">
            Speech-to-Text (Transcription)
          </h2>
          <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
              className="bg-gray-800 border border-gray-700 rounded-md p-2 text-white w-full md:w-auto"
            />
            <button
              onClick={handleTranscribe}
              disabled={!audioFile || transcribeLoading}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 w-full md:w-auto"
            >
              {transcribeLoading ? "Transcribing..." : "Transcribe"}
            </button>
          </div>
          {transcribeError && (
            <p className="text-red-400 mt-2 text-center">
              Error: {transcribeError}
            </p>
          )}
          {transcription && (
            <div className="mt-4">
              <h3 className="font-semibold text-cyan-200 mb-2">
                Transcription Result:
              </h3>
              <pre className="bg-gray-800 p-3 rounded text-cyan-100 overflow-auto max-h-40 border border-cyan-700">
                {transcription}
              </pre>
            </div>
          )}
        </section>
        <section className="w-full">
          <h2 className="text-xl font-semibold mb-4 text-cyan-300 text-center">
            Text-to-Speech (TTS)
          </h2>
          <textarea
            value={ttsText}
            onChange={(e) => setTtsText(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white mb-2 focus:ring-cyan-500 focus:border-cyan-500"
            rows={3}
            placeholder="Enter text to synthesize..."
          />
          <button
            onClick={handleTts}
            disabled={!ttsText || ttsLoading}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 w-full"
          >
            {ttsLoading ? "Generating..." : "Generate Speech"}
          </button>
          {ttsError && (
            <p className="text-red-400 mt-2 text-center">Error: {ttsError}</p>
          )}
          {ttsAudioUrl && (
            <div className="mt-4">
              <h3 className="font-semibold text-cyan-200 mb-2">
                Generated Audio:
              </h3>
              <audio controls src={ttsAudioUrl} className="w-full mt-2" />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
