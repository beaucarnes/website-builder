// src/components/SiteViewer.tsx

'use client'; 

import { useEffect, useState } from 'react';

function useSitePoller(siteId: string) {
  const [siteData, setSiteData] = useState<{ htmlcode: string } | null>(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!siteId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/generation-status?siteId=${siteId}`);
        const data = await res.json();

        if (data.status === 'COMPLETED') {
          setSiteData(data.site);
          clearInterval(interval);
        }
      } catch (err) {
        setIsError(true);
        clearInterval(interval);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [siteId]);

  return { siteData, isLoading: !siteData && !isError, isError };
}

// The new client component that accepts siteId as a prop
export default function SiteViewer({ siteId }: { siteId: string }) {
  const { siteData, isLoading } = useSitePoller(siteId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Building your masterpiece...</h1>
        <p className="text-gray-500">This may take a minute. Please wait.</p>
      </div>
    );
  }

  if (!siteData?.htmlcode) {
    return <div>Error loading site or site not found.</div>;
  }
  
  return <div dangerouslySetInnerHTML={{ __html: siteData.htmlcode }} />;
}