'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-4 text-gray-800">Loading...</p>
        </div>
      </div>
    );
  }

  const currentDate = new Date();
  const greeting = `Good ${currentDate.getHours() < 12 ? 'Morning' : currentDate.getHours() < 18 ? 'Afternoon' : 'Evening'}`;
  
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'create', name: 'Create Meeting', icon: 'M12 4v16m8-8H4' },
    { id: 'meetings', name: 'My Meetings', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id: 'minutes', name: 'Minutes', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    { id: 'reports', name: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'profile', name: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  const totalMeetings = meetings.length;
  const draftMeetings = meetings.filter(m => m.status === 'DRAFT').length;
  const publishedMeetings = meetings.filter(m => m.status === 'PUBLISHED').length;
  const upcomingMeetings = meetings.filter(m => new Date(m.date) > new Date()).length;
  const completedMeetings = meetings.filter(m => new Date(m.date) < new Date()).length;
  const todayMeetings = meetings.filter(m => {
    const meetingDate = new Date(m.date);
    const today = new Date();
    return meetingDate.toDateString() === today.toDateString();
  }).length;
  const recentMeetings = meetings.slice(0, 5);

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out shadow-sm`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-gray-200">
            <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-gray-800">MeetingHub</span>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  setSidebarOpen(false);
                  if (item.id === 'create') {
                    router.push('/meetings/new');
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeMenu === item.id
                    ? 'bg-gray-100 text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                {session?.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{session?.user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-white">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-gray-600 hover:text-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <p className="text-sm text-gray-500">{greeting}, {session?.user?.name?.split(' ')[0]}</p>
                <p className="text-xs text-gray-400">{currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>
            <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-all border border-gray-200">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        {activeMenu === 'dashboard' && (
          <div className="p-6">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Your Meetings</h1>
              <h2 className="text-3xl font-bold text-gray-400">Efficiently Today!</h2>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Drafts Card */}
              <div className="project-card green">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Drafts</h3>
                  <div className="avatar-group mb-3">
                    <div className="avatar" style={{ background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)' }}>
                      <span className="text-white text-xs">{session?.user?.name?.charAt(0)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-700 font-medium">Draft meetings</span>
                    <span className="text-gray-600">{draftMeetings}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(draftMeetings / Math.max(totalMeetings, 1)) * 100}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Reports Card */}
              <div className="project-card yellow">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Reports</h3>
                  <div className="avatar-group mb-3">
                    <div className="avatar" style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)' }}>
                      <span className="text-white text-xs">{session?.user?.name?.charAt(0)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-700 font-medium">Total reports</span>
                    <span className="text-gray-600">{publishedMeetings}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(publishedMeetings / Math.max(totalMeetings, 1)) * 100}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Meetings Card */}
              <div className="project-card green">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Meetings</h3>
                  <div className="avatar-group mb-3">
                    <div className="avatar" style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)' }}>
                      <span className="text-white text-xs">{session?.user?.name?.charAt(0)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-700 font-medium">Total meetings</span>
                    <span className="text-gray-600">{totalMeetings}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>

              {/* Upcoming Card */}
              <div className="project-card yellow">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Upcoming</h3>
                  <div className="avatar-group mb-3">
                    <div className="avatar" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }}>
                      <span className="text-white text-xs">{session?.user?.name?.charAt(0)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-700 font-medium">Future meetings</span>
                    <span className="text-gray-600">{upcomingMeetings}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(upcomingMeetings / Math.max(totalMeetings, 1)) * 100}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Completed Card */}
              <div className="project-card green">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Completed</h3>
                  <div className="avatar-group mb-3">
                    <div className="avatar" style={{ background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)' }}>
                      <span className="text-white text-xs">{session?.user?.name?.charAt(0)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-700 font-medium">Past meetings</span>
                    <span className="text-gray-600">{completedMeetings}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(completedMeetings / Math.max(totalMeetings, 1)) * 100}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Today Card */}
              <div className="project-card yellow">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Today</h3>
                  <div className="avatar-group mb-3">
                    <div className="avatar" style={{ background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)' }}>
                      <span className="text-white text-xs">{session?.user?.name?.charAt(0)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-700 font-medium">Today's meetings</span>
                    <span className="text-gray-600">{todayMeetings}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: todayMeetings > 0 ? '100%' : '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Task Section */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Recent Task</h2>
                <button 
                  onClick={() => setActiveMenu('meetings')}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  See All
                </button>
              </div>

              {recentMeetings.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-gray-400 mb-4">No meetings yet</p>
                  <button
                    onClick={() => router.push('/meetings/new')}
                    className="px-6 py-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors shadow-sm font-medium"
                  >
                    Create Your First Meeting
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentMeetings.map((meeting) => (
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
          </div>
        )}

        {/* Meetings Page */}
        {activeMenu === 'meetings' && (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">My Meetings</h1>
              <p className="text-gray-600">View and manage all your meetings</p>
            </div>

            {meetings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl shadow-sm border border-gray-200">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-400 mb-4">No meetings yet</p>
                <button
                  onClick={() => router.push('/meetings/new')}
                  className="px-6 py-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors shadow-sm font-medium"
                >
                  Create Your First Meeting
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {meetings.map((meeting) => (
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
                          {new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        meeting.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {meeting.status}
                      </span>
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
        )}

        {/* Reports Page */}
        {activeMenu === 'reports' && (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Meeting Reports</h1>
              <p className="text-gray-600">Generate and download meeting reports</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      meeting.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {meeting.status === 'PUBLISHED' ? 'Available' : 'Draft'}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{meeting.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {new Date(meeting.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => router.push(`/meetings/${meeting.id}/agenda`)}
                      className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      View Agenda
                    </button>
                    <button
                      onClick={() => router.push(`/meetings/${meeting.id}/minutes`)}
                      className="w-full px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      View Minutes
                    </button>
                    <button
                      onClick={() => router.push(`/meetings/${meeting.id}/reports`)}
                      className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Report
                    </button>
                  </div>
                </div>
              ))}
              
              {meetings.length === 0 && (
                <div className="col-span-full text-center py-12 bg-white rounded-3xl shadow-sm border border-gray-200">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-400 mb-4">No reports available yet</p>
                  <button
                    onClick={() => router.push('/meetings/new')}
                    className="px-6 py-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors font-medium"
                  >
                    Create Your First Meeting
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Minutes Page */}
        {activeMenu === 'minutes' && (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Meeting Minutes</h1>
              <p className="text-gray-600">Generate and manage meeting minutes</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      meeting.minutes ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {meeting.minutes ? 'Generated' : 'Pending'}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{meeting.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {new Date(meeting.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  
                  <button
                    onClick={() => router.push(`/meetings/${meeting.id}/minutes`)}
                    className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {meeting.minutes ? 'View Minutes' : 'Generate Minutes'}
                  </button>
                </div>
              ))}
              
              {meetings.length === 0 && (
                <div className="col-span-full text-center py-12 bg-white rounded-3xl shadow-sm border border-gray-200">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <p className="text-gray-400 mb-4">No meetings available</p>
                  <button
                    onClick={() => router.push('/meetings/new')}
                    className="px-6 py-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors font-medium"
                  >
                    Create Your First Meeting
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Page */}
        {activeMenu === 'profile' && (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
              <p className="text-gray-600">Manage your account settings</p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 max-w-2xl">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md">
                  {session?.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{session?.user?.name}</h2>
                  <p className="text-gray-600">{session?.user?.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {session?.user?.role || 'USER'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={session?.user?.name || ''}
                    disabled
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={session?.user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800"
                  />
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => router.push('/auth/signin')}
                    className="px-6 py-3 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-colors font-medium"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
