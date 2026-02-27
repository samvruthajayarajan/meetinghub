'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';

interface AgendaItem {
  topic: string;
  description: string;
  presenter: string;
  duration: number;
}

interface AgendaData {
  objectives: string;
  preparationRequired: string[];
  agendaItems: AgendaItem[];
  actionItems: string[];
}

export default function MeetingAgendaPage({ params }: { params: Promise<{ id: string }> }) {
  const { status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [meeting, setMeeting] = useState<any>(null);
  
  const [agendaData, setAgendaData] = useState<AgendaData>({
    objectives: '',
    preparationRequired: [],
    agendaItems: [],
    actionItems: []
  });

  const [newPreparation, setNewPreparation] = useState('');
  const [newActionItem, setNewActionItem] = useState('');

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
      
      // Load existing agenda if available
      if (data.description) {
        try {
          const parsed = JSON.parse(data.description);
          if (parsed.savedAgendas && parsed.savedAgendas.length > 0) {
            setAgendaData(parsed.savedAgendas[parsed.savedAgendas.length - 1]);
          }
        } catch (e) {
          // Not JSON, ignore
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching meeting:', error);
      setLoading(false);
    }
  };

  const handleSaveAgenda = async () => {
    setSaving(true);
    try {
      // Get existing saved agendas
      let existingSavedAgendas: any[] = [];
      if (meeting?.description) {
        try {
          const parsed = JSON.parse(meeting.description);
          if (parsed.savedAgendas && Array.isArray(parsed.savedAgendas)) {
            existingSavedAgendas = parsed.savedAgendas;
          }
        } catch (e) {
          // Not JSON
        }
      }

      const newSavedAgenda = {
        ...agendaData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      const updatedSavedAgendas = [...existingSavedAgendas, newSavedAgenda];

      const response = await fetch(`/api/meetings/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: JSON.stringify({ savedAgendas: updatedSavedAgendas }),
        }),
      });

      if (response.ok) {
        alert('Agenda saved successfully!');
        await fetchMeeting();
      }
    } catch (error) {
      console.error('Error saving agenda:', error);
      alert('Failed to save agenda.');
    } finally {
      setSaving(false);
    }
  };

  const addAgendaItem = () => {
    setAgendaData({
      ...agendaData,
      agendaItems: [...agendaData.agendaItems, { topic: '', description: '', presenter: '', duration: 15 }]
    });
  };

  const updateAgendaItem = (index: number, field: keyof AgendaItem, value: string | number) => {
    const updated = [...agendaData.agendaItems];
    updated[index] = { ...updated[index], [field]: value };
    setAgendaData({ ...agendaData, agendaItems: updated });
  };

  const removeAgendaItem = (index: number) => {
    setAgendaData({
      ...agendaData,
      agendaItems: agendaData.agendaItems.filter((_, i) => i !== index)
    });
  };

  const addPreparation = () => {
    if (newPreparation.trim()) {
      setAgendaData({
        ...agendaData,
        preparationRequired: [...agendaData.preparationRequired, newPreparation]
      });
      setNewPreparation('');
    }
  };

  const removePreparation = (index: number) => {
    setAgendaData({
      ...agendaData,
      preparationRequired: agendaData.preparationRequired.filter((_, i) => i !== index)
    });
  };

  const addActionItem = () => {
    if (newActionItem.trim()) {
      setAgendaData({
        ...agendaData,
        actionItems: [...agendaData.actionItems, newActionItem]
      });
      setNewActionItem('');
    }
  };

  const removeActionItem = (index: number) => {
    setAgendaData({
      ...agendaData,
      actionItems: agendaData.actionItems.filter((_, i) => i !== index)
    });
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
                onClick={() => router.push('/agenda')}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Create/Edit Agenda</h1>
                <p className="text-sm text-gray-600">{meeting?.title}</p>
              </div>
            </div>
            <button
              onClick={handleSaveAgenda}
              disabled={saving}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Agenda'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Objectives */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Meeting Objectives</h2>
          <textarea
            value={agendaData.objectives}
            onChange={(e) => setAgendaData({ ...agendaData, objectives: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
            placeholder="What are the main objectives of this meeting?"
          />
        </div>

        {/* Preparation Required */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Preparation Required</h2>
          <div className="space-y-2 mb-4">
            {agendaData.preparationRequired.map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="flex-1 text-gray-800">{item}</span>
                <button
                  onClick={() => removePreparation(index)}
                  className="text-red-600 hover:text-red-700"
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
              value={newPreparation}
              onChange={(e) => setNewPreparation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addPreparation()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Add preparation item..."
            />
            <button
              onClick={addPreparation}
              className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Agenda Items */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Agenda Items</h2>
          <div className="space-y-4 mb-4">
            {agendaData.agendaItems.map((item, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-semibold text-gray-700">Item {index + 1}</span>
                  <button
                    onClick={() => removeAgendaItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <input
                  type="text"
                  value={item.topic}
                  onChange={(e) => updateAgendaItem(index, 'topic', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Topic"
                />
                <textarea
                  value={item.description}
                  onChange={(e) => updateAgendaItem(index, 'description', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="Description"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={item.presenter}
                    onChange={(e) => updateAgendaItem(index, 'presenter', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Presenter"
                  />
                  <input
                    type="number"
                    value={item.duration}
                    onChange={(e) => updateAgendaItem(index, 'duration', parseInt(e.target.value) || 15)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Duration (min)"
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={addAgendaItem}
            className="w-full py-3 px-4 border-2 border-dashed border-gray-300 hover:border-green-500 text-gray-600 hover:text-green-600 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Agenda Item
          </button>
        </div>

        {/* Action Items */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Pre-Meeting Action Items</h2>
          <div className="space-y-2 mb-4">
            {agendaData.actionItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="flex-1 text-gray-800">{item}</span>
                <button
                  onClick={() => removeActionItem(index)}
                  className="text-red-600 hover:text-red-700"
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
              value={newActionItem}
              onChange={(e) => setNewActionItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addActionItem()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Add action item..."
            />
            <button
              onClick={addActionItem}
              className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
