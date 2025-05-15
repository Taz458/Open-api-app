"use client";

import { useState, useRef, useEffect } from "react";

export default function RealtimeChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAudioMode, setIsAudioMode] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result.split(",")[1];
          handleAudioSubmit(base64Audio);
        };
      };
    }
  };

  const handleAudioSubmit = async (audioInputData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/openai/realtime-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: messages,
          audioData: audioInputData,
          isAudio: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      let responseAudioData = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);

        if (chunk.includes("<AUDIO_START>")) {
          const [textPart, audioPartWithEnd] = chunk.split("<AUDIO_START>");
          assistantMessage += textPart;
          if (audioPartWithEnd.includes("<AUDIO_END>")) {
            responseAudioData = audioPartWithEnd.split("<AUDIO_END>")[0];
          } else {
            responseAudioData = audioPartWithEnd;
          }
        } else if (chunk.includes("<AUDIO_END>")) {
          // Do nothing, audio already handled
        } else {
          assistantMessage += chunk;
        }

        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];

          if (lastMessage && lastMessage.role === "assistant") {
            lastMessage.content = assistantMessage;
            if (responseAudioData) lastMessage.audio = responseAudioData;
            return newMessages;
          } else {
            return [
              ...newMessages,
              {
                role: "assistant",
                content: assistantMessage,
                ...(responseAudioData ? { audio: responseAudioData } : {}),
              },
            ];
          }
        });
      }

      // Play the audio response
      if (responseAudioData) {
        const audioBlob = new Blob([Buffer.from(responseAudioData, "base64")], {
          type: "audio/mpeg",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/openai/realtime-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [...messages, userMessage],
          isAudio: isAudioMode,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      let audioData = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);

        if (chunk.includes("<AUDIO_START>")) {
          const [textPart, audioPartWithEnd] = chunk.split("<AUDIO_START>");
          assistantMessage += textPart;
          if (audioPartWithEnd.includes("<AUDIO_END>")) {
            audioData = audioPartWithEnd.split("<AUDIO_END>")[0];
          } else {
            audioData = audioPartWithEnd;
          }
        } else if (chunk.includes("<AUDIO_END>")) {
          // Do nothing, audio already handled
        } else {
          assistantMessage += chunk;
        }

        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];

          if (lastMessage && lastMessage.role === "assistant") {
            lastMessage.content = assistantMessage;
            if (audioData) lastMessage.audio = audioData;
            return newMessages;
          } else {
            return [
              ...newMessages,
              {
                role: "assistant",
                content: assistantMessage,
                ...(audioData ? { audio: audioData } : {}),
              },
            ];
          }
        });
      }

      // Play the audio response if in audio mode
      if (isAudioMode && audioData) {
        const audioBlob = new Blob([Buffer.from(audioData, "base64")], {
          type: "audio/mpeg",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-cyan-400">Realtime Chat</h1>

        <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-4 h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-cyan-600 ml-auto max-w-[80%]"
                    : "bg-gray-700 mr-auto max-w-[80%]"
                }`}
              >
                <p className="text-sm font-semibold mb-1">
                  {message.role === "user" ? "You" : "Assistant"}
                </p>
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.role === "assistant" && message.audio && (
                  <audio
                    controls
                    src={`data:audio/mpeg;base64,${message.audio}`}
                    className="mt-2 w-full"
                  />
                )}
              </div>
            ))}
            {loading && (
              <div className="bg-gray-700 p-3 rounded-lg mr-auto max-w-[80%]">
                <p className="text-sm font-semibold mb-1">Assistant</p>
                <p>Thinking...</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900 text-red-200 rounded-lg">
              Error: {error}
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isAudioMode}
                onChange={(e) => setIsAudioMode(e.target.checked)}
                className="form-checkbox h-4 w-4 text-cyan-600"
              />
              <span>Audio Mode</span>
            </label>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              disabled={loading || isRecording}
            />
            {isAudioMode ? (
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={loading}
                className={`${
                  isRecording
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-cyan-600 hover:bg-cyan-700"
                } text-white font-bold py-2 px-6 rounded-lg transition duration-200 disabled:opacity-50`}
              >
                {isRecording ? "Stop Recording" : "Start Recording"}
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200 disabled:opacity-50"
              >
                Send
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
