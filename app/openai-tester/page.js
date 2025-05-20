"use client";

import { useState, useRef } from "react";
// We'll try to use the correct import, but also have a fallback
import "./jsoneditor-override.css";

export default function OpenAITester() {
  const [model, setModel] = useState("gpt-4");
  const [instructions, setInstructions] = useState("");
  const [input, setInput] = useState("");
  const [useRoles, setUseRoles] = useState(true);
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState([]);
  const [draggedPanel, setDraggedPanel] = useState(null);
  const [panels, setPanels] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let requestBody;

      if (useRoles) {
        requestBody = {
          model,
          useRoles: true,
          input: [
            {
              role: "system",
              content: instructions,
            },
            {
              role: "user",
              content: input,
            },
          ],
        };
      } else {
        requestBody = {
          model,
          useRoles: false,
          instructions,
          input,
        };
      }

      const response = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result.success) {
        const newPanelId = Date.now();
        const newPanel = {
          id: newPanelId,
          data: result.data,
          position: {
            x: 100 + panels.length * 20,
            y: 100 + panels.length * 20,
          },
        };

        setPanels([...panels, newPanel]);
        setResponses([...responses, result.data]);
      } else {
        console.error("API Error:", result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Request Error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePanelMouseDown = (e, panelId) => {
    if (e.target.closest(".panel-header")) {
      setDraggedPanel({
        id: panelId,
        offsetX: e.clientX - e.currentTarget.getBoundingClientRect().left,
        offsetY: e.clientY - e.currentTarget.getBoundingClientRect().top,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (draggedPanel) {
      setPanels(
        panels.map((panel) => {
          if (panel.id === draggedPanel.id) {
            return {
              ...panel,
              position: {
                x: e.clientX - draggedPanel.offsetX,
                y: e.clientY - draggedPanel.offsetY,
              },
            };
          }
          return panel;
        })
      );
    }
  };

  const handleMouseUp = () => {
    setDraggedPanel(null);
  };

  const closePanel = (panelId) => {
    setPanels(panels.filter((panel) => panel.id !== panelId));
  };

  // Simple function to format JSON for display
  const formatJSON = (json) => {
    return JSON.stringify(json, null, 2);
  };

  return (
    <div
      className="min-h-screen bg-gray-900 text-cyan-400 p-4 flex"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Left Panel */}
      <div className="w-1/3 bg-gray-800 rounded-lg p-6 shadow-lg border border-cyan-700">
        <h1 className="text-2xl font-bold mb-6 text-cyan-300">
          OpenAI API Tester
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">API Mode</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={useRoles}
                  onChange={() => setUseRoles(true)}
                  className="form-radio text-cyan-500"
                />
                <span className="ml-2">Chat Completion (Roles)</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={!useRoles}
                  onChange={() => setUseRoles(false)}
                  className="form-radio text-cyan-500"
                />
                <span className="ml-2">Completion</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {useRoles ? "System Instructions" : "Instructions"}
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Enter instructions for the AI..."
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 h-24 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {useRoles ? "User Input" : "Input"}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your prompt here..."
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 h-32 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Send Request"}
          </button>
        </form>
      </div>

      {/* Floating Response Panels */}
      {panels.map((panel) => (
        <div
          key={panel.id}
          className="absolute bg-gray-800 rounded-lg shadow-xl border border-cyan-700 w-[500px] h-[400px] overflow-hidden flex flex-col"
          style={{
            left: `${panel.position.x}px`,
            top: `${panel.position.y}px`,
            zIndex: draggedPanel?.id === panel.id ? 10 : 1,
          }}
          onMouseDown={(e) => handlePanelMouseDown(e, panel.id)}
        >
          <div className="panel-header bg-gray-700 p-2 flex justify-between items-center cursor-move">
            <h3 className="text-sm font-medium">
              Response {new Date(panel.id).toLocaleTimeString()}
            </h3>
            <button
              onClick={() => closePanel(panel.id)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="flex-1 overflow-auto bg-gray-900 p-4">
            <pre className="text-xs text-cyan-300 font-mono">
              {formatJSON(panel.data)}
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
}
