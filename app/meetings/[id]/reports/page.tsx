'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';

export default function ReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(true);
  const [meeting, setMeeting] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  
  // Report form fields
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [objectives, setObjectives] = useState('');
  const [keyDiscussionPoints, setKeyDiscussionPoints] = useState<Array<{topic: string, description: string}>>([]);
  const [decisionsTaken, setDecisionsTaken] = useState<string[]>([]);
  const [actionItems, setActionItems] = useState<Array<{task: string, assignedTo: string, dueDate: string}>>([]);
  const [risksIdentified, setRisksIdentified] = useState<string[]>([]);
  const [conclusion, setConclusion] = useState('');

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
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', response.status, errorData);
        throw new Error(errorData.error || `Failed to fetch meeting (${response.status})`);
      }
      
      const data = await response.json();
      console.log('Meeting data fetched:', data);
      console.log('Reports count:', data.reports?.length || 0);
      setMeeting(data);
      
      // Pre-populate form with existing data
      if (data.description) {
        try {
          const parsed = JSON.parse(data.description);
          if (parsed.savedAgendas && parsed.savedAgendas.length > 0) {
            const agenda = parsed.savedAgendas[parsed.savedAgendas.length - 1];
            if (agenda.objectives) setObjectives(agenda.objectives);
            if (agenda.agendaItems) setKeyDiscussionPoints(agenda.agendaItems);
            if (agenda.preparationRequired) setRisksIdentified(agenda.preparationRequired);
          }
        } catch (e) {
          // Not JSON
        }
      }
      
      if (data.minutes?.discussions) {
        try {
          const parsed = JSON.parse(data.minutes.discussions);
          if (parsed.savedMinutes && parsed.savedMinutes.length > 0) {
            const minutes = parsed.savedMinutes[parsed.savedMinutes.length - 1];
            if (minutes.discussions) setExecutiveSummary(minutes.discussions);
            if (minutes.decisions) setDecisionsTaken(minutes.decisions);
            if (minutes.actionItems) setActionItems(minutes.actionItems);
          }
        } catch (e) {
          // Not JSON
        }
      }
      
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching meeting:', error);
      alert(`Failed to load meeting: ${error.message}`);
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      // If form is shown, use custom report endpoint with form data
      if (showReportForm) {
        const response = await fetch(`/api/meetings/${resolvedParams.id}/custom-report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            executiveSummary,
            objectives,
            keyDiscussionPoints,
            decisionsTaken,
            actionItems,
            risksIdentified,
            conclusion
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('PDF generation failed:', errorText);
          throw new Error('Failed to generate PDF');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Auto download
        const a = document.createElement('a');
        a.href = url;
        a.download = `meeting-report-${meeting?.title.replace(/[^a-zA-Z0-9-_]/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Wait a moment for database transaction to complete
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Refresh meeting data to show the new report in history
        await fetchMeeting();
        
        alert('PDF generated and saved successfully!');
        setShowReportForm(false);
      } else {
        // Use default endpoint with existing data
        const response = await fetch(`/api/meetings/${resolvedParams.id}/pdf`);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('PDF generation failed:', errorText);
          throw new Error('Failed to generate PDF');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
        
        // Auto download
        const a = document.createElement('a');
        a.href = url;
        a.download = `meeting-report-${meeting?.title.replace(/[^a-zA-Z0-9-_]/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Wait a moment for database transaction to complete
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Refresh meeting data to show the new report in history
        await fetchMeeting();
        
        alert('PDF generated and saved successfully!');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Helper functions for managing arrays
  const addDiscussionPoint = () => {
    setKeyDiscussionPoints([...keyDiscussionPoints, { topic: '', description: '' }]);
  };

  const updateDiscussionPoint = (index: number, field: 'topic' | 'description', value: string) => {
    const updated = [...keyDiscussionPoints];
    updated[index][field] = value;
    setKeyDiscussionPoints(updated);
  };

  const removeDiscussionPoint = (index: number) => {
    setKeyDiscussionPoints(keyDiscussionPoints.filter((_, i) => i !== index));
  };

  const addDecision = () => {
    setDecisionsTaken([...decisionsTaken, '']);
  };

  const updateDecision = (index: number, value: string) => {
    const updated = [...decisionsTaken];
    updated[index] = value;
    setDecisionsTaken(updated);
  };

  const removeDecision = (index: number) => {
    setDecisionsTaken(decisionsTaken.filter((_, i) => i !== index));
  };

  const addActionItem = () => {
    setActionItems([...actionItems, { task: '', assignedTo: '', dueDate: '' }]);
  };

  const updateActionItem = (index: number, field: 'task' | 'assignedTo' | 'dueDate', value: string) => {
    const updated = [...actionItems];
    updated[index][field] = value;
    setActionItems(updated);
  };

  const removeActionItem = (index: number) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  const addRisk = () => {
    setRisksIdentified([...risksIdentified, '']);
  };

  const updateRisk = (index: number, value: string) => {
    const updated = [...risksIdentified];
    updated[index] = value;
    setRisksIdentified(updated);
  };

  const removeRisk = (index: number) => {
    setRisksIdentified(risksIdentified.filter((_, i) => i !== index));
  };

  const handleSendEmail = async () => {
    setDownloadingPdf(true);
    try {
      // Prepare report data
      const reportDataToSend = {
        executiveSummary,
        objectives,
        keyDiscussionPoints,
        decisionsTaken,
        actionItems,
        risksIdentified,
        conclusion
      };

      // Generate PDF first
      const response = await fetch(`/api/meetings/${resolvedParams.id}/custom-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportDataToSend)
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      const blob = await response.blob();
      const pdfUrl = window.URL.createObjectURL(blob);
      
      // Auto-download the PDF
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = `report-${meeting?.title.replace(/[^a-zA-Z0-9-_]/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Prepare report content
      let reportContent = `Meeting Report: ${meeting?.title}\n\n`;
      
      if (executiveSummary) reportContent += `Executive Summary:\n${executiveSummary}\n\n`;
      if (objectives) reportContent += `Objectives:\n${objectives}\n\n`;
      
      if (keyDiscussionPoints && keyDiscussionPoints.length > 0) {
        reportContent += `Key Discussion Points:\n`;
        keyDiscussionPoints.forEach((point, idx) => {
          reportContent += `${idx + 1}. ${point.topic}\n   ${point.description}\n`;
        });
        reportContent += '\n';
      }
      
      if (decisionsTaken && decisionsTaken.length > 0) {
        reportContent += `Decisions Taken:\n`;
        decisionsTaken.forEach((decision, idx) => {
          reportContent += `${idx + 1}. ${decision}\n`;
        });
        reportContent += '\n';
      }
      
      if (actionItems && actionItems.length > 0) {
        reportContent += `Action Items:\n`;
        actionItems.forEach((item, idx) => {
          reportContent += `${idx + 1}. ${item.task} - Assigned to: ${item.assignedTo} - Due: ${new Date(item.dueDate).toLocaleDateString()}\n`;
        });
        reportContent += '\n';
      }
      
      if (risksIdentified && risksIdentified.length > 0) {
        reportContent += `Risks Identified:\n`;
        risksIdentified.forEach((risk, idx) => {
          reportContent += `${idx + 1}. ${risk}\n`;
        });
        reportContent += '\n';
      }
      
      if (conclusion) reportContent += `Conclusion:\n${conclusion}`;

      reportContent += `\n\nNote: The report PDF has been downloaded to your computer. Please attach it to this email before sending.`;

      const subject = `Meeting Report: ${meeting?.title}`;
      const body = encodeURIComponent(reportContent);
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;
      
      // Clean up
      setTimeout(() => window.URL.revokeObjectURL(pdfUrl), 100);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleSendWhatsApp = () => {
    // Prepare report content
    let reportContent = `*Meeting Report: ${meeting?.title}*\n\n`;
    
    if (executiveSummary) reportContent += `*Executive Summary:*\n${executiveSummary}\n\n`;
    if (objectives) reportContent += `*Objectives:*\n${objectives}\n\n`;
    
    if (keyDiscussionPoints && keyDiscussionPoints.length > 0) {
      reportContent += `*Key Discussion Points:*\n`;
      keyDiscussionPoints.forEach((point, idx) => {
        reportContent += `${idx + 1}. ${point.topic}\n   ${point.description}\n`;
      });
      reportContent += '\n';
    }
    
    if (decisionsTaken && decisionsTaken.length > 0) {
      reportContent += `*Decisions Taken:*\n`;
      decisionsTaken.forEach((decision, idx) => {
        reportContent += `${idx + 1}. ${decision}\n`;
      });
      reportContent += '\n';
    }
    
    if (actionItems && actionItems.length > 0) {
      reportContent += `*Action Items:*\n`;
      actionItems.forEach((item, idx) => {
        reportContent += `${idx + 1}. ${item.task}\n   Assigned to: ${item.assignedTo}\n   Due: ${new Date(item.dueDate).toLocaleDateString()}\n`;
      });
      reportContent += '\n';
    }
    
    if (risksIdentified && risksIdentified.length > 0) {
      reportContent += `*Risks Identified:*\n`;
      risksIdentified.forEach((risk, idx) => {
        reportContent += `${idx + 1}. ${risk}\n`;
      });
      reportContent += '\n';
    }
    
    if (conclusion) reportContent += `*Conclusion:*\n${conclusion}`;

    const message = encodeURIComponent(reportContent);
    window.open(`https://wa.me/?text=${message}`, '_blank');
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
              <h1 className="text-2xl font-bold text-gray-800">Meeting Reports</h1>
              <p className="text-sm text-gray-600">{meeting?.title}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Meeting Info Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Meeting Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="text-xs text-gray-600">Mode</p>
                <p className="text-gray-800 font-medium capitalize">{meeting?.meetingMode || 'Offline'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Report Section */}
        {!showReportForm ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Generate Meeting Report</h2>
              <p className="text-gray-700">Create a comprehensive PDF report with structured sections</p>
            </div>

            <button
              onClick={() => setShowReportForm(true)}
              className="w-full py-4 px-6 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              Create Report
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Create Custom Report</h2>
              <button
                onClick={() => setShowReportForm(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Executive Summary */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  1. Executive Summary
                </label>
                <textarea
                  value={executiveSummary}
                  onChange={(e) => setExecutiveSummary(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Brief overview of the meeting..."
                />
              </div>

              {/* Objectives */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  2. Meeting Objectives
                </label>
                <textarea
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="What were the goals of this meeting..."
                />
              </div>

              {/* Key Discussion Points */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  3. Key Discussion Points
                </label>
                {keyDiscussionPoints.map((point, index) => (
                  <div key={index} className="mb-3 p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-700">Point {index + 1}</span>
                      <button
                        onClick={() => removeDiscussionPoint(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={point.topic}
                      onChange={(e) => updateDiscussionPoint(index, 'topic', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-green-500"
                      placeholder="Topic"
                    />
                    <textarea
                      value={point.description}
                      onChange={(e) => updateDiscussionPoint(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Description"
                    />
                  </div>
                ))}
                <button
                  onClick={addDiscussionPoint}
                  className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors"
                >
                  + Add Discussion Point
                </button>
              </div>

              {/* Decisions Taken */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  4. Decisions Taken
                </label>
                {decisionsTaken.map((decision, index) => (
                  <div key={index} className="mb-2 flex gap-2">
                    <input
                      type="text"
                      value={decision}
                      onChange={(e) => updateDecision(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder={`Decision ${index + 1}`}
                    />
                    <button
                      onClick={() => removeDecision(index)}
                      className="px-3 text-red-600 hover:text-red-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={addDecision}
                  className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors"
                >
                  + Add Decision
                </button>
              </div>

              {/* Action Items */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  5. Action Items
                </label>
                {actionItems.map((item, index) => (
                  <div key={index} className="mb-3 p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-700">Action {index + 1}</span>
                      <button
                        onClick={() => removeActionItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={item.task}
                      onChange={(e) => updateActionItem(index, 'task', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-green-500"
                      placeholder="Task description"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={item.assignedTo}
                        onChange={(e) => updateActionItem(index, 'assignedTo', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Assigned to"
                      />
                      <input
                        type="date"
                        value={item.dueDate}
                        onChange={(e) => updateActionItem(index, 'dueDate', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={addActionItem}
                  className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors"
                >
                  + Add Action Item
                </button>
              </div>

              {/* Risks Identified */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  6. Risks Identified
                </label>
                {risksIdentified.map((risk, index) => (
                  <div key={index} className="mb-2 flex gap-2">
                    <input
                      type="text"
                      value={risk}
                      onChange={(e) => updateRisk(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder={`Risk ${index + 1}`}
                    />
                    <button
                      onClick={() => removeRisk(index)}
                      className="px-3 text-red-600 hover:text-red-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={addRisk}
                  className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors"
                >
                  + Add Risk
                </button>
              </div>

              {/* Conclusion */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  7. Conclusion
                </label>
                <textarea
                  value={conclusion}
                  onChange={(e) => setConclusion(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Summary and next steps..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowReportForm(false)}
                  className="flex-1 py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGeneratePDF}
                  disabled={generating}
                  className="flex-1 py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Generate Report</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Report Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share Report
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email Button */}
            <button
              onClick={handleSendEmail}
              disabled={downloadingPdf}
              className="p-6 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-green-300 rounded-xl transition-all group shadow-sm disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-gray-800 font-semibold mb-1">Send via Email</h3>
                  <p className="text-gray-600 text-sm">Share report with participants</p>
                </div>
              </div>
            </button>

            {/* WhatsApp Button */}
            <button
              onClick={handleSendWhatsApp}
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
                  <p className="text-gray-600 text-sm">Share report instantly</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Generated Reports History */}
        {meeting?.reports && meeting.reports.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-black mb-1">Generated Reports</h2>
                <p className="text-sm text-gray-600">All reports generated for this meeting</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                {meeting.reports.length} Report{meeting.reports.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-3">
              {meeting.reports.map((report: any, index: number) => {
                // Parse agenda data from description field
                let agendaData: any = null;
                if (meeting.description) {
                  try {
                    const parsed = JSON.parse(meeting.description);
                    if (parsed.savedAgendas && parsed.savedAgendas.length > 0) {
                      agendaData = parsed.savedAgendas[parsed.savedAgendas.length - 1];
                    }
                  } catch (e) {
                    // Not JSON
                  }
                }

                // Parse minutes data
                let minutesData: any = null;
                if (meeting.minutes?.discussions) {
                  try {
                    const parsed = JSON.parse(meeting.minutes.discussions);
                    if (parsed.savedMinutes && parsed.savedMinutes.length > 0) {
                      minutesData = parsed.savedMinutes[parsed.savedMinutes.length - 1];
                    }
                  } catch (e) {
                    // Not JSON
                  }
                }

                const isExpanded = expandedReportId === report.id;

                return (
                  <div
                    key={report.id}
                    className="bg-white rounded-lg border border-gray-200 hover:border-green-300 transition-all shadow-sm"
                  >
                    <div className="p-3 sm:p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-black font-semibold text-sm sm:text-base">Report Version {report.version}</h3>
                              <p className="text-xs sm:text-sm text-gray-600">
                                Generated on {new Date(report.generatedAt).toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap lg:flex-nowrap gap-2">
                          <button
                            onClick={() => setExpandedReportId(isExpanded ? null : report.id)}
                            className="px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 col-span-2 sm:col-span-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                            </svg>
                            <span className="hidden sm:inline">{isExpanded ? 'Hide' : 'View'} Report</span>
                            <span className="sm:hidden">{isExpanded ? 'Hide' : 'View'}</span>
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const response = await fetch(`/api/meetings/${resolvedParams.id}/pdf`);
                                if (!response.ok) throw new Error('Failed to download PDF');
                                
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `meeting-report-v${report.version}-${meeting.title.replace(/\s+/g, '-')}.pdf`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                window.URL.revokeObjectURL(url);
                              } catch (error) {
                                console.error('Error downloading PDF:', error);
                                alert('Failed to download PDF');
                              }
                            }}
                            className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="hidden sm:inline">Download PDF</span>
                            <span className="sm:hidden">PDF</span>
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const response = await fetch(`/api/meetings/${resolvedParams.id}/agenda-pdf`);
                                if (!response.ok) throw new Error('Failed to download agenda PDF');
                                
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `agenda-v${report.version}-${meeting.title.replace(/\s+/g, '-')}.pdf`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                window.URL.revokeObjectURL(url);
                              } catch (error) {
                                console.error('Error downloading agenda PDF:', error);
                                alert('Failed to download agenda PDF');
                              }
                            }}
                            className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="hidden sm:inline">Agenda PDF</span>
                            <span className="sm:hidden">Agenda</span>
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm(`Are you sure you want to delete Report Version ${report.version}?\n\nThis action cannot be undone.`)) {
                                return;
                              }
                              try {
                                const response = await fetch(`/api/reports/${report.id}`, {
                                  method: 'DELETE',
                                });
                                if (!response.ok) throw new Error('Failed to delete report');
                                
                                alert('Report deleted successfully!');
                                // Refresh the meeting data
                                await fetchMeeting();
                              } catch (error) {
                                console.error('Error deleting report:', error);
                                alert('Failed to delete report');
                              }
                            }}
                            className="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="hidden sm:inline">Delete</span>
                            <span className="sm:hidden">Del</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Report Content */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 p-6 bg-gray-50">
                        <div className="space-y-6">
                          {/* Meeting Info */}
                          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-black mb-3 flex items-center gap-2">
                              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Meeting Information
                            </h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-gray-600">Date:</span>
                                <span className="text-black ml-2">{new Date(meeting.date).toLocaleDateString()}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Time:</span>
                                <span className="text-black ml-2">{new Date(meeting.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Mode:</span>
                                <span className="text-black ml-2 capitalize">{meeting.meetingMode || 'Offline'}</span>
                              </div>
                              {meeting.meetingLink && (
                                <div className="col-span-2">
                                  <span className="text-gray-600">Link:</span>
                                  <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 ml-2 break-all">
                                    {meeting.meetingLink}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Agenda Section */}
                          {agendaData && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                              <h3 className="text-lg font-bold text-black mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                Meeting Agenda
                              </h3>
                              
                              {agendaData.objectives && (
                                <div className="mb-4">
                                  <h4 className="text-sm font-semibold text-purple-700 mb-2">Objectives:</h4>
                                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{agendaData.objectives}</p>
                                </div>
                              )}

                              {agendaData.preparationRequired && agendaData.preparationRequired.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="text-sm font-semibold text-green-700 mb-2">Preparation Required:</h4>
                                  <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                    {agendaData.preparationRequired.map((item: string, idx: number) => (
                                      <li key={idx}>{item}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {agendaData.agendaItems && agendaData.agendaItems.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="text-sm font-semibold text-purple-700 mb-2">Agenda Items:</h4>
                                  <div className="space-y-2">
                                    {agendaData.agendaItems.map((item: any, idx: number) => (
                                      <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                                        <p className="text-black font-medium">#{idx + 1} {item.topic}</p>
                                        {item.description && <p className="text-gray-600 text-sm mt-1">{item.description}</p>}
                                        <div className="flex gap-4 mt-2 text-xs text-gray-600">
                                          {item.presenter && <span>👤 {item.presenter}</span>}
                                          {item.duration && <span>⏱️ {item.duration} min</span>}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {agendaData.actionItems && agendaData.actionItems.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-orange-700 mb-2">Action Items:</h4>
                                  <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                    {agendaData.actionItems.map((item: string, idx: number) => (
                                      <li key={idx}>{item}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Minutes Section */}
                          {minutesData && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Meeting Minutes
                              </h3>

                              {minutesData.attendees && minutesData.attendees.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="text-sm font-semibold text-green-700 mb-2">Attendees ({minutesData.attendees.length}):</h4>
                                  <p className="text-gray-700 text-sm">{minutesData.attendees.join(', ')}</p>
                                </div>
                              )}

                              {minutesData.discussions && (
                                <div className="mb-4">
                                  <h4 className="text-sm font-semibold text-green-700 mb-2">Discussions:</h4>
                                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{minutesData.discussions}</p>
                                </div>
                              )}

                              {minutesData.decisions && minutesData.decisions.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="text-sm font-semibold text-green-700 mb-2">Decisions Made:</h4>
                                  <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                    {minutesData.decisions.map((decision: string, idx: number) => (
                                      <li key={idx}>{decision}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {minutesData.actionItems && minutesData.actionItems.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="text-sm font-semibold text-yellow-700 mb-2">Action Items:</h4>
                                  <div className="space-y-2">
                                    {minutesData.actionItems.map((item: any, idx: number) => (
                                      <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                                        <p className="text-gray-800 font-medium">{item.task}</p>
                                        <div className="flex gap-4 mt-1 text-xs text-gray-600">
                                          {item.assignedTo && <span>👤 {item.assignedTo}</span>}
                                          {item.dueDate && <span>📅 {new Date(item.dueDate).toLocaleDateString()}</span>}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {minutesData.nextMeeting && (
                                <div>
                                  <h4 className="text-sm font-semibold text-green-700 mb-2">Next Meeting:</h4>
                                  <p className="text-gray-700 text-sm">{new Date(minutesData.nextMeeting).toLocaleString()}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
