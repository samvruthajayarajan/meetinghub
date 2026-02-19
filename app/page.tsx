'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/user');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-300 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-sm shadow-lg border-b border-slate-700/50 z-50 transition-all duration-300">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className={`flex items-center gap-2 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">MeetingHub</span>
            </div>

            {/* Desktop Navigation */}
            <div className={`hidden md:flex items-center gap-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <a href="#home" className="text-slate-300 hover:text-blue-400 font-medium transition-all duration-300 hover:scale-105">Home</a>
              <a href="#features" className="text-slate-300 hover:text-blue-400 font-medium transition-all duration-300 hover:scale-105">Features</a>
              <button
                onClick={() => router.push('/auth/signin')}
                className="text-slate-300 hover:text-blue-400 font-medium transition-all duration-300 hover:scale-105"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/auth/register')}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 font-medium shadow-lg hover:shadow-blue-500/50 hover:scale-105"
              >
                Register
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-blue-400 transition-colors duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-700 animate-fadeIn">
              <div className="flex flex-col gap-4">
                <a href="#home" className="text-slate-300 hover:text-blue-400 font-medium transition-colors duration-300">Home</a>
                <a href="#features" className="text-slate-300 hover:text-blue-400 font-medium transition-colors duration-300">Features</a>
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="text-left text-slate-300 hover:text-blue-400 font-medium transition-colors duration-300"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push('/auth/register')}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 font-medium text-center shadow-lg"
                >
                  Register
                </button>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-800/50 to-slate-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-slate-7000/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
          {/* Left Content */}
          <div className={`text-center lg:text-left transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-7000/10 border border-blue-500/30 rounded-full mb-4 animate-fadeIn backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
              <span className="text-xs text-blue-300 font-medium">Professional Meeting Management</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 animate-fadeIn leading-tight">
              Professional Meeting
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mt-1">Management System</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-300 mb-8 leading-relaxed animate-fadeIn delay-200">
              Streamline your meetings with our comprehensive platform. Create agendas, record minutes, 
              generate reports, and collaborate efficiently—all in one place.
            </p>
            <div className="flex gap-3 justify-center lg:justify-start flex-wrap animate-fadeIn delay-300 mb-10">
              <button
                onClick={() => router.push('/auth/signin')}
                className="group px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 text-sm sm:text-base font-semibold shadow-lg hover:shadow-blue-500/50 hover:scale-105 transform flex items-center gap-2"
              >
                Get Started
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button
                onClick={() => {
                  const featuresSection = document.getElementById('features');
                  featuresSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group px-5 sm:px-6 py-2.5 sm:py-3 bg-slate-900/50 text-slate-200 rounded-lg hover:bg-slate-700/50 transition-all duration-300 text-sm sm:text-base font-semibold border-2 border-blue-500/50 hover:border-blue-400 backdrop-blur-sm hover:scale-105 transform flex items-center gap-2"
              >
                Explore Features
                <svg className="w-4 h-4 group-hover:translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-8 animate-fadeIn delay-500">
              <div className="text-center lg:text-left">
                <div className="text-xl sm:text-2xl font-bold text-white mb-0.5">500+</div>
                <div className="text-xs text-slate-400">Active Users</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-xl sm:text-2xl font-bold text-white mb-0.5">10K+</div>
                <div className="text-xs text-slate-400">Meetings</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-xl sm:text-2xl font-bold text-white mb-0.5">99%</div>
                <div className="text-xs text-slate-400">Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className={`hidden lg:block transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="relative max-w-lg mx-auto">
              {/* Animated Illustration */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 p-8">
                <svg viewBox="0 0 500 400" className="w-full h-auto">
                  {/* Background Elements */}
                  <circle cx="250" cy="200" r="150" fill="url(#gradient1)" opacity="0.1" className="animate-pulse"/>
                  <circle cx="350" cy="100" r="80" fill="url(#gradient2)" opacity="0.1" className="animate-pulse delay-500"/>
                  
                  {/* Desk */}
                  <rect x="50" y="280" width="400" height="15" rx="7" fill="#475569" opacity="0.8"/>
                  
                  {/* Laptop */}
                  <g className="animate-float">
                    <rect x="180" y="200" width="140" height="90" rx="5" fill="#334155"/>
                    <rect x="185" y="205" width="130" height="75" rx="3" fill="#1e293b"/>
                    {/* Screen content - Meeting interface */}
                    <rect x="195" y="215" width="110" height="8" rx="2" fill="#3b82f6" opacity="0.6"/>
                    <rect x="195" y="230" width="80" height="6" rx="2" fill="#60a5fa" opacity="0.4"/>
                    <rect x="195" y="242" width="90" height="6" rx="2" fill="#60a5fa" opacity="0.4"/>
                    <rect x="195" y="254" width="70" height="6" rx="2" fill="#60a5fa" opacity="0.4"/>
                    {/* Laptop base */}
                    <path d="M 170 290 L 180 280 L 320 280 L 330 290 Z" fill="#475569"/>
                  </g>
                  
                  {/* Documents */}
                  <g className="animate-float delay-300">
                    <rect x="80" y="220" width="70" height="90" rx="4" fill="#334155" opacity="0.9"/>
                    <rect x="85" y="225" width="60" height="4" rx="2" fill="#3b82f6" opacity="0.6"/>
                    <rect x="85" y="235" width="50" height="3" rx="1" fill="#60a5fa" opacity="0.4"/>
                    <rect x="85" y="243" width="55" height="3" rx="1" fill="#60a5fa" opacity="0.4"/>
                    <rect x="85" y="251" width="45" height="3" rx="1" fill="#60a5fa" opacity="0.4"/>
                  </g>
                  
                  {/* Coffee Cup */}
                  <g className="animate-float delay-700">
                    <ellipse cx="380" cy="265" rx="20" ry="5" fill="#475569" opacity="0.5"/>
                    <rect x="360" y="240" width="40" height="25" rx="3" fill="#334155"/>
                    <path d="M 400 250 Q 415 250 415 260 Q 415 270 400 270" stroke="#475569" strokeWidth="3" fill="none"/>
                    {/* Steam */}
                    <path d="M 370 235 Q 372 225 370 215" stroke="#60a5fa" strokeWidth="2" fill="none" opacity="0.4" className="animate-pulse"/>
                    <path d="M 380 235 Q 382 225 380 215" stroke="#60a5fa" strokeWidth="2" fill="none" opacity="0.4" className="animate-pulse delay-200"/>
                    <path d="M 390 235 Q 392 225 390 215" stroke="#60a5fa" strokeWidth="2" fill="none" opacity="0.4" className="animate-pulse delay-500"/>
                  </g>
                  
                  {/* Floating Icons */}
                  <g className="animate-float delay-500">
                    {/* Calendar Icon */}
                    <rect x="100" y="120" width="50" height="50" rx="5" fill="#3b82f6" opacity="0.2"/>
                    <rect x="105" y="130" width="40" height="35" rx="3" fill="#3b82f6" opacity="0.4"/>
                    <line x1="115" y1="125" x2="115" y2="135" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round"/>
                    <line x1="135" y1="125" x2="135" y2="135" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round"/>
                  </g>
                  
                  <g className="animate-float delay-1000">
                    {/* Check Icon */}
                    <circle cx="380" cy="150" r="25" fill="#10b981" opacity="0.2"/>
                    <circle cx="380" cy="150" r="20" fill="#10b981" opacity="0.4"/>
                    <path d="M 370 150 L 377 157 L 390 144" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                  
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6"/>
                      <stop offset="100%" stopColor="#06b6d4"/>
                    </linearGradient>
                    <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4"/>
                      <stop offset="100%" stopColor="#3b82f6"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-900 relative pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 animate-fadeIn">Key Features</h2>
            <p className="text-xl text-slate-300 animate-fadeIn delay-100">Everything you need for effective meeting management</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Agenda Creation */}
            <div className="group p-8 bg-slate-900/50 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-500 border border-slate-700/50 hover:border-blue-500/50 hover:-translate-y-2 animate-fadeIn delay-200">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-blue-500/50">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">Agenda Creation</h3>
              <p className="text-slate-300">Create structured meeting agendas with topics, time allocations, and detailed descriptions for organized discussions.</p>
            </div>

            {/* Minutes Recording */}
            <div className="group p-8 bg-slate-900/50 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-500 border border-slate-700/50 hover:border-blue-500/50 hover:-translate-y-2 animate-fadeIn delay-300">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-blue-500/50">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">Minutes Recording</h3>
              <p className="text-slate-300">Record comprehensive meeting minutes including discussions, decisions, and action items with ease.</p>
            </div>

            {/* PDF Download */}
            <div className="group p-8 bg-slate-900/50 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-500 border border-slate-700/50 hover:border-blue-500/50 hover:-translate-y-2 animate-fadeIn delay-400">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-blue-500/50">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">PDF Download</h3>
              <p className="text-slate-300">Generate and download professional PDF reports of your meetings with a single click.</p>
            </div>

            {/* Email Reports */}
            <div className="group p-8 bg-slate-900/50 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-500 border border-slate-700/50 hover:border-blue-500/50 hover:-translate-y-2 animate-fadeIn delay-500">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-blue-500/50">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">Email Reports</h3>
              <p className="text-slate-300">Send meeting reports directly to attendees via email with automatic distribution.</p>
            </div>

            {/* Version Control */}
            <div className="group p-8 bg-slate-900/50 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-500 border border-slate-700/50 hover:border-blue-500/50 hover:-translate-y-2 animate-fadeIn delay-600">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-blue-500/50">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">Version Control</h3>
              <p className="text-slate-300">Track all changes with complete version history and audit logs for accountability.</p>
            </div>

            {/* Collaboration */}
            <div className="group p-8 bg-slate-900/50 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-500 border border-slate-700/50 hover:border-blue-500/50 hover:-translate-y-2 animate-fadeIn delay-700">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-blue-500/50">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">Team Collaboration</h3>
              <p className="text-slate-300">Collaborate seamlessly with team members and share meeting information efficiently.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white mt-20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-slate-7000/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-600/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="lg:col-span-1 animate-fadeIn">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">MeetingHub</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Streamline your meetings with our comprehensive platform for agenda creation, minutes recording, and professional reporting.
              </p>
              {/* Social Links */}
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 bg-slate-900/50 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50 border border-slate-700/50 hover:border-blue-500/50">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="w-9 h-9 bg-slate-900/50 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50 border border-slate-700/50 hover:border-blue-500/50">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="w-9 h-9 bg-slate-900/50 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50 border border-slate-700/50 hover:border-blue-500/50">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a href="#" className="w-9 h-9 bg-slate-900/50 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50 border border-slate-700/50 hover:border-blue-500/50">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <div className="animate-fadeIn delay-100">
              <h3 className="text-base font-semibold mb-4 text-white">Product</h3>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#features" className="text-slate-400 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Features
                </a></li>
                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Pricing
                </a></li>
                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Documentation
                </a></li>
                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  API Reference
                </a></li>
                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Release Notes
                </a></li>
              </ul>
            </div>

            {/* Company */}
            <div className="animate-fadeIn delay-200">
              <h3 className="text-base font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  About Us
                </a></li>
                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Careers
                </a></li>
                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Blog
                </a></li>
                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Contact
                </a></li>
                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Partners
                </a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="animate-fadeIn delay-300">
              <h3 className="text-base font-semibold mb-4 text-white">Support</h3>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Help Center
                </a></li>
                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Community
                </a></li>
                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Status
                </a></li>
                <li><button onClick={() => router.push('/auth/signin')} className="text-slate-400 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Login
                </button></li>
                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Contact Support
                </a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Full-width divider line */}
        <div className="w-full border-t border-slate-700/50"></div>
        
        {/* Bottom Bar */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">
              © 2024 MeetingHub. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors duration-300">Privacy Policy</a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors duration-300">Terms of Service</a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors duration-300">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
