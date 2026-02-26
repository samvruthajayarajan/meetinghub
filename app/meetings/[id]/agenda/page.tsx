'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';

interface AgendaData {
  objectives: string;
  preparationRequired: string[];
  agendaItems: Array<{
    id?: string;
    topic: string;
    description: string;
    presenter: string;
    duration: number;
  }>;
  actionItems: string[];
  submitted?: boolean;
  submittedAt?: string;
}

interface SavedAgenda extends AgendaData {
  id: string;
  submittedAt: string;
}

export default function AgendaPage({ params }: { params: Promise<{ id: string }> }) {
  const { status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [meeting, setMeeting] = useState<any>(null);
  const [savedAgendas, setSavedAgendas] = useState<SavedAgenda[]>([]);
  const [viewingAgendaId, setViewingAgendaId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [agendaData, setAgendaData] = useState<AgendaData>({
    objectives: '',
    preparationRequired: [],
    agendaItems: [],
    actionItems: [],
  });

  const [newPreparation, setNewPreparation] = useState('');
  const [newActionItem, setNewActionItem] = useState('');
  const [showAgendaItemForm, setShowAgendaItemForm] = useState(false);
  const [editingAgendaItemIndex, setEditingAgendaItemIndex] = useState<number | null>(null);
  const [editingPreparationIndex, setEditingPreparationIndex] = useState<number | null>(null);
  const [editingActionItemIndex, setEditingActionItemIndex] = useState<number | null>(null);
  const [newAgendaItem, setNewAgendaItem] = useState({
    topic: '',
    description: '',
    presenter: '',
    duration: 15,
  });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showMeetingDetailsModal, setShowMeetingDetailsModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [sending, setSending] = useState(false);
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
      
      // Parse saved agendas from description
      if (data.description) {
        try {
          const parsed = JSON.parse(data.description);
          if (parsed.savedAgendas && Array.isArray(parsed.savedAgendas)) {
            setSavedAgendas(parsed.savedAgendas);
          }
        } catch (e) {
          // If description is not JSON, keep it as is
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching meeting:', error);
      setLoading(false);
    }
  };

  const saveAgenda = async (updatedData?: AgendaData) => {
    const dataToSave = updatedData || agendaData;
    setSaving(true);
    try {
      const response = await fetch(`/api/meetings/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: JSON.stringify({ savedAgendas }),
        }),
      });

      if (response.ok) {
        await fetchMeeting();
      }
    } catch (error) {
      console.error('Error saving agenda:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddPreparation = async () => {
    if (newPreparation.trim()) {
      if (editingPreparationIndex !== null) {
        // Update existing
        const updated = {
          ...agendaData,
          preparationRequired: agendaData.preparationRequired.map((item, i) =>
            i === editingPreparationIndex ? newPreparation : item
          ),
        };
        setAgendaData(updated);
        setEditingPreparationIndex(null);
        await saveAgenda(updated);
      } else {
        // Add new
        const updated = {
          ...agendaData,
          preparationRequired: [...agendaData.preparationRequired, newPreparation],
        };
        setAgendaData(updated);
        await saveAgenda(updated);
      }
      setNewPreparation('');
    }
  };

  const handleEditPreparation = (index: number) => {
    setNewPreparation(agendaData.preparationRequired[index]);
    setEditingPreparationIndex(index);
  };

  const handleRemovePreparation = async (index: number) => {
    const updated = {
      ...agendaData,
      preparationRequired: agendaData.preparationRequired.filter((_, i) => i !== index),
    };
    setAgendaData(updated);
    await saveAgenda(updated);
  };

  const handleAddAgendaItem = async () => {
    if (newAgendaItem.topic.trim()) {
      if (editingAgendaItemIndex !== null) {
        // Update existing
        const updated = {
          ...agendaData,
          agendaItems: agendaData.agendaItems.map((item, i) =>
            i === editingAgendaItemIndex ? { ...newAgendaItem, id: item.id } : item
          ),
        };
        setAgendaData(updated);
        setEditingAgendaItemIndex(null);
        await saveAgenda(updated);
      } else {
        // Add new
        const updated = {
          ...agendaData,
          agendaItems: [...agendaData.agendaItems, { ...newAgendaItem, id: Date.now().toString() }],
        };
        setAgendaData(updated);
        await saveAgenda(updated);
      }
      setNewAgendaItem({ topic: '', description: '', presenter: '', duration: 15 });
      setShowAgendaItemForm(false);
    }
  };

  const handleEditAgendaItem = (index: number) => {
    const item = agendaData.agendaItems[index];
    setNewAgendaItem({
      topic: item.topic,
      description: item.description,
      presenter: item.presenter,
      duration: item.duration,
    });
    setEditingAgendaItemIndex(index);
    setShowAgendaItemForm(true);
  };

  const handleRemoveAgendaItem = async (index: number) => {
    const updated = {
      ...agendaData,
      agendaItems: agendaData.agendaItems.filter((_, i) => i !== index),
    };
    setAgendaData(updated);
    await saveAgenda(updated);
  };

  const handleAddActionItem = async () => {
    if (newActionItem.trim()) {
      if (editingActionItemIndex !== null) {
        // Update existing
        const updated = {
          ...agendaData,
          actionItems: agendaData.actionItems.map((item, i) =>
            i === editingActionItemIndex ? newActionItem : item
          ),
        };
        setAgendaData(updated);
        setEditingActionItemIndex(null);
        await saveAgenda(updated);
      } else {
        // Add new
        const updated = {
          ...agendaData,
          actionItems: [...agendaData.actionItems, newActionItem],
        };
        setAgendaData(updated);
        await saveAgenda(updated);
      }
      setNewActionItem('');
    }
  };

  const handleEditActionItem = (index: number) => {
    setNewActionItem(agendaData.actionItems[index]);
    setEditingActionItemIndex(index);
  };

  const handleRemoveActionItem = async (index: number) => {
    const updated = {
      ...agendaData,
      actionItems: agendaData.actionItems.filter((_, i) => i !== index),
    };
    setAgendaData(updated);
    await saveAgenda(updated);
  };

  const handleSubmitAgenda = async () => {
    if (!agendaData.objectives.trim()) {
      alert('Please add objectives before submitting the agenda.');
      return;
    }
    if (agendaData.agendaItems.length === 0) {
      alert('Please add at least one agenda item before submitting.');
      return;
    }

    const newSavedAgenda: SavedAgenda = {
      ...agendaData,
      id: Date.now().toString(),
      submitted: true,
      submittedAt: new Date().toISOString(),
    };

    const updatedSavedAgendas = [...savedAgendas, newSavedAgenda];
    setSavedAgendas(updatedSavedAgendas);

    // Save to database
    setSaving(true);
    try {
      const response = await fetch(`/api/meetings/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: JSON.stringify({ savedAgendas: updatedSavedAgendas }),
        }),
      });

      if (response.ok) {
        // Reset form for new agenda
        setAgendaData({
          objectives: '',
          preparationRequired: [],
          agendaItems: [],
          actionItems: [],
        });
        alert('Agenda submitted successfully! You can now create a new agenda.');
        await fetchMeeting();
      }
    } catch (error) {
      console.error('Error saving agenda:', error);
      alert('Failed to submit agenda. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSavedAgenda = async (agendaId: string) => {
    if (!confirm('Are you sure you want to delete this saved agenda?')) return;

    const updatedSavedAgendas = savedAgendas.filter(a => a.id !== agendaId);
    setSavedAgendas(updatedSavedAgendas);

    setSaving(true);
    try {
      await fetch(`/api/meetings/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: JSON.stringify({ savedAgendas: updatedSavedAgendas }),
        }),
      });
      await fetchMeeting();
    } catch (error) {
      console.error('Error deleting agenda:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSendEmail = async () => {
    if (savedAgendas.length === 0) {
      alert('Please submit an agenda before sharing');
      return;
    }

    if (!emailRecipients.trim()) {
      alert('Please enter at least one email recipient');
      return;
    }

    setSending(true);
    try {
      const recipients = emailRecipients.split(',').map(email => email.trim()).filter(email => email);
      
      const response = await fetch(`/api/meetings/${resolvedParams.id}/email-agenda-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipients }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.needsGmailAuth) {
          alert('Please connect your Gmail account in Profile to send emails from your account.');
          router.push('/user');
        } else {
          throw new Error(data.error || 'Failed to send email');
        }
        return;
      }

      alert('✅ Agenda PDF sent successfully!');
      setShowEmailModal(false);
      setEmailRecipients('');
    } catch (error: any) {
      console.error('Error sending email:', error);
      alert(`Failed to send email: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleSendMeetingDetails = async () => {
    if (!emailRecipients.trim()) {
      alert('Please enter at least one email recipient');
      return;
    }

    setSending(true);
    try {
      const recipients = emailRecipients.split(',').map(email => email.trim()).filter(email => email);
      
      const response = await fetch(`/api/meetings/${resolvedParams.id}/email-meeting-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipients }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.needsGmailAuth) {
          alert('Please connect your Gmail account in Profile to send emails from your account.');
          router.push('/user');
        } else {
          throw new Error(data.error || 'Failed to send email');
        }
        return;
      }

      alert('✅ Meeting details sent successfully!');
      setShowMeetingDetailsModal(false);
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

    if (savedAgendas.length === 0) {
      alert('Please submit an agenda before sharing');
      return;
    }

    setSending(true);
    try {
      // Split by newlines or commas and clean up
      const phoneNumbers = whatsappNumber
        .split(/[\n,]+/)
        .map(num => num.trim())
        .filter(num => num.length > 0);

      if (phoneNumbers.length === 0) {
        alert('Please enter valid phone numbers');
        setSending(false);
        return;
      }

      const response = await fetch(`/api/meetings/${resolvedParams.id}/whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumbers }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send WhatsApp messages');
      }
      
      // Check if using WhatsApp Web links or Twilio
      if (data.method === 'whatsapp_web' && data.links) {
        // Open WhatsApp Web links for each recipient
        let openedCount = 0;
        for (const link of data.links) {
          window.open(link.url, '_blank');
          openedCount++;
          // Small delay between opening windows
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        alert(`✅ Opened ${openedCount} WhatsApp chat(s)!\n\nClick "Send" in each WhatsApp window to deliver the message.`);
      } else {
        // Twilio method - messages sent automatically
        const successMsg = `✅ WhatsApp messages sent successfully!\n\nSent: ${data.totalSent}\nFailed: ${data.totalFailed}`;
        alert(successMsg);
      }
      
      setShowWhatsAppModal(false);
      setWhatsappNumber('');
    } catch (error: any) {
      console.error('Error sending WhatsApp:', error);
      alert(`Failed to send WhatsApp messages: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleOpenInEmailApp = () => {
    if (savedAgendas.length === 0) {
      alert('Please submit an agenda before sharing');
      return;
    }

    if (!meeting) return;

    const latestAgenda = savedAgendas[savedAgendas.length - 1];
    
    // Build email subject
    const subject = encodeURIComponent(`Meeting Agenda: ${meeting.title}`);
    
    // Build email body with agenda details
    let body = `Meeting: ${meeting.title}\n`;
    body += `Date: ${new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`;
    body += `Time: ${new Date(meeting.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}\n`;
    body += `Mode: ${meeting.meetingMode || 'Offline'}\n`;
    if (meeting.meetingLink) {
      body += `Link: ${meeting.meetingLink}\n`;
    }
    body += `\n`;
    
    // Add objectives
    if (latestAgenda.objectives) {
      body += `OBJECTIVES:\n${latestAgenda.objectives}\n\n`;
    }
    
    // Add preparation required
    if (latestAgenda.preparationRequired && latestAgenda.preparationRequired.length > 0) {
      body += `PREPARATION REQUIRED:\n`;
      latestAgenda.preparationRequired.forEach((item: string, index: number) => {
        body += `${index + 1}. ${item}\n`;
      });
      body += `\n`;
    }
    
    // Add agenda items
    if (latestAgenda.agendaItems && latestAgenda.agendaItems.length > 0) {
      body += `AGENDA ITEMS:\n`;
      latestAgenda.agendaItems.forEach((item: any, index: number) => {
        body += `\n${index + 1}. ${item.topic}\n`;
        if (item.description) body += `   ${item.description}\n`;
        if (item.presenter) body += `   Presenter: ${item.presenter}\n`;
        if (item.duration) body += `   Duration: ${item.duration} minutes\n`;
      });
      body += `\n`;
    }
    
    // Add action items
    if (latestAgenda.actionItems && latestAgenda.actionItems.length > 0) {
      body += `ACTION ITEMS:\n`;
      latestAgenda.actionItems.forEach((item: string, index: number) => {
        body += `${index + 1}. ${item}\n`;
      });
    }
    
    // Encode body for mailto
    const encodedBody = encodeURIComponent(body);
    
    // Create mailto link
    const mailtoLink = `mailto:?subject=${subject}&body=${encodedBody}`;
    
    // Open in default email app
    window.location.href = mailtoLink;
  };

  const handleGenerateAgendaPDF = async () => {
    if (savedAgendas.length === 0) {
      alert('Please submit an agenda before generating PDF');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch(`/api/meetings/${resolvedParams.id}/agenda-pdf`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Agenda PDF generation failed:', response.status, errorData);
        throw new Error(errorData.error || errorData.details || 'Failed to generate PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Auto download
      const a = document.createElement('a');
      a.href = url;
      a.download = `agenda-${meeting?.title.replace(/[^a-zA-Z0-9-_]/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      alert('Agenda PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteMeeting = async () => {
    if (!confirm('Are you sure you want to delete this meeting? This action cannot be undone.')) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/meetings/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete meeting');
      }
      
      alert('Meeting deleted successfully!');
      router.push('/user');
    } catch (error: any) {
      console.error('Error deleting meeting:', error);
      alert(`Failed to delete meeting: ${error.message}`);
    } finally {
      setSaving(false);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
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
                <h1 className="text-lg sm:text-2xl font-bold text-black truncate">Meeting Agenda</h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{meeting?.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              {saving && (
                <div className="hidden sm:flex items-center gap-2 text-sky-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-600"></div>
                  <span className="text-sm">Saving...</span>
                </div>
              )}
              <button
                onClick={() => router.push(`/meetings/${resolvedParams.id}/edit`)}
                className="px-2 py-2 sm:px-4 sm:py-3 bg-green-100 hover:bg-green-200 text-green-700 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1 sm:gap-2 shadow-sm"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={handleDeleteMeeting}
                disabled={saving}
                className="px-2 py-2 sm:px-4 sm:py-3 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2 shadow-md"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Meeting Info Card */}
        <div className="bg-gradient-to-br from-green-50 via-white to-gray-50 border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Meeting Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 transition-all duration-300 hover:shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Date</p>
                <p className="text-gray-900 font-semibold">{meeting?.date ? new Date(meeting.date).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 transition-all duration-300 hover:shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Time</p>
                <p className="text-gray-900 font-semibold">{meeting?.date ? new Date(meeting.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 transition-all duration-300 hover:shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Mode</p>
                <p className="text-gray-900 font-semibold capitalize">{meeting?.meetingMode || 'Offline'}</p>
              </div>
            </div>
          </div>
          {meeting?.meetingLink && (meeting?.meetingMode === 'online' || meeting?.meetingMode === 'hybrid') && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium mb-1">Meeting Link</p>
                  <a 
                    href={meeting.meetingLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-700 hover:text-green-800 font-medium break-all transition-colors"
                  >
                    {meeting.meetingLink}
                  </a>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(meeting.meetingLink);
                    alert('Meeting link copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Share Meeting Details Section */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-8 shadow-sm">
          <div className="text-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Share Meeting Details</h2>
            <p className="text-xs sm:text-base text-gray-600">Download or send meeting information</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto">
            {/* Download PDF Button */}
            <button
              onClick={async () => {
                setGenerating(true);
                try {
                  const response = await fetch(`/api/meetings/${resolvedParams.id}/meeting-details-pdf`);
                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                    throw new Error(errorData.error || 'Failed to generate PDF');
                  }
                  
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `meeting-details-${meeting?.title.replace(/[^a-zA-Z0-9-_]/g, '-')}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(url);
                  
                  alert('Meeting details PDF downloaded successfully!');
                } catch (error) {
                  console.error('Error generating PDF:', error);
                  alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
                } finally {
                  setGenerating(false);
                }
              }}
              disabled={generating}
              className="group relative p-4 sm:p-6 bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-300 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {generating ? (
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-7 sm:w-7 border-b-2 border-blue-700"></div>
                  ) : (
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-sm sm:text-base text-gray-900 font-semibold mb-0.5 sm:mb-1">Download PDF</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Save to device</p>
                </div>
              </div>
            </button>

            {/* Email Button */}
            <button
              onClick={() => setShowMeetingDetailsModal(true)}
              disabled={sending}
              className="group relative p-4 sm:p-6 bg-white hover:bg-purple-50 border-2 border-gray-200 hover:border-purple-300 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="text-sm sm:text-base text-gray-900 font-semibold mb-0.5 sm:mb-1">Send via Email</h3>
                  <p className="text-xs sm:text-sm text-gray-500">With PDF attachment</p>
                </div>
              </div>
            </button>

            {/* WhatsApp Button */}
            <button
              onClick={async () => {
                const numbers = prompt('Enter WhatsApp numbers (with country code, comma-separated):\nExample: +1234567890, +9876543210');
                if (!numbers) return;
                
                setSending(true);
                try {
                  const phoneNumbers = numbers.split(',').map(n => n.trim()).filter(n => n);
                  const response = await fetch(`/api/meetings/${resolvedParams.id}/whatsapp-meeting-details`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phoneNumbers }),
                  });

                  const data = await response.json();
                  if (!response.ok) throw new Error(data.error || 'Failed to send');

                  if (data.method === 'whatsapp_web' && data.links) {
                    for (const link of data.links) {
                      window.open(link.url, '_blank');
                      await new Promise(resolve => setTimeout(resolve, 500));
                    }
                    alert(`✅ Opened ${data.links.length} WhatsApp chat(s)!`);
                  }
                } catch (error: any) {
                  alert(`Failed: ${error.message}`);
                } finally {
                  setSending(false);
                }
              }}
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

        {/* Saved Agendas Section */}
        {savedAgendas.length > 0 && (
          <>
            {/* Generate & Share Agenda Section */}
            <div className="bg-gradient-to-br from-green-50 via-white to-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-8 shadow-sm">
              <div className="text-center mb-4 sm:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Share Agenda</h2>
                <p className="text-xs sm:text-base text-gray-600">Download or send the agenda to participants</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto">
                {/* Download PDF Button */}
                <button
                  onClick={handleGenerateAgendaPDF}
                  disabled={generating}
                  className="group relative p-4 sm:p-6 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {generating ? (
                        <div className="animate-spin rounded-full h-6 w-6 sm:h-7 sm:w-7 border-b-2 border-gray-700"></div>
                      ) : (
                        <svg className="w-6 h-6 sm:w-7 sm:h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="text-center">
                      <h3 className="text-sm sm:text-base text-gray-900 font-semibold mb-0.5 sm:mb-1">Download PDF</h3>
                      <p className="text-xs sm:text-sm text-gray-500">Save to device</p>
                    </div>
                  </div>
                </button>

                {/* Email Button */}
                <button
                  onClick={() => setShowEmailModal(true)}
                  disabled={sending}
                  className="group relative p-4 sm:p-6 bg-white hover:bg-green-50 border-2 border-gray-200 hover:border-green-300 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 sm:w-7 sm:h-7 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <h3 className="text-sm sm:text-base text-gray-900 font-semibold mb-0.5 sm:mb-1">Send via Email</h3>
                      <p className="text-xs sm:text-sm text-gray-500">With PDF attachment</p>
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

            {/* Saved Agendas List */}
            <div className="bg-gradient-to-br from-green-50 via-white to-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-8 shadow-sm">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-base sm:text-2xl">Submitted Agendas ({savedAgendas.length})</span>
              </h2>
            <div className="space-y-3 sm:space-y-4">
              {savedAgendas.map((agenda) => (
                <div key={agenda.id} className="p-3 sm:p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-green-300 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base text-gray-900 font-semibold truncate">Agenda submitted on {new Date(agenda.submittedAt).toLocaleString()}</p>
                          <p className="text-xs sm:text-sm text-gray-600">{agenda.agendaItems.length} agenda items</p>
                        </div>
                      </div>
                      {viewingAgendaId === agenda.id && (
                        <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4 pl-0 sm:pl-12">
                          {/* Objectives */}
                          <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-xl">
                            <p className="text-xs sm:text-sm font-semibold text-green-700 mb-2">Objectives:</p>
                            <p className="text-gray-700 text-xs sm:text-sm">{agenda.objectives}</p>
                          </div>
                          {/* Preparation Required */}
                          {agenda.preparationRequired.length > 0 && (
                            <div className="p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-xl">
                              <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Preparation Required:</p>
                              <ul className="list-disc list-inside text-gray-700 text-xs sm:text-sm space-y-1">
                                {agenda.preparationRequired.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {/* Agenda Items */}
                          <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-xl">
                            <p className="text-xs sm:text-sm font-semibold text-green-700 mb-2">Agenda Items:</p>
                            <div className="space-y-2">
                              {agenda.agendaItems.map((item, idx) => (
                                <div key={idx} className="text-xs sm:text-sm">
                                  <p className="text-gray-900 font-medium">#{idx + 1} {item.topic}</p>
                                  {item.description && <p className="text-gray-600">{item.description}</p>}
                                  {item.presenter && <p className="text-green-700">Presenter: {item.presenter}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                          {/* Action Items */}
                          {agenda.actionItems.length > 0 && (
                            <div className="p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-xl">
                              <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Action Items:</p>
                              <ul className="list-disc list-inside text-gray-700 text-xs sm:text-sm space-y-1">
                                {agenda.actionItems.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setViewingAgendaId(viewingAgendaId === agenda.id ? null : agenda.id)}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 text-xs sm:text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 shadow-sm"
                      >
                        {viewingAgendaId === agenda.id ? 'Hide' : 'View'}
                      </button>
                      <button
                        onClick={() => handleDeleteSavedAgenda(agenda.id)}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs sm:text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 shadow-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </>
        )}

        {/* Toggle between View and Create Mode */}
        {!showCreateForm && savedAgendas.length > 0 && (
          <div className="text-center">
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mx-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Agenda
            </button>
          </div>
        )}

        {/* Form Sections - Only show when in create mode OR when no agendas exist */}
        {(showCreateForm || savedAgendas.length === 0) && (
          <>
            {showCreateForm && (
              <div className="flex justify-between items-center bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900">Create New Agenda</h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    // Reset form
                    setAgendaData({
                      objectives: '',
                      preparationRequired: [],
                      agendaItems: [],
                      actionItems: [],
                    });
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

        {/* Meeting Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-xs text-gray-600">Date</p>
                <p className="text-black font-medium">{meeting?.date ? new Date(meeting.date).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-xs text-gray-600">Time</p>
                <p className="text-black font-medium">{meeting?.date ? new Date(meeting.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <div>
                <p className="text-xs text-gray-600">Mode</p>
                <p className="text-black font-medium capitalize">{meeting?.meetingMode || 'Offline'}</p>
              </div>
            </div>
          </div>
          {meeting?.meetingLink && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <div className="flex-1">
                  <p className="text-xs text-gray-600">Meeting Link</p>
                  <a 
                    href={meeting.meetingLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sky-600 hover:text-sky-700 text-sm underline break-all"
                  >
                    {meeting.meetingLink}
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 1. Objectives */}
        <div className="bg-gradient-to-br from-green-50 via-white to-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-base sm:text-2xl">Objectives</span>
          </h2>
          <textarea
            value={agendaData.objectives}
            onChange={(e) => setAgendaData({ ...agendaData, objectives: e.target.value })}
            onBlur={() => saveAgenda(agendaData)}
            rows={4}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none shadow-sm hover:border-gray-300"
            placeholder="Enter the main objectives of this meeting..."
          />
        </div>

        {/* 2. Preparation Required */}
        <div className="bg-gradient-to-br from-green-50 via-white to-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-base sm:text-2xl">Preparation Required</span>
          </h2>
          
          <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
            {agendaData.preparationRequired.map((item, index) => (
              <div key={index} className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-green-300 transition-all duration-300">
                <div className="flex-1 text-sm sm:text-base text-gray-900 break-words">{item}</div>
                <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEditPreparation(index)}
                    className="p-1.5 sm:p-2 text-green-700 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors hover:scale-110 duration-200"
                    title="Edit"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleRemovePreparation(index)}
                    className="p-1.5 sm:p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors hover:scale-110 duration-200"
                    title="Delete"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newPreparation}
              onChange={(e) => setNewPreparation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddPreparation()}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm hover:border-gray-300"
              placeholder={editingPreparationIndex !== null ? "Update preparation item..." : "Add preparation item..."}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddPreparation}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-green-100 hover:bg-green-200 text-green-700 text-sm sm:text-base font-medium rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingPreparationIndex !== null ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"} />
                </svg>
                <span className="hidden sm:inline">{editingPreparationIndex !== null ? 'Update' : 'Add'}</span>
              </button>
              {editingPreparationIndex !== null && (
                <button
                  onClick={() => {
                    setEditingPreparationIndex(null);
                    setNewPreparation('');
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 sm:py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm sm:text-base font-medium rounded-xl transition-all duration-300 hover:scale-105 shadow-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. Agenda Items */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Agenda Items</h2>
                  <p className="text-emerald-100 text-xs">Discussion topics and timeline</p>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-md">
                <span className="text-white font-bold text-sm">{agendaData.agendaItems.length}</span>
                <span className="text-emerald-100 text-xs ml-1">items</span>
              </div>
            </div>
          </div>

          <div className="p-3">
            <div className="space-y-2 mb-3">
              {agendaData.agendaItems.map((item, index) => (
                  <div key={item.id || index} className="group relative bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-emerald-400 hover:shadow-sm transition-all duration-200">
                    {/* Item number badge */}
                    <div className="absolute -left-1.5 -top-1.5 w-5 h-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-md flex items-center justify-center shadow-sm transform group-hover:scale-110 transition-transform duration-200">
                      <span className="text-white font-bold text-xs">#{index + 1}</span>
                    </div>

                    <div className="flex items-start justify-between pl-3">
                      <div className="flex-1 pr-2">
                        {/* Topic */}
                        <h4 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">
                          {item.topic}
                        </h4>
                        
                        {/* Description */}
                        {item.description && (
                          <p className="text-gray-600 text-xs leading-relaxed mb-2 pl-2 border-l-2 border-emerald-200">
                            {item.description}
                          </p>
                        )}
                        
                        {/* Meta information */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {item.presenter && (
                            <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="text-xs font-medium text-gray-700">{item.presenter}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                            <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs font-medium text-gray-700">{item.duration} min</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditAgendaItem(index)}
                          className="p-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded transition-all duration-200 hover:scale-110"
                          title="Edit item"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRemoveAgendaItem(index)}
                          className="p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded transition-all duration-200 hover:scale-110"
                          title="Delete item"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            {/* Add/Edit Form */}
            {!showAgendaItemForm ? (
              <button
                onClick={() => setShowAgendaItemForm(true)}
                className="w-full bg-emerald-50 hover:bg-emerald-100 border-2 border-dashed border-emerald-300 hover:border-emerald-400 rounded-lg py-2 transition-all duration-200"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-xs font-semibold text-emerald-700">Add Agenda Item</span>
                </div>
              </button>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <h3 className="text-xs font-bold text-gray-900 mb-2">
                  {editingAgendaItemIndex !== null ? 'Edit Agenda Item' : 'New Agenda Item'}
                </h3>

                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Topic <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newAgendaItem.topic}
                      onChange={(e) => setNewAgendaItem({ ...newAgendaItem, topic: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      placeholder="e.g., Q4 Budget Review"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newAgendaItem.description}
                      onChange={(e) => setNewAgendaItem({ ...newAgendaItem, description: e.target.value })}
                      rows={2}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                      placeholder="Additional details..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Presenter
                      </label>
                      <input
                        type="text"
                        value={newAgendaItem.presenter}
                        onChange={(e) => setNewAgendaItem({ ...newAgendaItem, presenter: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        placeholder="Name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Duration (min)
                      </label>
                      <input
                        type="number"
                        value={newAgendaItem.duration}
                        onChange={(e) => setNewAgendaItem({ ...newAgendaItem, duration: parseInt(e.target.value) || 15 })}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        placeholder="15"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="flex gap-1.5 pt-1">
                    <button
                      onClick={handleAddAgendaItem}
                      className="flex-1 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold rounded transition-all duration-200 flex items-center justify-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingAgendaItemIndex !== null ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"} />
                      </svg>
                      {editingAgendaItemIndex !== null ? 'Update' : 'Add'}
                    </button>
                    <button
                      onClick={() => {
                        setShowAgendaItemForm(false);
                        setEditingAgendaItemIndex(null);
                        setNewAgendaItem({ topic: '', description: '', presenter: '', duration: 15 });
                      }}
                      className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Action Items */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Action Items</h2>
                  <p className="text-purple-100 text-xs">Tasks and follow-ups</p>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-md">
                <span className="text-white font-bold text-sm">{agendaData.actionItems.length}</span>
                <span className="text-purple-100 text-xs ml-1">items</span>
              </div>
            </div>
          </div>

          <div className="p-3">
            <div className="space-y-2 mb-3">
              {agendaData.actionItems.map((item, index) => (
                  <div key={index} className="group relative bg-gray-50 border border-gray-200 rounded-lg p-2.5 hover:border-purple-400 hover:shadow-sm transition-all duration-200">
                    <div className="flex items-start gap-2">
                      {/* Checkbox style indicator */}
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-4 h-4 border-2 border-purple-400 rounded flex items-center justify-center group-hover:border-purple-600 group-hover:bg-purple-50 transition-all duration-200">
                          <svg className="w-2.5 h-2.5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>

                      {/* Item text */}
                      <div className="flex-1 text-gray-900 text-xs font-medium leading-relaxed">
                        {item}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => handleEditActionItem(index)}
                          className="p-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded transition-all duration-200 hover:scale-110"
                          title="Edit"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRemoveActionItem(index)}
                          className="p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded transition-all duration-200 hover:scale-110"
                          title="Delete"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            {/* Add/Edit Form */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newActionItem}
                  onChange={(e) => setNewActionItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddActionItem()}
                  className="flex-1 px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder={editingActionItemIndex !== null ? "Update action item..." : "Add a new action item..."}
                />
                <button
                  onClick={handleAddActionItem}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold rounded transition-all duration-200 flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingActionItemIndex !== null ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"} />
                  </svg>
                  {editingActionItemIndex !== null ? 'Update' : 'Add'}
                </button>
                {editingActionItemIndex !== null && (
                  <button
                    onClick={() => {
                      setEditingActionItemIndex(null);
                      setNewActionItem('');
                    }}
                    className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded transition-all duration-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Agenda Button */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
          <button
            onClick={handleSubmitAgenda}
            disabled={saving}
            className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Submit Agenda</span>
          </button>
        </div>
          </>
        )}
      </main>

      {/* Email Agenda PDF Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl transform transition-all animate-slideUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6 rounded-t-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Send Agenda PDF</h3>
                  <p className="text-emerald-100 text-sm mt-0.5">Share via email with PDF attachment</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Email Recipients
                </label>
                <textarea
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                  placeholder="Enter email addresses (comma separated)&#10;example@email.com, another@email.com"
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-emerald-800">
                    The agenda will be sent as a professionally formatted PDF attachment including all objectives, items, and action points.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSendEmail}
                  disabled={sending}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Send Email</span>
                    </>
                  )}
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

      {/* Email Meeting Details Modal */}
      {showMeetingDetailsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl transform transition-all animate-slideUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 rounded-t-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Send Meeting Invitation</h3>
                  <p className="text-blue-100 text-sm mt-0.5">Share meeting details with participants</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Email Recipients
                </label>
                <textarea
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  placeholder="Enter email addresses (comma separated)&#10;example@email.com, another@email.com"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-blue-800">
                    This will send meeting details including date, time, and link (if available) without the full agenda.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSendMeetingDetails}
                  disabled={sending}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Send Invitation</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowMeetingDetailsModal(false);
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl transform transition-all animate-slideUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 rounded-t-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Send via WhatsApp</h3>
                  <p className="text-green-100 text-sm mt-0.5">Share agenda instantly</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  WhatsApp Numbers
                </label>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Format: +countrycode + number</p>
                      <p className="text-blue-600">Example: +1234567890, +919876543210</p>
                    </div>
                  </div>
                </div>
                <textarea
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none font-mono text-sm"
                  placeholder="+1234567890&#10;+919876543210&#10;+447123456789"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p className="text-sm text-amber-800">
                    <span className="font-semibold">How it works:</span> WhatsApp will open for each number with the message pre-filled. Just click "Send" in each chat window!
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSendWhatsApp}
                  disabled={sending}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span>Open WhatsApp</span>
                    </>
                  )}
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
