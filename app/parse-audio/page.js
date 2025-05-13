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
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Audio & Speech Features</h1>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Speech-to-Text (Transcription)
        </h2>
        <input
          type="file"
          accept="audio/*"
          onChange={handleAudioChange}
          className="mb-2"
        />
        <button
          onClick={handleTranscribe}
          disabled={!audioFile || transcribeLoading}
          className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {transcribeLoading ? "Transcribing..." : "Transcribe"}
        </button>
        {transcribeError && (
          <p className="text-red-500 mt-2">Error: {transcribeError}</p>
        )}
        {transcription && (
          <div className="mt-4">
            <h3 className="font-semibold">Transcription Result:</h3>
            <pre className="bg-gray-100 p-3 rounded text-black overflow-auto max-h-40">
              {transcription}
            </pre>
          </div>
        )}
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Text-to-Speech (TTS)</h2>
        <textarea
          value={ttsText}
          onChange={(e) => setTtsText(e.target.value)}
          className="w-full p-2 border rounded mb-2"
          rows={3}
          placeholder="Enter text to synthesize..."
        />
        <button
          onClick={handleTts}
          disabled={!ttsText || ttsLoading}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          {ttsLoading ? "Generating..." : "Generate Speech"}
        </button>
        {ttsError && <p className="text-red-500 mt-2">Error: {ttsError}</p>}
        {ttsAudioUrl && (
          <div className="mt-4">
            <h3 className="font-semibold">Generated Audio:</h3>
            <audio controls src={ttsAudioUrl} className="w-full mt-2" />
          </div>
        )}
      </section>
    </div>
  );
}
