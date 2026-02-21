'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import { format } from 'date-fns';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [meetings, setMeetings] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/meetings');
      if (response.ok) {
        const data = await response.json();
        setMeetings(data);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchMeetings();
    }
  }, [search, status]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meeting Dashboard</h1>
          <button
            onClick={() => router.push('/meetings/new')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Create Meeting
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search meetings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid gap-6">
          {meetings.map((meeting: any) => (
            <div
              key={meeting.id}
              className="bg-slate-900 p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
              onClick={() => router.push(`/meetings/${meeting.id}`)}
            >
              <h3 className="text-xl font-semibold text-gray-900">{meeting.title}</h3>
              <p className="text-gray-600 mt-2">{new Date(meeting.date).toLocaleDateString()}</p>
              <p className="text-gray-500 mt-1">{meeting.location}</p>
              <div className="mt-4 flex gap-2">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                  {meeting.status}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                  {meeting.agendaItems.length} agenda items
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
