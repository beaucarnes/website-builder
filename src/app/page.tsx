// src/app/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Generate a unique ID for the new site on the client
    const siteId = uuidv4();

    await fetch('/api/start-generation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, siteId }), // Send the siteId to the backend
    });

    // Redirect to the new site's viewing/polling page
    router.push(`/sites/${siteId}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-xl">
        <h1 className="text-4xl font-bold text-center mb-6">AI Website Builder</h1>
        <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A modern website for a bakery..."
          className="w-full h-32 p-2 border rounded text-black bg-white" 
        />
          <button
            type="submit" disabled={isLoading}
            className="w-full mt-4 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            {isLoading ? 'Building...' : 'Build My Website'}
          </button>
        </form>
      </div>
    </main>
  );
}