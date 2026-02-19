'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function EmailConfigForm({ session }: { session: any }) {
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    fetchCurrentConfig();
  }, []);

  const fetchCurrentConfig = async () => {
    try {
      const response = await fetch('/api/users/smtp-config');
      if (response.ok) {
        const data = await response.json();
        if (data.smtpHost) setSmtpHost(data.smtpHost);
        if (data.smtpPort) setSmtpPort(data.smtpPort.toString());
        if (data.smtpUser) setSmtpUser(data.smtpUser);
        // Don't show password for security
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validation
    if (smtpHost && smtpHost.includes('@')) {
      setMessage('Error: SMTP Host should be "smtp.gmail.com", not an email address. Please remove the @ symbol.');
      setLoading(false);
      return;
    }

    if (smtpHost && !smtpHost.includes('.')) {
      setMessage('Error: SMTP Host should be a domain like "smtp.gmail.com"');
      setLoading(false);
      return;
    }

    if (smtpUser && !smtpUser.includes('@')) {
      setMessage('Error: Email Address should be a valid email like "yourname@gmail.com"');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/users/smtp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpHost: smtpHost || null,
          smtpPort: smtpPort ? parseInt(smtpPort) : null,
          smtpUser: smtpUser || null,
          smtpPassword: smtpPassword || null
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Email configuration saved successfully!');
        setSmtpPassword(''); // Clear password field after save
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('Are you sure you want to remove your email configuration? Emails will be sent using system defaults.')) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/users/smtp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpHost: null,
          smtpPort: null,
          smtpUser: null,
          smtpPassword: null
        })
      });

      if (response.ok) {
        setSmtpHost('');
        setSmtpPort('587');
        setSmtpUser('');
        setSmtpPassword('');
        setMessage('Email configuration cleared successfully!');
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setLoading(true);
    setMessage('Testing SMTP connection...');

    try {
      const response = await fetch('/api/test-smtp', {
        method: 'POST'
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Success! SMTP configuration is valid. Password length: ${data.config.passwordLength} characters`);
      } else {
        // Better error display
        let errorMsg = '❌ Test Failed:\n\n';
        if (data.error) errorMsg += `Error: ${data.error}\n`;
        if (data.details) {
          if (typeof data.details === 'object') {
            errorMsg += `Details:\n${JSON.stringify(data.details, null, 2)}`;
          } else {
            errorMsg += `Details: ${data.details}`;
          }
        }
        errorMsg += '\n\nCheck the server console for more information.';
        setMessage(errorMsg);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingConfig) {
    return <div className="text-slate-400">Loading configuration...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="bg-slate-700/30 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">SMTP Settings</h3>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            SMTP Host <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={smtpHost}
            onChange={(e) => setSmtpHost(e.target.value)}
            placeholder="smtp.gmail.com"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-400 mt-1">
            <strong>Server address only</strong> (not your email address)<br/>
            Gmail: <code className="bg-slate-900 px-1 rounded">smtp.gmail.com</code> | 
            Outlook: <code className="bg-slate-900 px-1 rounded">smtp-mail.outlook.com</code>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            SMTP Port <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            value={smtpPort}
            onChange={(e) => setSmtpPort(e.target.value)}
            placeholder="587"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-400 mt-1">
            Use <code className="bg-slate-900 px-1 rounded">587</code> for TLS or <code className="bg-slate-900 px-1 rounded">465</code> for SSL
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Email Address <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={smtpUser}
            onChange={(e) => setSmtpUser(e.target.value)}
            placeholder="your-email@gmail.com"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-400 mt-1">
            <strong>Your full email address</strong> (e.g., yourname@gmail.com)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            App Password <span className="text-red-400">*</span>
          </label>
          <input
            type="password"
            value={smtpPassword}
            onChange={(e) => setSmtpPassword(e.target.value)}
            placeholder="Enter new password or leave blank to keep current"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-400 mt-1">
            For Gmail: Generate an App Password at{' '}
            <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              myaccount.google.com/apppasswords
            </a>
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('Error') ? 'bg-red-500/20 border border-red-500/30 text-red-300' : 'bg-green-500/20 border border-green-500/30 text-green-300'}`}>
          {message}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition-colors font-medium"
        >
          {loading ? 'Saving...' : 'Save Configuration'}
        </button>
        <button
          type="button"
          onClick={handleTest}
          disabled={loading}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-lg transition-colors font-medium"
        >
          Test Connection
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={loading}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white rounded-lg transition-colors font-medium"
        >
          Clear Configuration
        </button>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-yellow-300 text-sm font-medium mb-1">Security Note</p>
            <p className="text-yellow-200 text-xs">
              Your credentials are stored securely in the database. Never share your app password with anyone.
              For Gmail, use App Passwords instead of your regular password.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMeetingForEmail, setSelectedMeetingForEmail] = useState<any>(null);
  const [selectedMeetingForWhatsApp, setSelectedMeetingForWhatsApp] = useState<any>(null);
  const [emailRecipients, setEmailRecipients] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [sending, setSending] = useState(false);

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

  const handleDeleteMeeting = async (meetingId: string, meetingTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${meetingTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/meetings/${meetingId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete meeting');
      }
      
      alert('Meeting deleted successfully!');
      fetchMeetings(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting meeting:', error);
      alert(`Failed to delete meeting: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'create', name: 'Create Meeting', icon: 'M12 4v16m8-8H4' },
    { id: 'meetings', name: 'My Meetings', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id: 'reports', name: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'profile', name: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  const totalMeetings = meetings.length;
  const draftReports = meetings.filter(m => !m.reports || m.reports.length === 0).length;
  const finalReports = meetings.filter(m => m.reports && m.reports.length > 0).length;
  const recentMeetings = meetings.slice(0, 5);

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-700 transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-slate-700">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">MeetingHub</span>
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeMenu === item.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
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
          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-slate-700/50 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                {session?.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{session?.user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-200"
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
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-700 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-slate-300 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-white">
                {activeMenu === 'dashboard' && 'Dashboard'}
                {activeMenu === 'create' && 'Create Meeting'}
                {activeMenu === 'meetings' && 'My Meetings'}
                {activeMenu === 'reports' && 'Reports'}
                {activeMenu === 'profile' && 'Profile'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400">Welcome, {session?.user?.name}</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        {activeMenu === 'dashboard' && (
          <div className="p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-7000/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{totalMeetings}</h3>
                <p className="text-slate-400 text-sm">Total Meetings</p>
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{draftReports}</h3>
                <p className="text-slate-400 text-sm">Draft Reports</p>
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{finalReports}</h3>
                <p className="text-slate-400 text-sm">Final Reports</p>
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-cyan-600/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{recentMeetings.length}</h3>
                <p className="text-slate-400 text-sm">Recent Meetings</p>
              </div>
            </div>

            {/* Recently Created Meetings */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recently Created Meetings</h2>
                <button
                  onClick={() => router.push('/meetings/new')}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 text-sm font-medium"
                >
                  Create New
                </button>
              </div>

              {recentMeetings.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-slate-400 mb-4">No meetings yet</p>
                  <button
                    onClick={() => router.push('/meetings/new')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Meeting
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="flex items-center justify-between p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-all duration-200 border border-slate-600 hover:border-blue-500"
                    >
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{meeting.title}</h3>
                        <p className="text-slate-400 text-sm">
                          {new Date(meeting.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          meeting.reports && meeting.reports.length > 0
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {meeting.reports && meeting.reports.length > 0 ? 'Completed' : 'Draft'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/meetings/${meeting.id}/agenda`);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                          Agenda
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/meetings/${meeting.id}/minutes`);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Minutes
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/meetings/${meeting.id}/reports`);
                          }}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Reports
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMeeting(meeting.id, meeting.title);
                          }}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/meetings/${meeting.id}`);
                          }}
                          className="text-slate-400 hover:text-white transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Other Menu Content Placeholders */}
        {activeMenu === 'meetings' && (
          <div className="p-6">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">My Meetings</h2>
                <button
                  onClick={() => router.push('/meetings/new')}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New
                </button>
              </div>

              {meetings.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-slate-400 mb-4">No meetings yet</p>
                  <button
                    onClick={() => router.push('/meetings/new')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Meeting
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {meetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-all duration-200 border border-slate-600 hover:border-blue-500"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg mb-1">{meeting.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span>{new Date(meeting.date).toLocaleDateString()}</span>
                            <span>{new Date(meeting.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="capitalize">{meeting.meetingMode || 'Offline'}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          meeting.reports && meeting.reports.length > 0
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {meeting.reports && meeting.reports.length > 0 ? 'Completed' : 'Draft'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => router.push(`/meetings/${meeting.id}/agenda`)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          Agenda
                        </button>
                        <button
                          onClick={() => router.push(`/meetings/${meeting.id}/minutes`)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          Minutes
                        </button>
                        <button
                          onClick={() => router.push(`/meetings/${meeting.id}/reports`)}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          Reports
                        </button>
                        <button
                          onClick={() => router.push(`/meetings/${meeting.id}/edit`)}
                          className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMeeting(meeting.id, meeting.title)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeMenu === 'reports' && (
          <div className="p-6">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Meeting Reports</h2>

              {meetings.filter(m => m.reports && m.reports.length > 0).length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-slate-400 mb-2">No reports generated yet</p>
                  <p className="text-slate-500 text-sm">Generate reports from the meeting's Reports page</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {meetings
                    .filter(m => m.reports && m.reports.length > 0)
                    .map((meeting) => {
                      // Parse agenda data
                      let agendaSummary = 'No agenda';
                      let agendaItemsCount = 0;
                      if (meeting.description) {
                        try {
                          const parsed = JSON.parse(meeting.description);
                          if (parsed.savedAgendas && parsed.savedAgendas.length > 0) {
                            const latestAgenda = parsed.savedAgendas[parsed.savedAgendas.length - 1];
                            agendaItemsCount = latestAgenda.agendaItems?.length || 0;
                            agendaSummary = `${agendaItemsCount} agenda item${agendaItemsCount !== 1 ? 's' : ''}`;
                          }
                        } catch (e) {
                          // Not JSON
                        }
                      }

                      // Parse minutes data
                      let minutesSummary = 'No minutes';
                      let attendeesCount = 0;
                      let actionItemsCount = 0;
                      if (meeting.minutes?.discussions) {
                        try {
                          const parsed = JSON.parse(meeting.minutes.discussions);
                          if (parsed.savedMinutes && parsed.savedMinutes.length > 0) {
                            const latestMinutes = parsed.savedMinutes[parsed.savedMinutes.length - 1];
                            attendeesCount = latestMinutes.attendees?.length || 0;
                            actionItemsCount = latestMinutes.actionItems?.length || 0;
                            minutesSummary = `${attendeesCount} attendee${attendeesCount !== 1 ? 's' : ''}, ${actionItemsCount} action item${actionItemsCount !== 1 ? 's' : ''}`;
                          }
                        } catch (e) {
                          // Not JSON
                        }
                      }

                      return (
                        <div
                          key={meeting.id}
                          className="p-5 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-green-500 transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-white font-semibold text-lg mb-2">{meeting.title}</h3>
                              <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {new Date(meeting.date).toLocaleDateString()}
                                </span>
                                <span className="text-green-400 flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  {meeting.reports.length} Report{meeting.reports.length > 1 ? 's' : ''}
                                </span>
                              </div>
                              
                              {/* Agenda Summary */}
                              <div className="mb-2 p-3 bg-slate-7000/10 border border-blue-500/30 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                  </svg>
                                  <span className="text-xs font-semibold text-blue-400">Agenda</span>
                                </div>
                                <p className="text-sm text-blue-300">{agendaSummary}</p>
                              </div>

                              {/* Minutes Summary */}
                              <div className="mb-2 p-3 bg-slate-7000/10 border border-purple-500/30 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span className="text-xs font-semibold text-purple-400">Minutes</span>
                                </div>
                                <p className="text-sm text-purple-300">{minutesSummary}</p>
                              </div>

                              <p className="text-xs text-slate-500">Last generated: {new Date(meeting.reports[0].generatedAt).toLocaleString()}</p>
                            </div>
                            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                              Completed
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => router.push(`/meetings/${meeting.id}/reports`)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View Reports
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  const response = await fetch(`/api/meetings/${meeting.id}/pdf`);
                                  if (!response.ok) throw new Error('Failed to download PDF');
                                  
                                  const blob = await response.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `meeting-report-${meeting.title.replace(/\s+/g, '-')}.pdf`;
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                  window.URL.revokeObjectURL(url);
                                } catch (error) {
                                  console.error('Error downloading PDF:', error);
                                  alert('Failed to download PDF');
                                }
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Download PDF
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  const response = await fetch(`/api/meetings/${meeting.id}/agenda-pdf`);
                                  if (!response.ok) throw new Error('Failed to download agenda PDF');
                                  
                                  const blob = await response.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `agenda-${meeting.title.replace(/\s+/g, '-')}.pdf`;
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                  window.URL.revokeObjectURL(url);
                                } catch (error) {
                                  console.error('Error downloading agenda PDF:', error);
                                  alert('Failed to download agenda PDF');
                                }
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Agenda PDF
                            </button>
                            <button
                              onClick={() => setSelectedMeetingForEmail(meeting)}
                              className="px-4 py-2 bg-cyan-600 hover:bg-slate-7000 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Email
                            </button>
                            <button
                              onClick={() => setSelectedMeetingForWhatsApp(meeting)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                              WhatsApp
                            </button>
                            <button
                              onClick={() => router.push(`/meetings/${meeting.id}/agenda`)}
                              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              View Meeting
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeMenu === 'profile' && (
          <div className="p-6">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Email Configuration</h2>
              
              <div className="bg-slate-7000/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-blue-300 text-sm font-medium mb-1">Configure Your Email Settings</p>
                    <p className="text-blue-200 text-xs">
                      Add your own SMTP credentials to send emails from your email address. 
                      If not configured, the system will use default SMTP settings (if available).
                    </p>
                  </div>
                </div>
              </div>

              <EmailConfigForm session={session} />
            </div>
          </div>
        )}
      </main>

      {/* Email Modal */}
      {selectedMeetingForEmail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl p-6 max-w-md w-full border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">Send Report via Email</h3>
            <p className="text-slate-300 mb-4">Meeting: {selectedMeetingForEmail.title}</p>
            <input
              type="text"
              value={emailRecipients}
              onChange={(e) => setEmailRecipients(e.target.value)}
              placeholder="Enter your email here..."
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <p className="text-xs text-slate-400 mb-4">Separate multiple emails with commas</p>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (!emailRecipients.trim()) {
                    alert('Please enter at least one email address');
                    return;
                  }
                  setSending(true);
                  try {
                    const recipients = emailRecipients.split(',').map(email => email.trim());
                    const response = await fetch(`/api/meetings/${selectedMeetingForEmail.id}/email`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ recipients }),
                    });
                    if (!response.ok) {
                      const data = await response.json();
                      throw new Error(data.error || 'Failed to send email');
                    }
                    alert('Email sent successfully!');
                    setSelectedMeetingForEmail(null);
                    setEmailRecipients('');
                  } catch (error: any) {
                    alert(`Failed to send email: ${error.message}`);
                  } finally {
                    setSending(false);
                  }
                }}
                disabled={sending}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition-colors font-medium"
              >
                {sending ? 'Sending...' : 'Send Email'}
              </button>
              <button
                onClick={() => {
                  setSelectedMeetingForEmail(null);
                  setEmailRecipients('');
                }}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {selectedMeetingForWhatsApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl p-6 max-w-md w-full border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">Send Report via WhatsApp</h3>
            <p className="text-slate-300 mb-4">Meeting: {selectedMeetingForWhatsApp.title}</p>
            <textarea
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              rows={4}
              placeholder="Enter WhatsApp numbers (one per line, with country code)&#10;Example:&#10;+1234567890&#10;+9876543210&#10;+1122334455"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 mb-2 resize-none"
            />
            <p className="text-xs text-slate-400 mb-4">Enter one phone number per line. Include country code (e.g., +1234567890)</p>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (!whatsappNumber.trim()) {
                    alert('Please enter at least one WhatsApp number');
                    return;
                  }
                  setSending(true);
                  try {
                    // Split by newlines and filter empty lines
                    const phoneNumbers = whatsappNumber
                      .split('\n')
                      .map(num => num.trim())
                      .filter(num => num.length > 0);
                    
                    if (phoneNumbers.length === 0) {
                      alert('Please enter at least one valid phone number');
                      setSending(false);
                      return;
                    }

                    const response = await fetch(`/api/meetings/${selectedMeetingForWhatsApp.id}/whatsapp`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ phoneNumbers }),
                    });
                    if (!response.ok) throw new Error('Failed to generate WhatsApp messages');
                    const data = await response.json();
                    
                    // Close modal and reset state
                    setSelectedMeetingForWhatsApp(null);
                    setWhatsappNumber('');
                    setSending(false);
                    
                    // For single recipient, navigate directly
                    if (data.urls.length === 1) {
                      window.location.href = data.urls[0].url;
                      return;
                    }
                    
                    // For multiple recipients, show instructions
                    alert(`PDFs generated successfully!\n\nYou have ${data.urls.length} recipients.\n\nYou'll be redirected to WhatsApp for each recipient one by one.\n\nAfter sending each message, close the WhatsApp tab to continue to the next recipient.`);
                    
                    // Open WhatsApp for recipients sequentially
                    let currentIndex = 0;
                    const openNextWhatsApp = () => {
                      if (currentIndex < data.urls.length) {
                        const item = data.urls[currentIndex];
                        const recipientNumber = item.phoneNumber;
                        
                        const shouldOpen = confirm(`Ready to send to recipient ${currentIndex + 1} of ${data.urls.length}?\n\nNumber: ${recipientNumber}\n\nClick OK to open WhatsApp.`);
                        
                        if (shouldOpen) {
                          currentIndex++;
                          // Navigate to WhatsApp in current tab
                          window.location.href = item.url;
                        } else {
                          if (currentIndex > 0) {
                            alert(`Sent to ${currentIndex} recipient(s). Remaining ${data.urls.length - currentIndex} cancelled.`);
                          }
                        }
                      }
                    };
                    
                    openNextWhatsApp();
                    
                  } catch (error: any) {
                    alert(`Failed to send WhatsApp: ${error.message}`);
                    setSending(false);
                  }
                }}
                disabled={sending}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-lg transition-colors font-medium"
              >
                {sending ? 'Generating...' : 'Send WhatsApp'}
              </button>
              <button
                onClick={() => {
                  setSelectedMeetingForWhatsApp(null);
                  setWhatsappNumber('');
                }}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
