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
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-slate-300">Loading meeting...</p>
      </div>
    </div>
  );
}
