'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Meeting {
  id: string;
  title: string;
  date: string;
  location: string;
  meetingMode: string;
  meetingLink?: string;
  description?: string;
}

export default function AgendaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
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

  const handleCreateAgenda = (meetingId: string) => {
    router.push(`/meetings/${meetingId}/agenda`);
  };

  const handleShareEmail = (meetingId: string) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return;

    // Parse agenda data
    let agendaContent = '';
    try {
      const parsed = JSON.parse(meeting.description || '{}');
      if (parsed.savedAgendas && parsed.savedAgendas.length > 0) {
        const agenda = parsed.savedAgendas[parsed.savedAgendas.length - 1];
        agendaContent = `Meeting: ${meeting.title}\n\n`;
        if (agenda.objectives) agendaContent += `Objectives:\n${agenda.objectives}\n\n`;
        if (agenda.agendaItems && agenda.agendaItems.length > 0) {
          agendaContent += 'Agenda Items:\n';
          agenda.agendaItems.forEach((item: any, idx: number) => {
            agendaContent += `${idx + 1}. ${item.topic}\n`;
            if (item.description) agendaContent += `   ${item.description}\n`;
          });
        }
      }
    } catch (e) {
      agendaContent = `Meeting: ${meeting.title}\nDate: ${new Date(meeting.date).toLocaleString()}`;
    }

    const subject = `Meeting Agenda: ${meeting.title}`;
    const body = encodeURIComponent(agendaContent);
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;
  };

  const handleShareWhatsApp = (meetingId: string) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return;

    // Parse agenda data
    let agendaContent = '';
    try {
      const parsed = JSON.parse(meeting.description || '{}');
      if (parsed.savedAgendas && parsed.savedAgendas.length > 0) {
        const agenda = parsed.savedAgendas[parsed.savedAgendas.length - 1];
        agendaContent = `*Meeting Agenda: ${meeting.title}*\n\n`;
        if (agenda.objectives) agendaContent += `*Objectives:*\n${agenda.objectives}\n\n`;
        if (agenda.agendaItems && agenda.agendaItems.length > 0) {
          agendaContent += '*Agenda Items:*\n';
          agenda.agendaItems.forEach((item: any, idx: number) => {
            agendaContent += `${idx + 1}. ${item.topic}\n`;
            if (item.description) agendaContent += `   ${item.description}\n`;
          });
        }
      }
    } catch (e) {
      agendaContent = `*Meeting Agenda: ${meeting.title}*\nDate: ${new Date(meeting.date).toLocaleString()}`;
    }

    const message = encodeURIComponent(agendaContent);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleDownloadAgenda = async (meetingId: string) => {
    setGenerating(true);
    try {
      const response = await fetch(`/api/meetings/${meetingId}/agenda-pdf`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to generate PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const meeting = meetings.find(m => m.id === meetingId);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agenda-${meeting?.title.replace(/[^a-zA-Z0-9-_]/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      alert('Agenda PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setGenerating(false);
    }
  };

  const hasAgenda = (meeting: Meeting) => {
    if (!meeting.description) return false;
    try {
      const parsed = JSON.parse(meeting.description);
      return parsed.savedAgendas && Array.isArray(parsed.savedAgendas) && parsed.savedAgendas.length > 0;
    } catch {
      return false;
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/user')}
                className="text-gray-600 hover:text-black transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-black">Meeting Agendas</h1>
                <p className="text-sm text-gray-600">Create, share, and download meeting agendas</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  {hasAgenda(meeting) && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Has Agenda
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{meeting.title}</h3>
                <p className="text-sm text-gray-500 mb-1">
                  {new Date(meeting.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {new Date(meeting.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
                
                <div className="space-y-2">
                  <button
                    onClick={() => handleCreateAgenda(meeting.id)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {hasAgenda(meeting) ? 'View/Edit Agenda' : 'Create Agenda'}
                  </button>
                  
                  {hasAgenda(meeting) && (
                    <>
                      <button
                        onClick={() => handleDownloadAgenda(meeting.id)}
                        disabled={generating}
                        className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download PDF
                      </button>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleShareEmail(meeting.id)}
                          className="flex-1 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Email
                        </button>
                        
                        <button
                          onClick={() => handleShareWhatsApp(meeting.id)}
                          className="flex-1 px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          WhatsApp
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
