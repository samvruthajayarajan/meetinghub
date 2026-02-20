'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchMeetings();
    }
  }, [status]);

  const fetchMeetings = async () => {
    try {
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

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(135deg, #e8f5f1 0%, #f0f4f8 50%, #f5f7f6 100%)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const currentDate = new Date();
  const greeting = `Good ${currentDate.getHours() < 12 ? 'Morning' : currentDate.getHours() < 18 ? 'Afternoon' : 'Evening'}`;
  const recentMeetings = meetings.slice(0, 5);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #e8f5f1 0%, #f0f4f8 50%, #f5f7f6 100%)' }}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-all">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <p className="text-sm text-gray-500">{greeting}, {session?.user?.name?.split(' ')[0]}</p>
                <p className="text-xs text-gray-400">{currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>
            <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-all">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Let's Build Something</h1>
          <h2 className="text-3xl font-bold text-gray-400">Great Today!</h2>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* App Redesign Card */}
          <div className="project-card green">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">App Redesign</h3>
              <div className="avatar-group mb-3">
                <div className="avatar" style={{ background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)' }}>
                  <span className="text-white text-xs">A</span>
                </div>
                <div className="avatar" style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)' }}>
                  <span className="text-white text-xs">B</span>
                </div>
                <div className="avatar" style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)' }}>
                  <span className="text-white text-xs">C</span>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">User persona</span>
                <span className="text-gray-500">3/10</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '30%' }}></div>
              </div>
            </div>
          </div>

          {/* Web Update Card */}
          <div className="project-card green">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Web Update</h3>
              <div className="avatar-group mb-3">
                <div className="avatar" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }}>
                  <span className="text-white text-xs">D</span>
                </div>
                <div className="avatar" style={{ background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)' }}>
                  <span className="text-white text-xs">E</span>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">Sitemap</span>
                <span className="text-gray-500">4/10</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>

          {/* Dashboard Card */}
          <div className="project-card peach">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Dashboard</h3>
              <div className="avatar-group mb-3">
                <div className="avatar" style={{ background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)' }}>
                  <span className="text-white text-xs">F</span>
                </div>
                <div className="avatar" style={{ background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)' }}>
                  <span className="text-white text-xs">G</span>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">User research</span>
                <span className="text-gray-500">2/10</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '20%' }}></div>
              </div>
            </div>
          </div>

          {/* Add New Card */}
          <div className="add-card" onClick={() => router.push('/meetings/new')}>
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>

        {/* Recent Task Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Recent Task</h2>
            <button className="text-sm text-gray-500 hover:text-gray-700 font-medium">See All</button>
          </div>

          {recentMeetings.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-400 mb-4">No meetings yet</p>
              <button
                onClick={() => router.push('/meetings/new')}
                className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors shadow-md soft-button"
              >
                Create Your First Meeting
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMeetings.map((meeting, index) => (
                <div
                  key={meeting.id}
                  className="meeting-card cursor-pointer"
                  onClick={() => router.push(`/meetings/${meeting.id}`)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-800 font-medium mb-1">{meeting.title}</h3>
                      <p className="text-sm text-gray-500">
                        {meeting.location || 'Meeting'} • {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="avatar-group">
                      <div className="avatar" style={{ background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)' }}>
                        <span className="text-white text-xs">{session?.user?.name?.charAt(0)}</span>
                      </div>
                    </div>
                  </div>
                  <button className="action-button">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
