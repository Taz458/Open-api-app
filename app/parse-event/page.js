'use client';

import { useState, useEffect } from 'react';

export default function ParseEvent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [event, setEvent] = useState(null);

  const parseEvent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/openai/parse-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4o-2024-08-06",
          input: [
            { role: "system", content: "Extract the event information." },
            {
              role: "user",
              content: "Alice and Bob are going to a science fair on Friday.",
            },
          ],
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to parse event');
      }
      
      setEvent(data.event);
    } catch (err) {
      console.error('Error parsing event:', err);
      setError(err.message || 'Failed to parse event');
    } finally {
      setLoading(false);
    }
  };

  // Parse the event when the component mounts
  useEffect(() => {
    parseEvent();
  }, []);

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Event Parser</h1>
      
      {loading && <p>Loading event information...</p>}
      
      {error && (
        <div className="mb-4">
          <p className="text-red-500">Error: {error}</p>
          <button 
            onClick={parseEvent}
            className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      )}
      
      {event && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Parsed Event</h2>
          <ul className="mb-4">
            <li><strong>Name:</strong> {event.name}</li>
            <li><strong>Date:</strong> {event.date}</li>
            <li>
              <strong>Participants:</strong>
              <ul className="list-disc ml-6">
                {event.participants.map((participant, index) => (
                  <li key={index}>{participant}</li>
                ))}
              </ul>
            </li>
          </ul>
          
          <pre className="bg-gray-100 p-3 rounded text-black">{JSON.stringify(event, null, 2)}</pre>
        </div>
      )}
    </div>
  );
} 