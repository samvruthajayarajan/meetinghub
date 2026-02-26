export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: February 26, 2026</p>
        
        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
          <p className="text-gray-700 mb-4">
            MeetingHub collects the following information:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Email address and name (when you sign up or sign in with Google)</li>
            <li>Meeting information you create (titles, dates, agendas, minutes, reports)</li>
            <li>Gmail access tokens (only when you explicitly authorize Gmail integration)</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">
            We use your information to:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Provide meeting management services</li>
            <li>Send emails on your behalf (only when you explicitly request it)</li>
            <li>Authenticate your account</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Gmail API Usage</h2>
          <p className="text-gray-700 mb-4">
            MeetingHub's use of information received from Gmail APIs adheres to{' '}
            <a href="https://developers.google.com/terms/api-services-user-data-policy" 
               className="text-blue-600 hover:underline" 
               target="_blank" 
               rel="noopener noreferrer">
              Google API Services User Data Policy
            </a>, including the Limited Use requirements.
          </p>
          <p className="text-gray-700 mb-4">
            We only use Gmail API to send emails on your behalf when you explicitly request it. 
            We do not read, store, or share your Gmail messages.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Data Storage</h2>
          <p className="text-gray-700 mb-4">
            Your data is stored securely in MongoDB Atlas. Gmail access tokens are encrypted and 
            stored securely in our database.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Data Sharing</h2>
          <p className="text-gray-700 mb-4">
            We do not sell, trade, or share your personal information with third parties. 
            Your Gmail access is used solely to send emails on your behalf.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Your Rights</h2>
          <p className="text-gray-700 mb-4">
            You can:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Revoke Gmail access at any time from your Google Account settings</li>
            <li>Delete your account and all associated data</li>
            <li>Request a copy of your data</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have questions about this Privacy Policy, contact us at: samvruthajayarajan02@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}
