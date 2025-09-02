// src/app/sites/[siteId]/page.tsx

import SiteViewer from '@/components/SiteViewer'; // Import the new client component

// This remains an async Server Component
export default async function SiteViewerPage({ params }: { params: { siteId: string } }) {
  // Its only job is to get server-side data like params
  const { siteId } = params;

  // It then passes that data as a prop to the Client Component
  return <SiteViewer siteId={siteId} />;
}