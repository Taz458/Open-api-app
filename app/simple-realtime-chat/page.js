"use client";

import { useState, useRef } from "react";

export default function Home() {
  // State to hold the list of chat messages (user + AI)
  // Starts with a system message to set the AI behavior
  const [messages, setMessages] = useState([
    { role: "system", content: "You are a helpful assistant." },
  ]);

  // State to control the current input text field
  const [input, setInput] = useState("");

  // State to indicate whether we are waiting for AI response
  const [isLoading, setIsLoading] = useState(false);

  // Reference to the message list container for scrolling
  const messageListRef = useRef();

  // Function to handle form submission (user sends a message)
  async function handleSubmit(e) {
    e.preventDefault();
  
    if (!input.trim()) return;
  
    // Add the user's message first
    const newMessages = [...messages, { role: "user", content: input }];
  
    // Add an empty assistant message placeholder (for streaming content)
    newMessages.push({ role: "assistant", content: "" });
  
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
  
    const response = await fetch("/api/openai/simple-realtime-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });
  
    if (!response.ok) {
      setIsLoading(false);
      alert("Error: " + response.statusText);
      return;
    }
  
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let assistantMessage = "";
  
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunk = decoder.decode(value);
      assistantMessage += chunk;
  
      setMessages((msgs) => {
        // Keep all except the last assistant message, then add the updated one
        const msgsWithoutLastAssistant = msgs.slice(0, -1);
        return [...msgsWithoutLastAssistant, { role: "assistant", content: assistantMessage }];
      });
  
      messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
    }
  
    setIsLoading(false);
  }
  

  return (
    <main
      style={{
        maxWidth: 600,
        margin: "2rem auto",
        padding: "0 1rem",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: "#f7f9fc",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        height: "80vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "1rem", color: "#222" }}>
        Simple Realtime Chat
      </h1>

      {/* Chat messages container */}
      <div
        ref={messageListRef}
        style={{
          flexGrow: 1,
          border: "1px solid #ddd",
          padding: "1rem",
          overflowY: "auto",
          backgroundColor: "#fff",
          borderRadius: 8,
          boxShadow: "inset 0 0 5px #eee",
          marginBottom: "1rem",
        }}
      >
        {messages.map((m, i) => {
          // Determine bubble alignment and color by role
          const isUser = m.role === "user";
          const isAssistant = m.role === "assistant";
          const isSystem = m.role === "system";

          const bubbleStyle = {
            maxWidth: "75%",
            marginBottom: "1rem",
            padding: "0.75rem 1rem",
            borderRadius: 20,
            lineHeight: 1.4,
            whiteSpace: "pre-wrap", // Preserve line breaks
            backgroundColor: isUser
              ? "#DCF8C6" // light green bubble for user
              : isAssistant
              ? "#e1e4ff" // light blue bubble for AI
              : "#f0f0f0", // grey bubble for system message
            color: isSystem ? "#555" : "#000",
            alignSelf: isUser ? "flex-end" : "flex-start",
            boxShadow: isSystem ? "none" : "0 1px 3px rgba(0,0,0,0.1)",
          };

          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: bubbleStyle.alignSelf,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: isUser
                    ? "#007aff"
                    : isAssistant
                    ? "#4a4aff"
                    : "#888",
                  marginBottom: 4,
                  userSelect: "none",
                }}
              >
                {isUser ? "You" : isAssistant ? "AI" : "System"}
              </span>
              <div style={bubbleStyle}>{m.content}</div>
            </div>
          );
        })}
      </div>

      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading} // Disable input while AI is responding
          placeholder="Type your message..."
          style={{
            flexGrow: 1,
            padding: "0.75rem 1rem",
            fontSize: "1rem",
            borderRadius: 20,
            border: "1px solid #ccc",
            outline: "none",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
            transition: "border-color 0.3s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#0070f3")}
          onBlur={(e) => (e.target.style.borderColor = "#ccc")}
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            borderRadius: 20,
            border: "none",
            backgroundColor: isLoading ? "#888" : "#0070f3",
            color: "white",
            cursor: isLoading ? "not-allowed" : "pointer",
            boxShadow: "0 3px 6px rgba(0, 112, 243, 0.5)",
            transition: "background-color 0.3s",
          }}
        >
          {isLoading ? "Thinking..." : "Send"}
        </button>
      </form>
    </main>
  );
}
