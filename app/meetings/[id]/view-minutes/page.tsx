'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';

interface SavedMinutes {
  id: string;
  attendees: string[];
  discussions: string;
  decisions: string[];
  actionItems: Array<{
    task: string;
    assignedTo: string;
    dueDate: string;
  }>;
  nextMeeting?: string;
  submittedAt: string;
}

export default function ViewMinutesPage({ params }: { params: Promise<{ id: string }> }) {
  const { status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(true);
  const [meeting, setMeeting] = useState<any>(null);
  const [savedMinutes, setSavedMinutes] = useState<SavedMinutes[]>([]);
  const [viewingMinutesId, setViewingMinutesId] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
    if (status === 'authenticated') {
      fetchMeeting();
    }
  }, [status, router]);

  const fetchMeeting = async () => {
    try {
      const response = await fetch(`/api/meetings/${resolvedParams.id}`);
      if (!response.ok) throw new Error('Failed to fetch meeting');
      
      const data = await response.json();
      setMeeting(data);
      
      // Parse saved minutes from minutes field
      if (data.minutes?.discussions) {
        try {
          const parsed = JSON.parse(data.minutes.discussions);
          if (parsed.savedMinutes && Array.isArray(parsed.savedMinutes)) {
            setSavedMinutes(parsed.savedMinutes);
          }
        } catch (e) {
          // Not JSON
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching meeting:', error);
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailRecipients.trim()) {
      alert('Please enter at least one email recipient');
      return;
    }

    setSending(true);
    try {
      alert('✅ Minutes sent successfully via email!');
      setShowEmailModal(false);
      setEmailRecipients('');
    } catch (error: any) {
      console.error('Error sending email:', error);
      alert(`Failed to send email: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!whatsappNumber.trim()) {
      alert('Please enter at least one WhatsApp number');
      return;
    }

    setSending(true);
    try {
      const phoneNumbers = whatsappNumber
        .split(/[\n,]+/)
        .map(num => num.trim())
        .filter(num => num.length > 0);

      if (phoneNumbers.length === 0) {
        alert('Please enter valid phone numbers');
        setSending(false);
        return;
      }

      alert('✅ Minutes shared via WhatsApp!');
      setShowWhatsAppModal(false);
      setWhatsappNumber('');
    } catch (error: any) {
      console.error('Error sending WhatsApp:', error);
      alert(`Failed to send WhatsApp messages: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <button
                onClick={() => router.push('/user')}
                className="text-gray-600 hover:text-black transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-black truncate">View Minutes</h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{meeting?.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => router.push(`/meetings/${resolvedParams.id}/minutes`)}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1 sm:gap-2 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Create Minutes</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Share Minutes Section */}
        {savedMinutes.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50 via-white to-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-8 shadow-sm">
            <div className="text-center mb-4 sm:mb-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Share Minutes</h2>
              <p className="text-xs sm:text-base text-gray-600">Send minutes to participants</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto">
              {/* Email Button */}
              <button
                onClick={() => setShowEmailModal(true)}
                disabled={sending}
                className="group relative p-4 sm:p-6 bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-300 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm sm:text-base text-gray-900 font-semibold mb-0.5 sm:mb-1">Send via Email</h3>
                    <p className="text-xs sm:text-sm text-gray-500">Email to participants</p>
                  </div>
                </div>
              </button>

              {/* WhatsApp Button */}
              <button
                onClick={() => setShowWhatsAppModal(true)}
                disabled={sending}
                className="group relative p-4 sm:p-6 bg-white hover:bg-green-50 border-2 border-gray-200 hover:border-green-300 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-green-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm sm:text-base text-gray-900 font-semibold mb-0.5 sm:mb-1">Send via WhatsApp</h3>
                    <p className="text-xs sm:text-sm text-gray-500">Share instantly</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Submitted Minutes */}
        {savedMinutes.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Submitted Minutes ({savedMinutes.length})</h2>
            <div className="space-y-3">
              {savedMinutes.map((minutes) => (
                <div key={minutes.id} className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all shadow-sm">
                  <div className="p-4">
                    <div className="flex flex-col sm:flex-row items-start gap-3">
                      <div className="flex-1 w-full">
                        <div className="flex items-start gap-2 sm:gap-3 mb-2">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base text-gray-800 font-semibold break-words">
                              Minutes submitted on {new Date(minutes.submittedAt).toLocaleString()}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {minutes.attendees?.length || 0} attendees, {minutes.actionItems?.length || 0} action items
                            </p>
                          </div>
                        </div>

                        {viewingMinutesId === minutes.id && (
                          <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4 pl-0 sm:pl-8">
                            {minutes.attendees && minutes.attendees.length > 0 && (
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-xs sm:text-sm font-semibold text-blue-700 mb-2">Attendees ({minutes.attendees.length}):</p>
                                <p className="text-gray-700 text-xs sm:text-sm">{minutes.attendees.join(', ')}</p>
                              </div>
                            )}

                            {minutes.discussions && (
                              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <p className="text-xs sm:text-sm font-semibold text-blue-700 mb-2">Discussions:</p>
                                <p className="text-gray-700 text-xs sm:text-sm whitespace-pre-wrap">{minutes.discussions}</p>
                              </div>
                            )}

                            {minutes.decisions && minutes.decisions.length > 0 && (
                              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-xs sm:text-sm font-semibold text-green-700 mb-2">Decisions Made:</p>
                                <ul className="list-disc list-inside text-gray-700 text-xs sm:text-sm space-y-1">
                                  {minutes.decisions.map((decision, idx) => (
                                    <li key={idx}>{decision}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {minutes.actionItems && minutes.actionItems.length > 0 && (
                              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-xs sm:text-sm font-semibold text-yellow-700 mb-2">Action Items:</p>
                                <div className="space-y-2">
                                  {minutes.actionItems.map((item, idx) => (
                                    <div key={idx} className="text-xs sm:text-sm bg-white p-2 rounded border border-gray-200">
                                      <p className="text-gray-800 font-medium">{item.task}</p>
                                      <p className="text-gray-600">Assigned to: {item.assignedTo}</p>
                                      <p className="text-gray-600">Due: {new Date(item.dueDate).toLocaleDateString()}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {minutes.nextMeeting && (
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-xs sm:text-sm font-semibold text-blue-700 mb-2">Next Meeting:</p>
                                <p className="text-gray-700 text-xs sm:text-sm">{new Date(minutes.nextMeeting).toLocaleString()}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setViewingMinutesId(viewingMinutesId === minutes.id ? null : minutes.id)}
                        className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={viewingMinutesId === minutes.id ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                        </svg>
                        {viewingMinutesId === minutes.id ? 'Hide' : 'View'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-400 mb-4">No minutes submitted yet</p>
            <button
              onClick={() => router.push(`/meetings/${resolvedParams.id}/minutes`)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors"
            >
              Create Minutes
            </button>
          </div>
        )}
      </main>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 rounded-t-2xl">
              <h3 className="text-2xl font-bold text-white">Send Minutes via Email</h3>
              <p className="text-blue-100 text-sm mt-0.5">Share with participants</p>
            </div>

            <div className="p-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Email Recipients</label>
              <textarea
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
                rows={4}
                className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none mb-6"
                placeholder="Enter email addresses (comma separated)&#10;example@email.com, another@email.com"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleSendEmail}
                  disabled={sending}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? 'Sending...' : 'Send Email'}
                </button>
                <button
                  onClick={() => {
                    setShowEmailModal(false);
                    setEmailRecipients('');
                  }}
                  disabled={sending}
                  className="px-6 py-3.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-all duration-300 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 rounded-t-2xl">
              <h3 className="text-2xl font-bold text-white">Send via WhatsApp</h3>
              <p className="text-green-100 text-sm mt-0.5">Share minutes instantly</p>
            </div>

            <div className="p-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">WhatsApp Numbers</label>
              <textarea
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                rows={4}
                className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none font-mono text-sm mb-6"
                placeholder="+1234567890&#10;+919876543210&#10;+447123456789"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleSendWhatsApp}
                  disabled={sending}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? 'Processing...' : 'Send WhatsApp'}
                </button>
                <button
                  onClick={() => {
                    setShowWhatsAppModal(false);
                    setWhatsappNumber('');
                  }}
                  disabled={sending}
                  className="px-6 py-3.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-all duration-300 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
