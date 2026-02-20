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
  const [savedMinutes, setSavedMinutes] = useState<SavedMinutes[]>([]);
  const [viewingMinutesId, setViewingMinutesId] = useState<string | null>(null);
  
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
      
      // Parse saved minutes from minutes field
      if (data.minutes) {
        try {
          const parsed = JSON.parse(data.minutes.discussions);
          if (parsed.savedMinutes && Array.isArray(parsed.savedMinutes)) {
            setSavedMinutes(parsed.savedMinutes);
          }
        } catch (e) {
          // If not JSON, keep it as is
        }
      }
      
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

    const newSavedMinutes: SavedMinutes = {
      ...minutesData,
      id: Date.now().toString(),
      submitted: true,
      submittedAt: new Date().toISOString(),
    };

    const updatedSavedMinutes = [...savedMinutes, newSavedMinutes];
    setSavedMinutes(updatedSavedMinutes);

    setSaving(true);
    try {
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
        alert('Minutes submitted successfully!');
        await fetchMeeting();
      }
    } catch (error) {
      console.error('Error saving minutes:', error);
      alert('Failed to submit minutes.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSavedMinutes = async (minutesId: string) => {
    if (!confirm('Are you sure you want to delete these minutes?')) return;

    const updatedSavedMinutes = savedMinutes.filter(m => m.id !== minutesId);
    setSavedMinutes(updatedSavedMinutes);

    setSaving(true);
    try {
      await fetch(`/api/meetings/${resolvedParams.id}/minutes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discussions: JSON.stringify({ savedMinutes: updatedSavedMinutes }),
          decisions: '',
          actionItems: '',
          attendees: [],
        }),
      });
      await fetchMeeting();
    } catch (error) {
      console.error('Error deleting minutes:', error);
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
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/user')}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Meeting Minutes</h1>
                <p className="text-sm text-gray-600">{meeting?.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleGenerateMinutes}
                disabled={generating || saving}
                className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Generate Minutes</span>
                  </>
                )}
              </button>
              {saving && (
                <div className="flex items-center gap-2 text-green-700">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700"></div>
                  <span className="text-sm">Saving...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Saved Minutes Section */}
        {savedMinutes.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Submitted Minutes ({savedMinutes.length})</h2>
            <div className="space-y-3">
              {savedMinutes.map((minutes) => (
                <div key={minutes.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-gray-800 font-semibold">Minutes submitted on {new Date(minutes.submittedAt).toLocaleString()}</p>
                          <p className="text-gray-600 text-sm">{minutes.attendees.length} attendees, {minutes.actionItems.length} action items</p>
                        </div>
                      </div>
                      {viewingMinutesId === minutes.id && (
                        <div className="mt-4 space-y-4 pl-8">
                          {minutes.attendees.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-green-700 mb-1">Attendees:</p>
                              <p className="text-gray-700 text-sm">{minutes.attendees.join(', ')}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-green-700 mb-1">Discussions:</p>
                            <p className="text-gray-700 text-sm whitespace-pre-wrap">{minutes.discussions}</p>
                          </div>
                          {minutes.decisions.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-green-700 mb-1">Decisions:</p>
                              <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                {minutes.decisions.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {minutes.actionItems.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-yellow-700 mb-1">Action Items:</p>
                              <div className="space-y-2">
                                {minutes.actionItems.map((item, idx) => (
                                  <div key={idx} className="text-sm bg-gray-50 p-2 rounded border border-gray-200">
                                    <p className="text-gray-800 font-medium">{item.task}</p>
                                    <p className="text-gray-600">Assigned to: {item.assignedTo}</p>
                                    <p className="text-gray-600">Due: {new Date(item.dueDate).toLocaleDateString()}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {minutes.nextMeeting && (
                            <div>
                              <p className="text-sm font-semibold text-green-700 mb-1">Next Meeting:</p>
                              <p className="text-gray-700 text-sm">{new Date(minutes.nextMeeting).toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewingMinutesId(viewingMinutesId === minutes.id ? null : minutes.id)}
                        className="px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 text-sm rounded-lg transition-colors"
                      >
                        {viewingMinutesId === minutes.id ? 'Hide' : 'View'}
                      </button>
                      <button
                        onClick={() => handleDeleteSavedMinutes(minutes.id)}
                        className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 text-sm rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Attendees
          </h2>
          <div className="space-y-3 mb-4">
            {minutesData.attendees.map((attendee, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="text-gray-800">{attendee}</span>
                <button
                  onClick={() => handleRemoveAttendee(index)}
                  className="text-red-600 hover:text-red-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newAttendee}
              onChange={(e) => setNewAttendee(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddAttendee()}
              className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              placeholder="Add attendee name..."
            />
            <button
              onClick={handleAddAttendee}
              className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add
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
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Decisions Made
          </h2>
          <div className="space-y-3 mb-4">
            {minutesData.decisions.map((decision, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex-1 text-gray-800">{decision}</div>
                <button
                  onClick={() => handleRemoveDecision(index)}
                  className="text-red-600 hover:text-red-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newDecision}
              onChange={(e) => setNewDecision(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddDecision()}
              className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              placeholder="Add decision..."
            />
            <button
              onClick={handleAddDecision}
              className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add
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

        {/* Submit Button */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-green-900">
                <p className="font-semibold mb-1">Ready to submit?</p>
                <p>Make sure you've added discussions. After submitting, you can create new minutes.</p>
              </div>
            </div>
            <button
              onClick={handleSubmitMinutes}
              disabled={saving}
              className="w-full py-4 px-6 bg-green-100 text-green-700 hover:bg-green-200 text-lg font-bold rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Submit Minutes</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
