'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CreateMeeting() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    organizer: '',
    description: '',
    participants: '',
    meetingMode: 'offline',
    meetingLink: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
    if (status === 'authenticated' && session?.user?.name) {
      setFormData(prev => ({ ...prev, organizer: session.user.name || '' }));
    }
  }, [status, session, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (action: 'draft' | 'publish') => {
    setLoading(true);
    setError('');

    // Validation
    if (!formData.title || !formData.date || !formData.time) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if ((formData.meetingMode === 'online') && !formData.meetingLink) {
      setError('Meeting link is required for online meetings');
      setLoading(false);
      return;
    }

    try {
      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`);

      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          date: dateTime.toISOString(),
          location: formData.organizer,
          description: formData.description,
          status: action === 'draft' ? 'DRAFT' : 'PUBLISHED',
          participants: formData.participants.split(',').map(p => p.trim()).filter(p => p),
          meetingMode: formData.meetingMode,
          meetingLink: formData.meetingLink || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create meeting');
      }

      const data = await response.json();
      router.push(`/meetings/${data.id}`);
    } catch (err) {
      setError('Failed to create meeting. Please try again.');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/user');
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-green-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-green-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/user')}
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-green-800">Create New Meeting</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white border border-green-200 rounded-xl p-8 shadow-lg">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-600 px-4 py-3 rounded-xl flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6">
            {/* Meeting Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-green-800 mb-2">
                Meeting Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-green-300 rounded-xl text-green-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm"
                placeholder="Enter meeting title"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-semibold text-green-800 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-green-300 rounded-xl text-green-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-semibold text-green-800 mb-2">
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  required
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-green-300 rounded-xl text-green-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Presenter */}
            <div>
              <label htmlFor="organizer" className="block text-sm font-semibold text-green-800 mb-2">
                Presenter
              </label>
              <input
                type="text"
                id="organizer"
                name="organizer"
                value={formData.organizer}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-green-300 rounded-xl text-green-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm"
                placeholder="Enter presenter name"
              />
            </div>

            {/* Meeting Mode */}
            <div>
              <label htmlFor="meetingMode" className="block text-sm font-semibold text-green-800 mb-2">
                Meeting Mode <span className="text-red-500">*</span>
              </label>
              <select
                id="meetingMode"
                name="meetingMode"
                required
                value={formData.meetingMode}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-green-300 rounded-xl text-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm"
              >
                <option value="offline">Offline</option>
                <option value="online">Online</option>
              </select>
            </div>

            {/* Meeting Link - Only show for Online */}
            {formData.meetingMode === 'online' && (
              <div>
                <label htmlFor="meetingLink" className="block text-sm font-semibold text-green-800 mb-2">
                  Meeting Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  id="meetingLink"
                  name="meetingLink"
                  required
                  value={formData.meetingLink}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-green-300 rounded-xl text-green-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm"
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                />
                <p className="mt-2 text-sm text-green-600">Enter the Google Meet, Zoom, or Teams link</p>
              </div>
            )}

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-green-800 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-green-300 rounded-xl text-green-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none shadow-sm"
                placeholder="Enter meeting description or notes"
              />
            </div>

            {/* Participants */}
            <div>
              <label htmlFor="participants" className="block text-sm font-semibold text-green-800 mb-2">
                Participants
              </label>
              <input
                type="text"
                id="participants"
                name="participants"
                value={formData.participants}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-green-300 rounded-xl text-green-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm"
                placeholder="Enter participant names separated by commas"
              />
              <p className="mt-2 text-sm text-green-600">Separate multiple participants with commas</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-green-200">
              <button
                type="button"
                onClick={() => handleSubmit('draft')}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-white hover:bg-gray-100 text-green-800 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                {loading ? 'Saving...' : 'Save as Draft'}
              </button>

              <button
                type="button"
                onClick={() => handleSubmit('publish')}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {loading ? 'Publishing...' : 'Publish Meeting'}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-3 bg-white hover:bg-white text-gray-300 hover:text-green-800 font-semibold rounded-xl border border-green-300 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}



