'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function EmailConfigForm({ session }: { session: any }) {
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(587);
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
        if (data.smtpPort) setSmtpPort(data.smtpPort);
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
    if (!smtpUser || !smtpUser.includes('@')) {
      setMessage('Error: Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!smtpPassword) {
      setMessage('Error: Please enter your Gmail App Password');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/users/smtp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpHost,
          smtpPort,
          smtpUser,
          smtpPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Email configuration saved successfully! You can now send emails from your account.');
        setSmtpPassword(''); // Clear password field after saving
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
    if (!confirm('Are you sure you want to remove your email configuration?')) {
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
        setSmtpHost('smtp.gmail.com');
        setSmtpPort(587);
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
    setMessage('Testing email connection...');

    try {
      const response = await fetch('/api/test-smtp', {
        method: 'POST'
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Success! Email configuration is working correctly.`);
      } else {
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
    return <div className="text-gray-400">Loading configuration...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="bg-gray-900 rounded-xl p-6 space-y-4 border border-gray-800 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <h3 className="text-lg font-semibold text-white">Google OAuth Configuration</h3>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-300 mb-3 font-semibold">
            📋 Quick Setup Guide:
          </p>
          <div className="space-y-3 text-xs text-gray-400">
            <div className="flex gap-2">
              <span className="text-purple-400 font-bold">1.</span>
              <div>
                <strong className="text-gray-300">Create Google Cloud Project:</strong>
                <br/>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">console.cloud.google.com</a> → New Project
              </div>
            </div>
            <div className="flex gap-2">
              <span className="text-purple-400 font-bold">2.</span>
              <div>
                <strong className="text-gray-300">Enable Gmail API:</strong>
                <br/>APIs & Services → Library → Search "Gmail API" → Enable
              </div>
            </div>
            <div className="flex gap-2">
              <span className="text-purple-400 font-bold">3.</span>
              <div>
                <strong className="text-gray-300">Configure OAuth Consent:</strong>
                <br/>OAuth consent screen → Select user type:
                <br/>• <strong className="text-purple-300">External</strong>: For personal/Gmail accounts (most common)
                <br/>• <strong className="text-gray-400">Internal</strong>: Only if you have Google Workspace
                <br/>Add scope: <code className="bg-gray-900 px-1 rounded">gmail.send</code> → Add test users (your email)
              </div>
            </div>
            <div className="flex gap-2">
              <span className="text-purple-400 font-bold">4.</span>
              <div>
                <strong className="text-gray-300">Create OAuth Credentials:</strong>
                <br/>Credentials → Create → OAuth client ID → Web application
                <br/>Add redirect URI: <code className="bg-gray-900 px-1 rounded">https://developers.google.com/oauthplayground</code>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="text-purple-400 font-bold">5.</span>
              <div>
                <strong className="text-gray-300">Get Refresh Token:</strong>
                <br/>Visit <a href="https://developers.google.com/oauthplayground" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">OAuth Playground</a> → Settings → Use your credentials
                <br/>Select scope: <code className="bg-gray-900 px-1 rounded">https://www.googleapis.com/auth/gmail.send</code>
                <br/>Authorize → Exchange code for tokens → Copy refresh token
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-700">
            <a 
              href="/GOOGLE_OAUTH_SETUP_GUIDE.md" 
              target="_blank"
              className="text-purple-400 hover:text-purple-300 text-xs font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Detailed Setup Guide
            </a>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Client ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="123456789-abc123.apps.googleusercontent.com"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
          />
          <p className="text-xs text-gray-400 mt-1">
            From Google Cloud Console → APIs & Services → Credentials
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Client Secret <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            placeholder="Enter Client Secret or leave blank to keep current"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
          />
          <p className="text-xs text-gray-400 mt-1">
            Your OAuth 2.0 Client Secret from Google Cloud Console
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Refresh Token <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={refreshToken}
            onChange={(e) => setRefreshToken(e.target.value)}
            placeholder="Enter Refresh Token or leave blank to keep current"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
          />
          <p className="text-xs text-gray-400 mt-1">
            Generate using OAuth 2.0 Playground: <a href="https://developers.google.com/oauthplayground" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">developers.google.com/oauthplayground</a>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Sender Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            placeholder="your-email@gmail.com"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
          />
          <p className="text-xs text-gray-400 mt-1">
            The Gmail address that will send emails
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl ${message.includes('Error') || message.includes('❌') ? 'bg-red-900/20 border border-red-800 text-red-300' : 'bg-green-900/20 border border-green-800 text-green-300'}`}>
          <pre className="whitespace-pre-wrap text-sm">{message}</pre>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 disabled:bg-gray-600 text-white rounded-xl transition-colors font-medium shadow-lg shadow-purple-500/30"
        >
          {loading ? 'Saving...' : 'Save Configuration'}
        </button>
        <button
          type="button"
          onClick={handleTest}
          disabled={loading}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white rounded-xl transition-colors font-medium shadow-md"
        >
          Test Connection
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={loading}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-xl transition-colors font-medium shadow-md"
        >
          Clear Configuration
        </button>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-yellow-300 text-sm font-medium mb-1">Security Note</p>
            <p className="text-yellow-400 text-xs">
              Your OAuth credentials are stored securely in the database. Never share your Client Secret or Refresh Token with anyone.
              These credentials allow sending emails on your behalf.
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
  const [gmailConnected, setGmailConnected] = useState(false);
  const [checkingGmail, setCheckingGmail] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchMeetings();
      checkGmailConnection();
    }
  }, [status]);

  const checkGmailConnection = async () => {
    try {
      const response = await fetch('/api/users/smtp-config');
      if (response.ok) {
        const data = await response.json();
        setGmailConnected(!!data.gmailRefreshToken);
      }
    } catch (error) {
      console.error('Error checking Gmail connection:', error);
    } finally {
      setCheckingGmail(false);
    }
  };

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
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
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
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-gray-900 to-black border-r border-gray-800 transition-transform duration-300 ease-in-out shadow-xl`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-purple-700">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-white">MeetingHub</span>
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
                    ? 'bg-black text-gray-300 shadow-md'
                    : 'text-white hover:bg-purple-400 hover:shadow-sm'
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
          <div className="p-4 border-t border-purple-700">
            <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gray-900/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-gray-300 font-semibold shadow-md">
                {session?.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
                <p className="text-xs text-purple-100 truncate">{session?.user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-red-500 rounded-xl transition-all duration-200 border border-transparent hover:border-red-400"
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
      <main className="flex-1 overflow-y-auto bg-gray-900">
        {/* Header */}
        <header className="bg-black border-b border-gray-700 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-2xl font-semibold text-white">
                {activeMenu === 'dashboard' && 'Dashboard'}
                {activeMenu === 'create' && 'Create Meeting'}
                {activeMenu === 'meetings' && 'My Meetings'}
                {activeMenu === 'reports' && 'Reports'}
                {activeMenu === 'profile' && 'Profile'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Welcome, {session?.user?.name}</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        {activeMenu === 'dashboard' && (
          <div className="p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-black rounded-xl p-6 border border-gray-700 shadow-xl shadow-purple-500/20 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-semibold text-white mb-1">{totalMeetings}</h3>
                <p className="text-gray-400 text-sm">Total Meetings</p>
              </div>

              <div className="bg-black rounded-xl p-6 border border-gray-700 shadow-xl shadow-purple-500/20 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-semibold text-white mb-1">{draftReports}</h3>
                <p className="text-gray-400 text-sm">Draft Reports</p>
              </div>

              <div className="bg-black rounded-xl p-6 border border-gray-700 shadow-xl shadow-purple-500/20 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-semibold text-white mb-1">{finalReports}</h3>
                <p className="text-gray-400 text-sm">Final Reports</p>
              </div>

              <div className="bg-black rounded-xl p-6 border border-gray-700 shadow-xl shadow-purple-500/20 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-semibold text-white mb-1">{recentMeetings.length}</h3>
                <p className="text-gray-400 text-sm">Recent Meetings</p>
              </div>
            </div>

            {/* Recently Created Meetings */}
            <div className="bg-black rounded-xl p-6 border border-gray-700 shadow-xl shadow-purple-500/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Recently Created Meetings</h2>
                <button
                  onClick={() => router.push('/meetings/new')}
                  className="px-6 py-3 bg-gray-800/500 text-white rounded-xl hover:bg-sky-600 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-xl shadow-purple-500/20"
                >
                  Create New
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
                    className="px-6 py-3 bg-gray-800/500 text-white rounded-xl hover:bg-sky-600 transition-colors shadow-md"
                  >
                    Create Your First Meeting
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="flex items-center justify-between p-4 bg-black hover:bg-gray-900 rounded-xl transition-all duration-200 border border-gray-700 shadow-md hover:shadow-xl shadow-purple-500/20"
                    >
                      <div className="flex-1">
                        <h3 className="text-white font-medium mb-1">{meeting.title}</h3>
                        <p className="text-gray-400 text-sm">
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
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {meeting.reports && meeting.reports.length > 0 ? 'Completed' : 'Draft'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/meetings/${meeting.id}/agenda`);
                          }}
                          className="px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-purple-700 hover:to-violet-700 text-white text-xs font-medium rounded-xl transition-colors flex items-center gap-1 shadow-md"
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
                          className="px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-purple-700 hover:to-violet-700 text-white text-xs font-medium rounded-xl transition-colors flex items-center gap-1 shadow-md"
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
                          className="px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-purple-700 hover:to-violet-700 text-white text-xs font-medium rounded-xl transition-colors flex items-center gap-1 shadow-md"
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
                          className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-xl transition-colors flex items-center gap-1 shadow-md"
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
                          className="text-gray-400 hover:text-white transition-colors"
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
            <div className="bg-black border border-gray-700 rounded-xl p-6 shadow-xl shadow-purple-500/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">My Meetings</h2>
                <button
                  onClick={() => router.push('/meetings/new')}
                  className="px-6 py-3 bg-gray-800/500 text-white rounded-xl hover:bg-sky-600 transition-all duration-200 text-sm font-medium flex items-center gap-2 shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New
                </button>
              </div>

              {meetings.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-400 mb-4">No meetings yet</p>
                  <button
                    onClick={() => router.push('/meetings/new')}
                    className="px-6 py-3 bg-gray-800/500 text-white rounded-xl hover:bg-sky-600 transition-colors shadow-md"
                  >
                    Create Your First Meeting
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {meetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="p-4 bg-black hover:bg-gray-900 rounded-xl transition-all duration-200 border border-gray-700 shadow-md hover:shadow-xl shadow-purple-500/20"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg mb-1">{meeting.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>{new Date(meeting.date).toLocaleDateString()}</span>
                            <span>{new Date(meeting.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="capitalize">{meeting.meetingMode || 'Offline'}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          meeting.reports && meeting.reports.length > 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {meeting.reports && meeting.reports.length > 0 ? 'Completed' : 'Draft'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => router.push(`/meetings/${meeting.id}/agenda`)}
                          className="px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-purple-700 hover:to-violet-700 text-white text-xs font-medium rounded-xl transition-colors shadow-md"
                        >
                          Agenda
                        </button>
                        <button
                          onClick={() => router.push(`/meetings/${meeting.id}/minutes`)}
                          className="px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-purple-700 hover:to-violet-700 text-white text-xs font-medium rounded-xl transition-colors shadow-md"
                        >
                          Minutes
                        </button>
                        <button
                          onClick={() => router.push(`/meetings/${meeting.id}/reports`)}
                          className="px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-purple-700 hover:to-violet-700 text-white text-xs font-medium rounded-xl transition-colors shadow-md"
                        >
                          Reports
                        </button>
                        <button
                          onClick={() => router.push(`/meetings/${meeting.id}/edit`)}
                          className="px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-purple-700 hover:to-violet-700 text-white text-xs font-medium rounded-xl transition-colors shadow-md"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMeeting(meeting.id, meeting.title)}
                          className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-xl transition-colors shadow-md"
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
            <div className="bg-black border border-gray-700 rounded-xl p-6 shadow-xl shadow-purple-500/20">
              <h2 className="text-2xl font-bold text-white mb-6">Meeting Reports</h2>

              {meetings.filter(m => m.reports && m.reports.length > 0).length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-400 mb-2">No reports generated yet</p>
                  <p className="text-gray-500 text-sm">Generate reports from the meeting's Reports page</p>
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
                          className="p-5 bg-black rounded-xl border border-gray-700 hover:border-purple-300 transition-all shadow-md hover:shadow-xl shadow-purple-500/20"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-white font-semibold text-lg mb-2">{meeting.title}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {new Date(meeting.date).toLocaleDateString()}
                                </span>
                                <span className="text-green-600 flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  {meeting.reports.length} Report{meeting.reports.length > 1 ? 's' : ''}
                                </span>
                              </div>
                              
                              {/* Agenda Summary */}
                              <div className="mb-2 p-3 bg-slate-7000/10 border border-purple-500/30 rounded-xl">
                                <div className="flex items-center gap-2 mb-1">
                                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                  </svg>
                                  <span className="text-xs font-semibold text-purple-400">Agenda</span>
                                </div>
                                <p className="text-sm text-purple-300">{agendaSummary}</p>
                              </div>

                              {/* Minutes Summary */}
                              <div className="mb-2 p-3 bg-slate-7000/10 border border-purple-500/30 rounded-xl">
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
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              Completed
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => router.push(`/meetings/${meeting.id}/reports`)}
                              className="px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-purple-700 hover:to-violet-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2 shadow-md"
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
                              className="px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-purple-700 hover:to-violet-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2 shadow-md"
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
                              className="px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-purple-700 hover:to-violet-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2 shadow-md"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Agenda PDF
                            </button>
                            <button
                              onClick={() => setSelectedMeetingForEmail(meeting)}
                              className="px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-purple-700 hover:to-violet-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2 shadow-md"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Email
                            </button>
                            <button
                              onClick={() => setSelectedMeetingForWhatsApp(meeting)}
                              className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2 shadow-md"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                              WhatsApp
                            </button>
                            <button
                              onClick={() => router.push(`/meetings/${meeting.id}/agenda`)}
                              className="px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-purple-700 hover:to-violet-700 text-white text-sm font-medium rounded-xl transition-colors shadow-md"
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
          <div className="p-6 space-y-6">
            {/* Gmail OAuth Connection Section */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-2">Connect Your Gmail</h2>
              <p className="text-gray-400 text-sm mb-6">Send meeting emails directly from your Gmail account - no passwords needed!</p>
              
              {/* Connection Status */}
              {!checkingGmail && (
                <div className={`${gmailConnected ? 'bg-green-900/20 border-green-800' : 'bg-yellow-900/20 border-yellow-800'} border rounded-lg p-4 mb-6`}>
                  <div className="flex items-center gap-3">
                    {gmailConnected ? (
                      <>
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-green-300 font-semibold">✅ Gmail Connected!</p>
                          <p className="text-green-400 text-sm">Emails will be sent from: {session?.user?.email}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                          <p className="text-yellow-300 font-semibold">⚠️ Gmail Not Connected</p>
                          <p className="text-yellow-400 text-sm">Connect your Gmail to send emails from your account</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {/* Benefits */}
              <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-green-200">
                    <p className="font-semibold mb-2">✨ Why Connect Gmail?</p>
                    <ul className="space-y-1 ml-2">
                      <li>✅ Emails sent FROM your Gmail account</li>
                      <li>✅ No passwords required - secure OAuth</li>
                      <li>✅ One-click authorization</li>
                      <li>✅ Recipients see YOUR email as sender</li>
                      <li>✅ Replies come to YOUR inbox</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/auth/gmail/authorize');
                    const data = await response.json();
                    if (data.authUrl) {
                      window.location.href = data.authUrl;
                    } else {
                      alert('Failed to generate authorization URL');
                    }
                  } catch (error: any) {
                    alert('Error: ' + error.message);
                  }
                }}
                className="w-full px-6 py-4 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl transition-colors shadow-lg flex items-center justify-center gap-3 border-2 border-gray-300"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {gmailConnected ? 'Reconnect Gmail' : 'Connect with Google'}
              </button>

              <p className="text-xs text-gray-400 mt-3 text-center">
                You'll be redirected to Google to authorize email sending
              </p>
            </div>

            {/* Alternative: SMTP Configuration (Legacy) */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-2">Alternative: SMTP Configuration</h2>
              <p className="text-gray-400 text-sm mb-4">If you prefer, you can configure SMTP manually (requires App Password)</p>
              
              <details className="text-gray-300">
                <summary className="cursor-pointer font-semibold hover:text-white">Show SMTP Configuration Form</summary>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = {
                    smtpHost: (e.target as any).smtpHost.value,
                    smtpPort: parseInt((e.target as any).smtpPort.value),
                    smtpUser: (e.target as any).smtpUser.value,
                    smtpPassword: (e.target as any).smtpPassword.value
                  };
                  
                  fetch('/api/users/smtp-config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                  }).then(res => res.json()).then(data => {
                    if (data.message) {
                      alert('✅ SMTP configuration saved!');
                    } else {
                      alert('❌ Error: ' + (data.error || 'Failed to save'));
                    }
                  }).catch(err => alert('❌ Error: ' + err.message));
                }} className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Host</label>
                    <input type="text" name="smtpHost" defaultValue="smtp.gmail.com" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Port</label>
                    <input type="number" name="smtpPort" defaultValue="587" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Gmail Address</label>
                    <input type="email" name="smtpUser" placeholder="yourname@gmail.com" defaultValue={session?.user?.email || ''} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Gmail App Password</label>
                    <input type="password" name="smtpPassword" placeholder="16-character app password" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white" required />
                    <p className="text-xs text-gray-400 mt-1">Get from <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">Google App Passwords</a></p>
                  </div>
                  <button type="submit" className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold rounded-xl">
                    Save SMTP Configuration
                  </button>
                </form>
              </details>
            </div>
          </div>
        )}
      </main>

      {/* Email Modal */}
      {selectedMeetingForEmail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-gray-800 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-white">Send Meeting Email</h3>
            </div>
            
            <p className="text-gray-300 mb-4">
              <strong>Meeting:</strong> {selectedMeetingForEmail.title}
            </p>
            
            {/* Info about sender */}
            <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-3 mb-4">
              <p className="text-purple-300 text-sm">
                📧 Email will be sent FROM: <strong>{session?.user?.email}</strong>
              </p>
              <p className="text-purple-400 text-xs mt-1">
                Configure your email in Profile if you haven't already
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Recipients
              </label>
              <input
                type="text"
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
                placeholder="recipient@example.com, another@example.com"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-400 mt-1">Separate multiple emails with commas</p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={async () => {
                  if (!emailRecipients.trim()) {
                    alert('Please enter at least one recipient email address');
                    return;
                  }

                  setSending(true);
                  try {
                    const recipients = emailRecipients.split(',').map(e => e.trim()).filter(e => e);
                    const response = await fetch(`/api/meetings/${selectedMeetingForEmail.id}/email`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ recipients })
                    });

                    const data = await response.json();

                    if (response.ok) {
                      alert('✅ Email sent successfully from your account!');
                      setSelectedMeetingForEmail(null);
                      setEmailRecipients('');
                    } else {
                      if (data.configured === false) {
                        alert('⚠️ Please configure your email settings in Profile first.\n\n' + data.error);
                      } else {
                        alert('❌ Failed to send email: ' + data.error);
                      }
                    }
                  } catch (error: any) {
                    alert('❌ Error: ' + error.message);
                  } finally {
                    setSending(false);
                  }
                }}
                disabled={sending}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-xl transition-colors font-medium shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send Email from My Account
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  setSelectedMeetingForEmail(null);
                  setEmailRecipients('');
                }}
                disabled={sending}
                className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors disabled:opacity-50"
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
          <div className="bg-black rounded-xl p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Send Report via WhatsApp</h3>
            <p className="text-gray-300 mb-4">Meeting: {selectedMeetingForWhatsApp.title}</p>
            <textarea
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              rows={4}
              placeholder="Enter WhatsApp numbers (one per line, with country code)&#10;Example:&#10;+1234567890&#10;+9876543210&#10;+1122334455"
              className="w-full px-4 py-2 bg-slate-700 border border-gray-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 mb-2 resize-none"
            />
            <p className="text-xs text-gray-400 mb-4">Enter one phone number per line. Include country code (e.g., +1234567890)</p>
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
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-xl transition-colors font-medium"
              >
                {sending ? 'Generating...' : 'Send WhatsApp'}
              </button>
              <button
                onClick={() => {
                  setSelectedMeetingForWhatsApp(null);
                  setWhatsappNumber('');
                }}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-xl transition-colors"
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





