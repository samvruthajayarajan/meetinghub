'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function MeetingDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);

  useEffect(() => {
    // Redirect to agenda page
    router.push(`/meetings/${resolvedParams.id}/agenda`);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
        <p className="mt-4 text-gray-800">Loading meeting...</p>
      </div>
    </div>
  );
}
