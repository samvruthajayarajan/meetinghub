'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';

export default function MeetingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(true);
  const [meeting, setMeeting] = useState<any>(null);

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

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/meetings/${resolvedParams.id}/meeting-details-pdf`);
      if (!response.ok) throw new Error('Failed to generate PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting-details-${meeting.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF');
    }
  };

  const handleSendEmail = () => {
    if (!emailRecipients.trim()) {
      alert('Please enter at least one email address');
      return;
    }

    const recipientList = emailRecipients.split(',').map(email => email.trim()).filter(email => email);
    
    // Create email content
    const subject = `Meeting: ${meeting.title}`;
    const body = `
Meeting Details:

Title: ${meeting.title}
Date: ${new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Time: ${new Date(meeting.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
Mode: ${meeting.meetingMode ? meeting.meetingMode.charAt(0).toUpperCase() + meeting.meetingMode.slice(1) : 'Offline'}
${meeting.location ? `Presenter: ${meeting.location}` : ''}
${meeting.meetingLink ? `Meeting Link: ${meeting.meetingLink}` : ''}

Please join on time.

---
Sent from Meeting Management System
    `.trim();

    // Open default email client
    const mailtoLink = `mailto:${recipientList.join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    
    setShowEmailModal(false);
    setEmailRecipients('');
  };

  const handleSendWhatsApp = () => {
    if (!whatsappNumbers.trim()) {
      alert('Please enter at least one WhatsApp number');
      return;
    }

    const phoneNumbers = whatsappNumbers
      .split('\n')
      .map(num => num.trim())
      .filter(num => num.length > 0);
    
    if (phoneNumbers.length === 0) {
      alert('Please enter at least one valid phone number');
      return;
    }

    // Create WhatsApp message
    const message = `
*Meeting Details*

📋 *Title:* ${meeting.title}
📅 *Date:* ${new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
🕐 *Time:* ${new Date(meeting.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
📍 *Mode:* ${meeting.meetingMode ? meeting.meetingMode.charAt(0).toUpperCase() + meeting.meetingMode.slice(1) : 'Offline'}
${meeting.location ? `👤 *Presenter:* ${meeting.location}` : ''}
${meeting.meetingLink ? `🔗 *Link:* ${meeting.meetingLink}` : ''}

Please join on time.
    `.trim();

    // Open WhatsApp for each number
    phoneNumbers.forEach((phone, index) => {
      setTimeout(() => {
        const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      }, index * 1000);
    });
    
    setShowWhatsAppModal(false);
    setWhatsappNumbers('');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-4 text-gray-800">Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <p className="text-gray-800">Meeting not found</p>
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
              <h1 className="text-2xl font-bold text-gray-800">Meeting Details</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">{meeting.title}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="text-gray-800 font-medium">{new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="text-gray-800 font-medium">{new Date(meeting.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="text-sm text-gray-600">Mode</p>
                <p className="text-gray-800 font-medium capitalize">{meeting.meetingMode || 'Offline'}</p>
              </div>
            </div>

            {meeting.location && (
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-600">Presenter</p>
                  <p className="text-gray-800 font-medium">{meeting.location}</p>
                </div>
              </div>
            )}

            {meeting.meetingLink && (
              <div className="flex items-center gap-3 md:col-span-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Meeting Link</p>
                  <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium break-all">{meeting.meetingLink}</a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Share Meeting Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleDownloadPDF}
              className="p-6 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-green-300 rounded-xl transition-all group shadow-sm"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-center">
                  <h4 className="text-gray-800 font-semibold">Download PDF</h4>
                  <p className="text-gray-600 text-sm">Save meeting details</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                const subject = `Meeting: ${meeting.title}`;
                const body = `
Meeting Details:

Title: ${meeting.title}
Date: ${new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Time: ${new Date(meeting.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
Mode: ${meeting.meetingMode ? meeting.meetingMode.charAt(0).toUpperCase() + meeting.meetingMode.slice(1) : 'Offline'}
${meeting.location ? `Presenter: ${meeting.location}` : ''}
${meeting.meetingLink ? `Meeting Link: ${meeting.meetingLink}` : ''}

Please join on time.

---
Sent from Meeting Management System
                `.trim();
                window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
              }}
              className="p-6 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-green-300 rounded-xl transition-all group shadow-sm"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-center">
                  <h4 className="text-gray-800 font-semibold">Send via Email</h4>
                  <p className="text-gray-600 text-sm">Share with participants</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                const message = `
*Meeting Details*

📋 *Title:* ${meeting.title}
📅 *Date:* ${new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
🕐 *Time:* ${new Date(meeting.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
📍 *Mode:* ${meeting.meetingMode ? meeting.meetingMode.charAt(0).toUpperCase() + meeting.meetingMode.slice(1) : 'Offline'}
${meeting.location ? `👤 *Presenter:* ${meeting.location}` : ''}
${meeting.meetingLink ? `🔗 *Link:* ${meeting.meetingLink}` : ''}

Please join on time.
                `.trim();
                window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
              }}
              className="p-6 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-green-300 rounded-xl transition-all group shadow-sm"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div className="text-center">
                  <h4 className="text-gray-800 font-semibold">Send via WhatsApp</h4>
                  <p className="text-gray-600 text-sm">Share instantly</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
