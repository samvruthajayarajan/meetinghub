'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';

interface MinutesData {
  attendees: string[];
  discussions: string;
  decisions: string[];
  actionItems: Array<{
    id?: string;
    task: string;
    assignedTo: string;
    dueDate: string;
  }>;
  nextMeeting?: string;
  submitted?: boolean;
  submittedAt?: string;
}

interface SavedMinutes extends MinutesData {
  id: string;
  submittedAt: string;
}

export default function MinutesPage({ params }: { params: Promise<{ id: string }> }) {
  const { status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [meeting, setMeeting] = useState<any>(null);
  
  const [minutesData, setMinutesData] = useState<MinutesData>({
    attendees: [],
    discussions: '',
    decisions: [],
    actionItems: [],
    nextMeeting: '',
  });

  const [newAttendee, setNewAttendee] = useState('');
  const [newDecision, setNewDecision] = useState('');
  const [showActionItemForm, setShowActionItemForm] = useState(false);
  const [newActionItem, setNewActionItem] = useState({
    task: '',
    assignedTo: '',
    dueDate: '',
  });
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');
  const [whatsappNumbers, setWhatsappNumbers] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');
  const [whatsappNumbers, setWhatsappNumbers] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
    if (status === 'authenticated') {
      fetchMeeting();
    }
  }, [status]);

  const fetchMeeting = async () => {
    try {
      const response = await fetch(`/api/meetings/${resolvedParams.id}`);
      if (!response.ok) throw new Error('Failed to fetch meeting');
      
      const data = await response.json();
      setMeeting(data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching meeting:', error);
      setLoading(false);
    }
  };

  const handleSubmitMinutes = async () => {
    if (!minutesData.discussions.trim()) {
      alert('Please add discussions before submitting the minutes.');
      return;
    }

    setSaving(true);
    try {
      // Get existing saved minutes
      let existingSavedMinutes: any[] = [];
      if (meeting?.minutes?.discussions) {
        try {
          const parsed = JSON.parse(meeting.minutes.discussions);
          if (parsed.savedMinutes && Array.isArray(parsed.savedMinutes)) {
            existingSavedMinutes = parsed.savedMinutes;
          }
        } catch (e) {
          // Not JSON
        }
      }

      const newSavedMinutes: SavedMinutes = {
        ...minutesData,
        id: Date.now().toString(),
        submitted: true,
        submittedAt: new Date().toISOString(),
      };

      const updatedSavedMinutes = [...existingSavedMinutes, newSavedMinutes];

      const response = await fetch(`/api/meetings/${resolvedParams.id}/minutes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discussions: JSON.stringify({ savedMinutes: updatedSavedMinutes }),
          decisions: '',
          actionItems: '',
          attendees: [],
        }),
      });

      if (response.ok) {
        setMinutesData({
          attendees: [],
          discussions: '',
          decisions: [],
          actionItems: [],
          nextMeeting: '',
        });
        alert('Minutes submitted successfully! View them in the Reports page.');
        await fetchMeeting();
      }
    } catch (error) {
      console.error('Error saving minutes:', error);
      alert('Failed to submit minutes.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAttendee = () => {
    if (newAttendee.trim()) {
      setMinutesData({
        ...minutesData,
        attendees: [...minutesData.attendees, newAttendee],
      });
      setNewAttendee('');
    }
  };

  const handleRemoveAttendee = (index: number) => {
    setMinutesData({
      ...minutesData,
      attendees: minutesData.attendees.filter((_, i) => i !== index),
    });
  };

  const handleAddDecision = () => {
    if (newDecision.trim()) {
      setMinutesData({
        ...minutesData,
        decisions: [...minutesData.decisions, newDecision],
      });
      setNewDecision('');
    }
  };

  const handleRemoveDecision = (index: number) => {
    setMinutesData({
      ...minutesData,
      decisions: minutesData.decisions.filter((_, i) => i !== index),
    });
  };

  const handleAddActionItem = () => {
    if (newActionItem.task.trim()) {
      setMinutesData({
        ...minutesData,
        actionItems: [...minutesData.actionItems, { ...newActionItem, id: Date.now().toString() }],
      });
      setNewActionItem({ task: '', assignedTo: '', dueDate: '' });
      setShowActionItemForm(false);
    }
  };

  const handleRemoveActionItem = (index: number) => {
    setMinutesData({
      ...minutesData,
      actionItems: minutesData.actionItems.filter((_, i) => i !== index),
    });
  };

  const handleGenerateMinutes = () => {
    setGenerating(true);
    
    try {
      // Parse agenda from meeting description
      let agendaData: any = null;
      if (meeting?.description) {
        try {
          const parsed = JSON.parse(meeting.description);
          if (parsed.savedAgendas && parsed.savedAgendas.length > 0) {
            // Use the most recent agenda
            agendaData = parsed.savedAgendas[parsed.savedAgendas.length - 1];
          }
        } catch (e) {
          // Not JSON, skip
        }
      }

      if (!agendaData) {
        alert('No agenda found for this meeting. Please create an agenda first.');
        setGenerating(false);
        return;
      }

      // Generate discussions from agenda
      let generatedDiscussions = '';
      
      if (agendaData.objectives) {
        generatedDiscussions += `Meeting Objectives:\n${agendaData.objectives}\n\n`;
      }

      if (agendaData.agendaItems && agendaData.agendaItems.length > 0) {
        generatedDiscussions += 'Discussion Topics:\n';
        agendaData.agendaItems.forEach((item: any, index: number) => {
          generatedDiscussions += `\n${index + 1}. ${item.topic}`;
          if (item.presenter) {
            generatedDiscussions += ` (Presenter: ${item.presenter})`;
          }
          if (item.duration) {
            generatedDiscussions += ` [${item.duration} min]`;
          }
          if (item.description) {
            generatedDiscussions += `\n   ${item.description}`;
          }
          generatedDiscussions += '\n   [Add discussion notes here...]\n';
        });
      }

      // Pre-populate action items from agenda
      const generatedActionItems: any[] = [];
      if (agendaData.actionItems && agendaData.actionItems.length > 0) {
        agendaData.actionItems.forEach((item: string) => {
          generatedActionItems.push({
            id: Date.now().toString() + Math.random(),
            task: item,
            assignedTo: '',
            dueDate: '',
          });
        });
      }

      // Update minutes data
      setMinutesData({
        ...minutesData,
        discussions: generatedDiscussions,
        actionItems: generatedActionItems,
      });

      alert('Minutes template generated from agenda! Please fill in the discussion notes and update action items.');
    } catch (error) {
      console.error('Error generating minutes:', error);
      alert('Failed to generate minutes. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailRecipients.trim()) {
      alert('Please enter at least one email address');
      return;
    }

    setSending(true);
    try {
      const recipientList = emailRecipients.split(',').map(email => email.trim()).filter(email => email);
      
      const response = await fetch(`/api/meetings/${resolvedParams.id}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipients: recipientList }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.needsGmailAuth) {
          alert(data.error + '\n\nRedirecting to Profile page...');
          router.push('/user');
          return;
        }
        throw new Error(data.error || 'Failed to send email');
      }
      
      alert(`Minutes sent successfully from your ${data.method === 'gmail' ? 'Gmail' : 'email'} account!`);
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
    if (!whatsappNumbers.trim()) {
      alert('Please enter at least one WhatsApp number');
      return;
    }

    setSending(true);
    try {
      const phoneNumbers = whatsappNumbers
        .split('\n')
        .map(num => num.trim())
        .filter(num => num.length > 0);
      
      if (phoneNumbers.length === 0) {
        alert('Please enter at least one valid phone number');
        setSending(false);
        return;
      }

      const response = await fetch(`/api/meetings/${resolvedParams.id}/whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumbers }),
      });

      if (!response.ok) throw new Error('Failed to generate WhatsApp messages');
      
      const data = await response.json();
      
      // Open WhatsApp links for each number
      data.links.forEach((link: any, index: number) => {
        setTimeout(() => {
          window.open(link.url, '_blank');
        }, index * 1000); // 1 second delay between each link
      });
      
      alert(`WhatsApp links generated for ${data.links.length} recipient(s)!`);
      setShowWhatsAppModal(false);
      setWhatsappNumbers('');
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      alert('Failed to generate WhatsApp messages. Please try again.');
    } finally {
      setSending(false);
    }
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

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <button
                onClick={() => router.push('/user')}
                className="text-gray-600 hover:text-gray-800 transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">Meeting Minutes</h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{meeting?.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={handleGenerateMinutes}
                disabled={generating || saving}
                className="px-2 py-2 sm:px-4 sm:py-2 bg-green-100 text-green-700 hover:bg-green-200 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2 shadow-sm text-xs sm:text-base"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-green-700"></div>
                    <span className="hidden sm:inline">Generating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="hidden sm:inline">Generate Minutes</span>
                  </>
                )}
              </button>
              {saving && (
                <div className="hidden sm:flex items-center gap-2 text-green-700">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700"></div>
                  <span className="text-sm">Saving...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Meeting Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-xs text-gray-600">Date</p>
                <p className="text-gray-800 font-medium">{meeting?.date ? new Date(meeting.date).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-xs text-gray-600">Time</p>
                <p className="text-gray-800 font-medium">{meeting?.date ? new Date(meeting.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendees */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-base sm:text-xl">Attendees</span>
          </h2>
          <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
            {minutesData.attendees.map((attendee, index) => (
              <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="text-sm sm:text-base text-gray-800 break-words flex-1 mr-2">{attendee}</span>
                <button
                  onClick={() => handleRemoveAttendee(index)}
                  className="text-red-600 hover:text-red-700 transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newAttendee}
              onChange={(e) => setNewAttendee(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddAttendee()}
              className="flex-1 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              placeholder="Add attendee name..."
            />
            <button
              onClick={handleAddAttendee}
              className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Discussions */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Discussions <span className="text-red-600">*</span>
          </h2>
          <textarea
            value={minutesData.discussions}
            onChange={(e) => setMinutesData({ ...minutesData, discussions: e.target.value })}
            rows={6}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
            placeholder="Enter meeting discussions and key points..."
          />
        </div>

        {/* Decisions */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-base sm:text-xl">Decisions Made</span>
          </h2>
          <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
            {minutesData.decisions.map((decision, index) => (
              <div key={index} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex-1 text-sm sm:text-base text-gray-800 break-words">{decision}</div>
                <button
                  onClick={() => handleRemoveDecision(index)}
                  className="text-red-600 hover:text-red-700 transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newDecision}
              onChange={(e) => setNewDecision(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddDecision()}
              className="flex-1 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              placeholder="Add decision..."
            />
            <button
              onClick={handleAddDecision}
              className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Action Items
          </h2>
          <div className="space-y-3 mb-4">
            {minutesData.actionItems.map((item, index) => (
              <div key={item.id || index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-800 font-semibold mb-1">{item.task}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>👤 {item.assignedTo}</span>
                      <span>📅 {new Date(item.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveActionItem(index)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          {!showActionItemForm ? (
            <button
              onClick={() => setShowActionItemForm(true)}
              className="w-full py-3 px-4 bg-yellow-50 hover:bg-yellow-100 border-2 border-dashed border-yellow-300 hover:border-yellow-500 text-yellow-700 font-medium rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Action Item
            </button>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
              <input
                type="text"
                value={newActionItem.task}
                onChange={(e) => setNewActionItem({ ...newActionItem, task: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                placeholder="Task description *"
              />
              <input
                type="text"
                value={newActionItem.assignedTo}
                onChange={(e) => setNewActionItem({ ...newActionItem, assignedTo: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                placeholder="Assigned to *"
              />
              <input
                type="date"
                value={newActionItem.dueDate}
                onChange={(e) => setNewActionItem({ ...newActionItem, dueDate: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddActionItem}
                  className="px-4 py-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg transition-colors"
                >
                  Add Item
                </button>
                <button
                  onClick={() => {
                    setShowActionItemForm(false);
                    setNewActionItem({ task: '', assignedTo: '', dueDate: '' });
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Next Meeting */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Next Meeting
          </h2>
          <input
            type="datetime-local"
            value={minutesData.nextMeeting}
            onChange={(e) => setMinutesData({ ...minutesData, nextMeeting: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          />
        </div>

        {/* Share Minutes Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share Minutes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email Button */}
            <button
              onClick={() => setShowEmailModal(true)}
              className="p-6 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-green-300 rounded-xl transition-all group shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-gray-800 font-semibold mb-1">Send via Email</h3>
                  <p className="text-gray-600 text-sm">Share minutes with participants</p>
                </div>
              </div>
            </button>

            {/* WhatsApp Button */}
            <button
              onClick={() => setShowWhatsAppModal(true)}
              className="p-6 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-green-300 rounded-xl transition-all group shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-gray-800 font-semibold mb-1">Send via WhatsApp</h3>
                  <p className="text-gray-600 text-sm">Share minutes instantly</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <button
            onClick={handleSubmitMinutes}
            disabled={saving}
            className="w-full py-4 px-6 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Submit Minutes</span>
          </button>
        </div>
      </main>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Send Minutes via Email</h3>
            
            <p className="text-gray-600 text-sm mb-4">Enter email addresses separated by commas</p>
            <textarea
              value={emailRecipients}
              onChange={(e) => setEmailRecipients(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none mb-4"
              placeholder="recipient@example.com, another@example.com"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailRecipients('');
                }}
                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={sending}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    Send Minutes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Send Minutes via WhatsApp</h3>
            
            <p className="text-gray-600 text-sm mb-4">Enter WhatsApp numbers (one per line, with country code)</p>
            <textarea
              value={whatsappNumbers}
              onChange={(e) => setWhatsappNumbers(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none mb-2"
              placeholder="+1234567890&#10;+9876543210&#10;+1122334455"
            />
            <p className="text-xs text-gray-600 mb-4">Enter one phone number per line</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowWhatsAppModal(false);
                  setWhatsappNumbers('');
                }}
                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendWhatsApp}
                disabled={sending}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Send Minutes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
