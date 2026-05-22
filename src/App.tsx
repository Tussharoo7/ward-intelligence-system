import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Map, 
  Users, 
  MessageSquareCode, 
  UserCircle, 
  Award, 
  TrendingUp, 
  Flame, 
  ThumbsUp, 
  Download, 
  Plus, 
  Globe, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Search, 
  Check, 
  Filter, 
  LogOut, 
  AlertTriangle, 
  Clock, 
  ChevronRight, 
  Sparkles,
  RefreshCw,
  FileText,
  UserCheck
} from 'lucide-react';
import { User, Ward, Candidate, Issue, FeedbackEntry, LeaderboardEntry, LanguageCode } from './types';
import { WARDS_DATA, ALL_CANDIDATES_DATA, LEADERBOARD_WARD_DATA, LEADERBOARD_CITY_DATA, getWardName } from './data';
import { getTranslation } from './localization/app_localizations';

export default function App() {
  // Navigation & Language state
  const [lang, setLang] = useState<LanguageCode>('en');
  const [authState, setAuthState] = useState<'splash' | 'langSelect' | 'login' | 'dashboard'>('splash');
  const [activeTab, setActiveTab] = useState<'home' | 'analytics' | 'candidates' | 'bot' | 'profile'>('home');
  
  // App variables
  const [selectedWardId, setSelectedWardId] = useState<number>(10); // Default Vijay Nagar
  const [phone, setPhone] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [epicId, setEpicId] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // User Gamification State
  const [user, setUser] = useState<User>({
    id: "voter-indore-92",
    name: "Tushar Thakre",
    phone: "9876543210",
    wardId: 10,
    points: 120,
    streak: 6,
    badges: ["Verified Voter", "7-Day Streak"],
    language: 'en'
  });
  const [hasCheckedInToday, setHasCheckedInToday] = useState<boolean>(false);
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState<string>('');

  // Ward & Candidate Interactive States
  const [wards, setWards] = useState<Ward[]>(WARDS_DATA);
  const [candidateList, setCandidateList] = useState<Candidate[]>(ALL_CANDIDATES_DATA);
  
  // Search & Filter States
  const [candidateSearchQuery, setCandidateSearchQuery] = useState<string>('');
  const [selectedPartyFilter, setSelectedPartyFilter] = useState<string>('All');
  const [compareCandidateIds, setCompareCandidateIds] = useState<string[]>([]);
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);

  // Feedback Submission Form
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [feedbackVoterId, setFeedbackVoterId] = useState<string>('');
  const [selectedSentiment, setSelectedSentiment] = useState<'positive' | 'neutral' | 'negative'>('positive');
  const [selectedCandidateForFeedback, setSelectedCandidateForFeedback] = useState<string>('');

  // WardBot AI Assistant State
  const [aiInput, setAiInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'bot', text: string, timestamp: string }>>([
    { 
      sender: 'bot', 
      text: "Namaste! I am WardBot, your Indore civic intelligence intelligence assistant. Ask me questions about localized polls, candidate standings, or track pending complaints in Ward 1 to 85. Aap Hindi, Hinglish ya English me pooch sakte hain!", 
      timestamp: "02:29 AM" 
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  
  // Voice & TTS State
  const [voiceActive, setVoiceActive] = useState<boolean>(false);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true);
  const [recognitionActive, setRecognitionActive] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // PDF Generator parameters
  const [reportDateRange, setReportDateRange] = useState<string>('May 2026');
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);
  const [showPdfPreview, setShowPdfPreview] = useState<boolean>(false);

  // Auto Scroll Chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAiLoading]);

  // Language initializer from local settings
  useEffect(() => {
    const savedLang = localStorage.getItem('ward_analytics_lang');
    if (savedLang) {
      setLang(savedLang as LanguageCode);
    }
  }, []);

  const handleLanguageChange = (newLang: LanguageCode) => {
    setLang(newLang);
    localStorage.setItem('ward_analytics_lang', newLang);
  };

  // OTP Verification logic
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setLoginError(getTranslation(lang, 'invalidPhone'));
      return;
    }
    setOtpSent(true);
    setLoginError('');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '123456') {
      setLoginError(getTranslation(lang, 'invalidOtp'));
      return;
    }
    // Set authenticated
    setAuthState('dashboard');
    setLoginError('');
  };

  // Points & Check-in Gamification Action
  const triggerCheckIn = () => {
    if (hasCheckedInToday) return;
    setHasCheckedInToday(true);
    const updatedStreak = user.streak + 1;
    let earnedBadges = [...user.badges];
    if (updatedStreak >= 7 && !earnedBadges.includes("7-Day Streak")) {
      earnedBadges.push("7-Day Streak");
    }
    setUser({
      ...user,
      points: user.points + 10,
      streak: updatedStreak,
      badges: earnedBadges
    });
    // Visual Notification
    setFeedbackSuccessMsg(getTranslation(lang, 'checkedInMsg'));
    setTimeout(() => setFeedbackSuccessMsg(''), 4000);
  };

  // Upvote Problem Ticket
  const upvoteIssue = (issueId: string) => {
    setWards(prevWards => prevWards.map(w => {
      if (w.id === selectedWardId) {
        return {
          ...w,
          issues: w.issues.map(issue => {
            if (issue.id === issueId) {
              return { ...issue, upvotes: issue.upvotes + 1 };
            }
            return issue;
          })
        };
      }
      return w;
    }));
  };

  // Submit Feedback Entry Form
  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    // Check epic id mock verification
    const isVerified = feedbackVoterId.trim().toUpperCase().startsWith('MP');

    // Add comment dynamically under candidate
    if (selectedCandidateForFeedback) {
      setCandidateList(prev => prev.map(c => {
        if (c.id === selectedCandidateForFeedback) {
          return {
            ...c,
            comments: [
              {
                id: `new-feedback-${Date.now()}`,
                authorName: user.name,
                text: feedbackText,
                sentiment: selectedSentiment,
                timestamp: new Date().toISOString().split('T')[0]
              },
              ...c.comments
            ]
          };
        }
        return c;
      }));
    }

    // Award Points
    let earnedBadges = [...user.badges];
    if (isVerified && !earnedBadges.includes("Verified Voter")) {
      earnedBadges.push("Verified Voter");
    }
    if (!earnedBadges.includes("Feedback Champion")) {
      earnedBadges.push("Feedback Champion");
    }

    setUser({
      ...user,
      points: user.points + 25,
      badges: earnedBadges
    });

    setFeedbackSuccessMsg("Feedback Submitted Successfully! +25 Points added & AI updated");
    setFeedbackText('');
    setFeedbackVoterId('');
    setTimeout(() => setFeedbackSuccessMsg(''), 5000);
  };

  // Request Gemini API to run Chat Dialogue
  const sendAiQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    // Append user message
    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatHistory(prev => [...prev, { sender: 'user', text: queryText, timestamp: formattedTime }]);
    setAiInput('');
    setIsAiLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: queryText,
          lang: lang,
          wardId: selectedWardId
        })
      });

      const data = await response.json();
      const botResponseText = data.text || "Sorry, I could not process that message.";

      setChatHistory(prev => [...prev, { 
        sender: 'bot', 
        text: botResponseText, 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);

      // TTS synthesis
      if (ttsEnabled && window.speechSynthesis) {
        // Cancel ongoing speak speech
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(botResponseText.replace(/[\*#_\[\]]/g, ''));
        // Set voice based on language
        if (lang === 'hi') {
          utterance.lang = 'hi-IN';
        } else {
          utterance.lang = 'en-IN';
        }
        window.speechSynthesis.speak(utterance);
      }

    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { 
        sender: 'bot', 
        text: "Connection limit hit. System registered. Support trends show high confidence in Indore smart transport corridors.", 
        timestamp: formattedTime 
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Voice recognition mockup tool
  const toggleVoiceInput = () => {
    if (voiceActive) {
      setVoiceActive(false);
      return;
    }

    // Check if system has Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Simulate speech input
      setVoiceActive(true);
      const simulatedInputs = [
        "Vijay Nagar Ward 10 key candidates kaun hai?",
        "Status of pending water issues in Palasia?",
        "Rajwada Ward 45 mein development ka score kya hai?",
        "Which candidate is currently leading in Indore support shares?"
      ];
      const randomInput = simulatedInputs[Math.floor(Math.random() * simulatedInputs.length)];
      
      setTimeout(() => {
        setAiInput(randomInput);
        setVoiceActive(false);
        sendAiQuery(randomInput);
      }, 2500);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

    recognition.onstart = () => {
      setVoiceActive(true);
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setAiInput(speechToText);
      sendAiQuery(speechToText);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setVoiceActive(false);
    };

    recognition.onend = () => {
      setVoiceActive(false);
    };

    recognition.start();
  };

  // Simulated PDF Downloader triggering native printing frame styles
  const handlePrintPdfDownload = () => {
    setDownloadingPdf(true);
    setTimeout(() => {
      setDownloadingPdf(false);
      window.print();
    }, 1500);
  };

  // Helper variables
  const activeWardObj = wards.find(w => w.id === selectedWardId) || wards[2];
  const activeCandidateList = candidateList.filter(c => c.wardId === selectedWardId);
  
  // Calculate top contender
  const leadingCandidate = [...activeCandidateList].sort((a,b) => b.supportPercent - a.supportPercent)[0];

  // Candidates for All screen filtering
  const allScreenCandidatesFiltered = candidateList.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(candidateSearchQuery.toLowerCase()) ||
                          getWardName(c.wardId).toLowerCase().includes(candidateSearchQuery.toLowerCase());
    const matchesParty = selectedPartyFilter === 'All' ? true : c.party === selectedPartyFilter;
    return matchesSearch && matchesParty;
  });

  return (
    <div id="app_root" className="min-h-screen flex flex-col bg-[#F6F8FB] text-slate-800 font-sans print:bg-white print:text-black antialiased">
      
      {/* 1. APP HEADER LINE (Top utility bar) */}
      <span className="hidden">● WARD ANALYTICS PRO LIVE</span>

      {/* SUCCESS BANNER */}
      {feedbackSuccessMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white font-bold py-3 px-6 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="w-5 h-5" />
          <span>{feedbackSuccessMsg}</span>
        </div>
      )}

      {/* --- AUTH / LANDING FLOW SCREENS --- */}
      {authState === 'splash' && (
        <div id="splash_screen" className="flex-1 flex flex-col justify-center items-center p-6 text-center bg-gradient-to-b from-indigo-900 via-indigo-955 to-slate-900 text-white">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl mb-6 border border-indigo-400">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
            {getTranslation(lang, 'appTitle')}
          </h1>
          <p className="text-indigo-200 max-w-md text-base leading-relaxed mb-8 font-medium">
            {getTranslation(lang, 'welcomeSub')}
          </p>

          <div className="space-y-3 w-full max-w-sm">
            <button 
              id="splash_btn_continue"
              onClick={() => setAuthState('langSelect')}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 text-lg cursor-pointer"
            >
              <span>Prarambh Karein / Let's Start</span>
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="text-xs text-indigo-300 tracking-wider">
              OFFICIAL SYSTEM FOR INDORE MUNISIPAL CORPORATION WARDS 1–85
            </div>
          </div>
        </div>
      )}

      {authState === 'langSelect' && (
        <div id="language_select_screen" className="flex-1 flex flex-col justify-center items-center p-6 bg-slate-50">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl w-full max-w-md text-center">
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
              <Globe className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {getTranslation(lang, 'selectLanguage')}
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              {getTranslation(lang, 'selectLanguageSub')}
            </p>

            <div className="space-y-3 mb-8">
              <button 
                id="lang_en"
                onClick={() => handleLanguageChange('en')}
                className={`w-full py-4 px-5 rounded-2xl border text-left font-bold transition-all flex items-center justify-between ${lang === 'en' ? 'bg-indigo-50 border-indigo-600 text-indigo-950' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}`}
              >
                <span>English (Official Analytics)</span>
                {lang === 'en' && <span className="w-3 h-3 bg-indigo-600 rounded-full"></span>}
              </button>
              
              <button 
                id="lang_hi"
                onClick={() => handleLanguageChange('hi')}
                className={`w-full py-4 px-5 rounded-2xl border text-left font-bold transition-all flex items-center justify-between ${lang === 'hi' ? 'bg-indigo-50 border-indigo-600 text-indigo-950' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}`}
              >
                <span>हिन्दी (देवनागरी)</span>
                {lang === 'hi' && <span className="w-3 h-3 bg-indigo-600 rounded-full"></span>}
              </button>

              <button 
                id="lang_hng"
                onClick={() => handleLanguageChange('hng')}
                className={`w-full py-4 px-5 rounded-2xl border text-left font-bold transition-all flex items-center justify-between ${lang === 'hng' ? 'bg-indigo-50 border-indigo-600 text-indigo-950' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}`}
              >
                <span>Hinglish (Roman Script)</span>
                {lang === 'hng' && <span className="w-3 h-3 bg-indigo-600 rounded-full"></span>}
              </button>
            </div>

            <button 
              id="lang_confirm_btn"
              onClick={() => setAuthState('login')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-md"
            >
              Confirm Language
            </button>
          </div>
        </div>
      )}

      {authState === 'login' && (
        <div id="auth_screen" className="flex-1 flex flex-col justify-center items-center p-6 bg-slate-50">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {getTranslation(lang, 'welcomeTitle')}
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Verified Voter Access Panel & Analytical Intelligence
            </p>

            {loginError && (
              <div className="mb-4 bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-xs font-semibold">
                {loginError}
              </div>
            )}

            {!otpSent ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">{getTranslation(lang, 'enterMobile')}</label>
                  <input 
                    type="tel"
                    id="login_phone"
                    maxLength={10}
                    placeholder={getTranslation(lang, 'mobilePlaceholder')}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g,''))}
                    className="w-full py-3 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">{getTranslation(lang, 'enterVoterId')} (Optional)</label>
                  <input 
                    type="text"
                    id="login_epic"
                    placeholder="e.g. MP12345678"
                    value={epicId}
                    onChange={(e) => setEpicId(e.target.value.toUpperCase())}
                    className="w-full py-3 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
                <button 
                  type="submit"
                  id="get_otp_btn"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-2xl shadow-md transition-all cursor-pointer"
                >
                  {getTranslation(lang, 'getOtp')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-800 border border-amber-200 mb-3">
                  {getTranslation(lang, 'mockOtpHint')}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">{getTranslation(lang, 'enterOtp')}</label>
                  <input 
                    type="text"
                    id="login_otp"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g,''))}
                    className="w-full py-3 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center tracking-widest font-bold text-xl"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  id="verify_otp_btn"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-2xl shadow-md transition-all cursor-pointer"
                >
                  {getTranslation(lang, 'verifyLogin')}
                </button>
                <button 
                  type="button"
                  id="auth_back"
                  onClick={() => setOtpSent(false)}
                  className="w-full text-slate-500 hover:text-slate-800 text-xs font-bold text-center mt-2 cursor-pointer"
                >
                  Back to edit phone
                </button>
              </form>
            )}
          </div>
        </div>
      )}


      {/* --- CORE MAIN DASHBOARD SCREEN WORKSPACE (Authenticated) --- */}
      {authState === 'dashboard' && (
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT SIDEBAR (The Professional Polish theme sidebar) */}
          <aside className="w-72 bg-white border-r border-slate-200 flex flex-col justify-between py-6 px-4 shrink-0 hidden md:flex">
            <section className="space-y-6">
              {/* Branding Unit */}
              <div className="flex items-center gap-3 px-3 mb-6">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">
                    {getTranslation(lang, 'appTitle')}
                  </h1>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mt-1">
                    INDORE WARD PRO
                  </span>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1">
                <button 
                  id="nav_home"
                  onClick={() => { setActiveTab('home'); setIsCompareMode(false); }}
                  className={`w-full text-left px-3 py-3 rounded-lg flex items-center gap-3 transition-colors text-sm cursor-pointer ${activeTab === 'home' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-50 text-slate-500'}`}
                >
                  {activeTab === 'home' && <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>}
                  <Map className="w-4 h-4 shrink-0" />
                  <span>{getTranslation(lang, 'homeTab')}</span>
                </button>

                <button 
                  id="nav_analytics"
                  onClick={() => { setActiveTab('analytics'); setIsCompareMode(false); }}
                  className={`w-full text-left px-3 py-3 rounded-lg flex items-center gap-3 transition-colors text-sm cursor-pointer ${activeTab === 'analytics' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-50 text-slate-500'}`}
                >
                  {activeTab === 'analytics' && <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>}
                  <TrendingUp className="w-4 h-4 shrink-0" />
                  <span>{getTranslation(lang, 'analyticsTab')}</span>
                </button>

                <button 
                  id="nav_candidates"
                  onClick={() => { setActiveTab('candidates'); setIsCompareMode(false); }}
                  className={`w-full text-left px-3 py-3 rounded-lg flex items-center gap-3 transition-colors text-sm cursor-pointer ${activeTab === 'candidates' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-50 text-slate-500'}`}
                >
                  {activeTab === 'candidates' && <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>}
                  <Users className="w-4 h-4 shrink-0" />
                  <span>{getTranslation(lang, 'candidatesTab')}</span>
                </button>

                <button 
                  id="nav_bot"
                  onClick={() => { setActiveTab('bot'); setIsCompareMode(false); }}
                  className={`w-full text-left px-3 py-3 rounded-lg flex items-center gap-3 transition-colors text-sm cursor-pointer ${activeTab === 'bot' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-50 text-slate-500'}`}
                >
                  {activeTab === 'bot' && <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>}
                  <MessageSquareCode className="w-4 h-4 shrink-0" />
                  <span>{getTranslation(lang, 'aiBotTab')}</span>
                </button>

                <button 
                  id="nav_profile"
                  onClick={() => { setActiveTab('profile'); setIsCompareMode(false); }}
                  className={`w-full text-left px-3 py-3 rounded-lg flex items-center gap-3 transition-colors text-sm cursor-pointer ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-50 text-slate-500'}`}
                >
                  {activeTab === 'profile' && <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>}
                  <UserCircle className="w-4 h-4 shrink-0" />
                  <span>{getTranslation(lang, 'profileTab')}</span>
                </button>
              </nav>

              {/* Language Switch Panel */}
              <div className="pt-4 border-t border-slate-100">
                <div className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2 px-3">
                  SYSTEM LANGUAGE
                </div>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
                  <button 
                    onClick={() => handleLanguageChange('en')} 
                    className={`py-1 text-xs font-bold rounded ${lang === 'en' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    EN
                  </button>
                  <button 
                    onClick={() => handleLanguageChange('hi')} 
                    className={`py-1 text-xs font-bold rounded ${lang === 'hi' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    HI
                  </button>
                  <button 
                    onClick={() => handleLanguageChange('hng')} 
                    className={`py-1 text-xs font-bold rounded ${lang === 'hng' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    HNG
                  </button>
                </div>
              </div>
            </section>

            {/* AI Assistant Sidebar Promo Bubble */}
            <section className="space-y-4">
              <div className="bg-indigo-900 rounded-2xl p-4 text-white">
                <div className="text-xs opacity-70 uppercase tracking-widest mb-1 font-bold">LIVE AI QUIP</div>
                <p className="text-xs mb-3 leading-relaxed">
                  "Ward {selectedWardId} {leadingCandidate?.name ? `${leadingCandidate.name} (${leadingCandidate.party})` : ''} support margin is holding {leadingCandidate ? leadingCandidate.supportPercent : 42}% margin."
                </p>
                <button 
                  id="aside_bot_trigger"
                  onClick={() => setActiveTab('bot')}
                  className="w-full bg-white text-indigo-900 hover:bg-slate-100 text-xs font-bold py-2 rounded-xl transition-all cursor-pointer"
                >
                  Ask WardBot AI
                </button>
              </div>

              {/* Account logout */}
              <button 
                id="sidebar_logout"
                onClick={() => setAuthState('splash')}
                className="w-full text-left py-2 px-3 hover:text-red-700 text-slate-400 transition-colors text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{getTranslation(lang, 'logout')}</span>
              </button>
            </section>
          </aside>

          {/* MAIN CONTENT AREA CONTAINER */}
          <main className="flex-1 flex flex-col overflow-y-auto min-w-0">
            
            {/* TOP HEADER */}
            <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0">
              <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm font-medium">
                <span className="text-slate-400 font-bold hidden sm:inline">Indore</span>
                <ChevronRight className="w-4 h-4 text-slate-300 hidden sm:inline" />
                
                {/* Ward Picker Selector Dropdown */}
                <span className="bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full text-slate-700 flex items-center gap-1 cursor-pointer transition-colors relative group">
                  <span className="font-bold">
                    Ward {selectedWardId}: {activeWardObj.name}
                  </span>
                  <select 
                    id="top_ward_selector_select"
                    value={selectedWardId}
                    onChange={(e) => setSelectedWardId(Number(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full"
                  >
                    {wards.map(w => (
                      <option key={w.id} value={w.id}>
                        Ward {w.id}: {w.name}
                      </option>
                    ))}
                  </select>
                </span>
              </div>

              {/* Top info and points display */}
              <div className="flex items-center gap-3 md:gap-6">
                
                {/* Points Pill */}
                <div onClick={() => setActiveTab('profile')} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-indigo-100 transition-all cursor-pointer">
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{user.points} pt</span>
                </div>

                {/* Streak Pill */}
                <div 
                  onClick={triggerCheckIn}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs cursor-pointer transition-all hover:scale-105 ${hasCheckedInToday ? 'bg-emerald-50 text-emerald-700 border-emerald-250' : 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm animate-pulse'}`}
                >
                  <span className="text-sm">🔥</span>
                  <span className="font-bold">{user.streak} Days {hasCheckedInToday ? 'Done' : 'Check-In'}</span>
                </div>

                {/* Mobile Logout trigger */}
                <button 
                  onClick={() => setAuthState('splash')} 
                  title="Logout" 
                  className="text-slate-400 hover:text-red-700 p-1 bg-slate-50 rounded-lg md:hidden"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* MOBILE NAVIGATION BAR (Only visible on small devices) */}
            <div className="flex md:hidden bg-white border-b border-slate-200 px-3 py-1 justify-around text-xs shrink-0">
              <button 
                id="mob_nav_home"
                onClick={() => { setActiveTab('home'); setIsCompareMode(false); }}
                className={`py-2 px-1 flex flex-col items-center gap-0.5 ${activeTab === 'home' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}
              >
                <Map className="w-4 h-4" />
                <span>Home</span>
              </button>
              <button 
                id="mob_nav_analytics"
                onClick={() => { setActiveTab('analytics'); setIsCompareMode(false); }}
                className={`py-2 px-1 flex flex-col items-center gap-0.5 ${activeTab === 'analytics' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Analytics</span>
              </button>
              <button 
                id="mob_nav_candidates"
                onClick={() => { setActiveTab('candidates'); setIsCompareMode(false); }}
                className={`py-2 px-1 flex flex-col items-center gap-0.5 ${activeTab === 'candidates' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}
              >
                <Users className="w-4 h-4" />
                <span>Candidates</span>
              </button>
              <button 
                id="mob_nav_bot"
                onClick={() => { setActiveTab('bot'); setIsCompareMode(false); }}
                className={`py-2 px-1 flex flex-col items-center gap-0.5 ${activeTab === 'bot' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}
              >
                <MessageSquareCode className="w-4 h-4" />
                <span>WardBot</span>
              </button>
              <button 
                id="mob_nav_profile"
                onClick={() => { setActiveTab('profile'); setIsCompareMode(false); }}
                className={`py-2 px-1 flex flex-col items-center gap-0.5 ${activeTab === 'profile' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}
              >
                <UserCircle className="w-4 h-4" />
                <span>Profile</span>
              </button>
            </div>

            {/* MAIN CORE DYNAMIC PAGES CONTAINER */}
            <div className="p-4 md:p-8 flex-1">

              {/* ========================================================= */}
              {/* TAB 1: HOME PAGE DASHBOARD */}
              {/* ========================================================= */}
              {activeTab === 'home' && (
                <div id="tab_home_view" className="space-y-6">
                  
                  {/* Dynamic welcome summary ticker */}
                  <div className="bg-indigo-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative z-10 space-y-1">
                      <div className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                        <span>{getTranslation(lang, 'weeklySummary')}</span>
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight">
                        Ward {selectedWardId}: {activeWardObj.name} Progress Index
                      </h2>
                      <p className="text-indigo-100 text-sm max-w-xl">
                        Cleanliness (Swachhta) indexing registers continuous water pressure complaints near main squares. Political support trends display positive candidate contention.
                      </p>
                    </div>

                    <div className="shrink-0 flex gap-2">
                      <button 
                        id="home_download_report_btn"
                        onClick={() => { setActiveTab('profile'); setShowPdfPreview(true); }}
                        className="bg-white/20 hover:bg-white/30 text-white font-bold py-2.5 px-4 rounded-xl border border-white/20 transition-all text-xs flex items-center gap-2 cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                        <span>{getTranslation(lang, 'downloadReport')}</span>
                      </button>
                      <button 
                        id="home_ask_bot_welcome_btn"
                        onClick={() => setActiveTab('bot')}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all text-xs cursor-pointer"
                      >
                        Interactive Ask
                      </button>
                    </div>
                    {/* Background faint visual shapes */}
                    <div className="absolute right-0 bottom-0 top-0 w-64 bg-indigo-800/20 blur-3xl rounded-full"></div>
                  </div>

                  {/* 3 Metrics Column (From Professional Polish HTML layout structure) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Metric 1 */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase mb-2">VOTER SUPPORT INDEX</div>
                        <div className="text-3xl font-extrabold text-slate-950">
                          {leadingCandidate ? `${leadingCandidate.supportPercent}%` : 'N/A'}
                        </div>
                        <div className="text-xs text-indigo-600 uppercase mt-1.5 font-bold">
                          {leadingCandidate?.name} ({leadingCandidate?.party}) leads
                        </div>
                      </div>
                      <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-2 bg-emerald-50 px-2 py-1 rounded w-fit">
                        <span>↑ {leadingCandidate ? (leadingCandidate.trend[4] - leadingCandidate.trend[0] > 0 ? `+${leadingCandidate.trend[4] - leadingCandidate.trend[0]}` : `-3`) : '+1.4'}% tracking 5w</span>
                      </div>
                    </div>

                    {/* Metric 2 */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase mb-2">CIVIC HARDSHIP TICKETS</div>
                        <div className="text-3xl font-extrabold text-slate-950">
                          {activeWardObj.issues.length} Issues
                        </div>
                        <div className="text-xs text-amber-600 mt-1 px-1 bg-amber-50 rounded w-fit font-bold">
                          {activeWardObj.issues.filter(i=>i.severity==='High').length} High Severity
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-3 font-semibold">
                        {activeWardObj.issues.filter(i=>i.status==='Resolved').length} Resolved and verified this month
                      </div>
                    </div>

                    {/* Metric 3 */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase mb-2">CIVIC SWACHHTA STATUS</div>
                        <div className="text-3xl font-extrabold text-slate-950">89.4 / 100</div>
                        <div className="text-xs text-slate-500 mt-1 font-semibold">
                          Indore Municipal Class Ranking No.1
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-700 font-bold mt-2 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded w-fit">
                        <span>{getTranslation(lang, 'monsoonPrep')}: 8.5/10</span>
                      </div>
                    </div>

                  </div>

                  {/* Split Dashboard Content (P2 and Urgent Grievances) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Grid: Candidates standing inside current ward */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <h3 className="font-extrabold text-slate-900 text-sm">{getTranslation(lang, 'candidatesTab')} Standings</h3>
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Ward {selectedWardId}</span>
                      </div>

                      <div className="space-y-5">
                        {activeCandidateList.map(candidate => (
                          <div key={candidate.id} className="group">
                            <div className="flex items-center gap-3">
                              <img 
                                src={candidate.photoUrl} 
                                alt={candidate.name} 
                                className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-extrabold text-slate-900 truncate flex items-center gap-1.5">
                                  <span>{candidate.name}</span>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                    candidate.party === 'BJP' ? 'bg-orange-100 text-orange-850' :
                                    candidate.party === 'INC' ? 'bg-sky-100 text-sky-850' :
                                    candidate.party === 'AAP' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {candidate.party}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-400 font-medium truncate">
                                  {candidate.bio.substring(0, 35)}...
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-black text-indigo-950 font-mono">
                                  {candidate.supportPercent}%
                                </span>
                              </div>
                            </div>
                            {/* Visual Progress Bar matching theme colors */}
                            <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  candidate.party === 'BJP' ? 'bg-orange-500' :
                                  candidate.party === 'INC' ? 'bg-sky-500' :
                                  candidate.party === 'AAP' ? 'bg-blue-600' : 'bg-slate-400'
                                }`}
                                style={{ width: `${candidate.supportPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2">
                        <button 
                          onClick={() => { setActiveTab('candidates'); setIsCompareMode(true); }}
                          className="w-full py-3 border border-dashed border-slate-300 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-400 text-xs font-bold transition-all text-center cursor-pointer"
                        >
                          {getTranslation(lang, 'headToHead')} View
                        </button>
                      </div>
                    </div>

                    {/* Middle & Right combined (Grievances, upvoting, feedback submitting) */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Civic Issue Registry & Upvoter */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                            <span>{getTranslation(lang, 'topIssuesTitle')}</span>
                            <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                              Live Grievance Monitor
                            </span>
                          </h3>
                        </div>

                        <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1">
                          {activeWardObj.issues.map(issue => (
                            <div key={issue.id} className="p-3 border border-slate-100 rounded-xl flex items-center justify-between gap-3 hover:border-slate-200 transition-all">
                              <div className="flex items-start gap-2 max-w-[70%]">
                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${
                                  issue.severity === 'High' ? 'bg-red-500' :
                                  issue.severity === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                                }`} />
                                <div>
                                  <div className="text-xs font-bold text-slate-900 leading-snug">
                                    {issue.title}
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2 font-semibold">
                                    <span>#{issue.category}</span>
                                    <span>•</span>
                                    <span className={`px-1 rounded ${
                                      issue.status === 'Resolved' ? 'bg-emerald-50 text-emerald-800' :
                                      issue.status === 'In Progress' ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-755'
                                    }`}>
                                      {issue.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <button 
                                onClick={() => upvoteIssue(issue.id)}
                                className="shrink-0 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                              >
                                <ThumbsUp className="w-3.5 h-3.5 text-indigo-600" />
                                <span>{issue.upvotes}</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Unified Verified Voter Feedback Entry Forms */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-extrabold text-slate-900 text-sm mb-3">
                          {getTranslation(lang, 'feedbackTitle')}
                        </h3>
                        
                        <form onSubmit={handleSubmitFeedback} className="space-y-4">
                          <p className="text-xs text-slate-400">
                            {getTranslation(lang, 'enterFeedbackDesc')} (Prefix EPIC number with 'MP' for instant verify indicator).
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{getTranslation(lang, 'enterVoterId')}</label>
                              <input 
                                type="text"
                                value={feedbackVoterId}
                                onChange={(e)=>setFeedbackVoterId(e.target.value)}
                                placeholder={getTranslation(lang, 'voterIdPlaceholder')}
                                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-xs font-semibold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Candidate (Optional)</label>
                              <select 
                                value={selectedCandidateForFeedback}
                                onChange={(e)=>setSelectedCandidateForFeedback(e.target.value)}
                                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-xs font-semibold"
                              >
                                <option value="">General Ward Review</option>
                                {activeCandidateList.map(c => (
                                  <option key={c.id} value={c.id}>{c.name} ({c.party})</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            {(['positive', 'neutral', 'negative'] as const).map(sent => (
                              <button 
                                key={sent}
                                type="button"
                                onClick={() => setSelectedSentiment(sent)}
                                className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                  selectedSentiment === sent 
                                    ? 'bg-indigo-50 border-indigo-600 text-indigo-900' 
                                    : 'bg-white border-slate-200 text-slate-500'
                                }`}
                              >
                                {sent === 'positive' && '😊 Positive'}
                                {sent === 'neutral' && '😐 Neutral'}
                                {sent === 'negative' && '⚠️ Negative'}
                              </button>
                            ))}
                          </div>

                          <div>
                            <textarea 
                              value={feedbackText}
                              onChange={(e)=>setFeedbackText(e.target.value)}
                              rows={2}
                              required
                              placeholder={getTranslation(lang, 'feedbackPlaceholder')}
                              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-xs font-medium"
                            ></textarea>
                          </div>

                          <button 
                            type="submit"
                            className="bg-indigo-650 text-white w-full py-2.5 rounded-xl font-bold text-xs hover:bg-slate-900 transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <UserCheck className="w-4 h-4" />
                            <span>{getTranslation(lang, 'submitFeedback')}</span>
                          </button>
                        </form>
                      </div>

                    </div>
                  </div>

                </div>
              )}


              {/* ========================================================= */}
              {/* TAB 2: ANALYTICS HUB & INTERACTIVE STATS */}
              {/* ========================================================= */}
              {activeTab === 'analytics' && (
                <div id="tab_analytics_view" className="space-y-6">
                  
                  {/* Heatmap header */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">
                          {getTranslation(lang, 'sentimentHeatmap')} (Wards 1–85)
                        </h2>
                        <p className="subtitle text-xs text-slate-500 mt-1">
                          Click any ward from the list below to dynamically swap statistics, local public grievances, and AI bot scope.
                        </p>
                      </div>
                      
                      {/* Interactive toggle indicators */}
                      <div className="flex gap-2 text-xs font-bold">
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-850">● BJP Lead</span>
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-100 text-sky-850">● INC Lead</span>
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">● Ind/AAP</span>
                      </div>
                    </div>

                    {/* Indore Ward 85-cell Heatmap Grid list */}
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 lg:grid-cols-12 gap-2 max-h-[280px] overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-150">
                      {Array.from({ length: 85 }, (_, i) => {
                        const wNum = i + 1;
                        const isSelected = selectedWardId === wNum;
                        // Determine majority color representation
                        const colorHash = (wNum * 7) % 3; // Mock leading color patterns
                        const bgClass = isSelected ? 'ring-4 ring-indigo-600 ring-offset-2' : '';
                        const partyColor = colorHash === 0 ? 'bg-orange-500/10 border-orange-200 text-orange-900 hover:bg-orange-500/20' : 
                                           colorHash === 1 ? 'bg-sky-500/10 border-sky-200 text-sky-900 hover:bg-sky-500/20' : 
                                           'bg-slate-100 border-slate-2 py-0 text-slate-800 hover:bg-slate-200';

                        return (
                          <button
                            key={wNum}
                            onClick={() => setSelectedWardId(wNum)}
                            title={getWardName(wNum)}
                            className={`p-3 border rounded-xl text-center text-xs font-black transition-all cursor-pointer flex flex-col items-center justify-center ${bgClass} ${partyColor}`}
                          >
                            <span className="text-sm font-black tracking-tight">{wNum}</span>
                            <span className="text-[9px] font-bold opacity-70 tracking-tighter">Wrd</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 7 Days Sentiment Chart (Visual Graph recreated directly from the specification layout) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* SVG Line Chart View */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="font-bold text-slate-800">Political Sentiment Swing (7-Day Metric Index)</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">Verified public feedback scanner tracking Ward {selectedWardId}</p>
                        </div>
                        <div className="flex gap-1">
                          <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold">Local Feedback Sentiment</span>
                        </div>
                      </div>

                      {/* Line chart visualization */}
                      <div className="h-64 relative flex items-end justify-between pb-8">
                        {/* Horizontal background lines */}
                        <div className="absolute top-0 bottom-8 left-0 right-0 flex flex-col justify-between pointer-events-none opacity-50">
                          <div className="border-b border-dashed border-slate-100 w-full h-0"></div>
                          <div className="border-b border-dashed border-slate-150 w-full h-0"></div>
                          <div className="border-b border-dashed border-slate-200 w-full h-0"></div>
                          <div className="border-b border-dashed border-slate-150 w-full h-0"></div>
                        </div>

                        {/* Interactive Bars representing trend points block */}
                        {[45, 52, 59, 72, 65, 87, 78].map((score, idx) => {
                          const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end z-10">
                              {/* Overlay Indicator */}
                              <div className="absolute -top-7 text-[10px] font-bold bg-slate-900 text-white py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                {score}% Support
                              </div>
                              <div className="text-[10px] font-bold text-slate-400 mb-1">{score}%</div>
                              
                              {/* Dynamic Fill bar utilizing main colors */}
                              <div 
                                className="w-8 bg-indigo-600 rounded-t-lg group-hover:bg-indigo-700 transition-all cursor-pointer relative"
                                style={{ height: `${(score / 100) * 160}px` }}
                              >
                                <div className="absolute inset-x-0 top-0 h-2 bg-white/20 rounded-t-lg"></div>
                              </div>
                              <span className="text-[10px] font-black text-slate-400 mt-2 uppercase">{days[idx]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Compare candidate helper */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                      <h3 className="font-extrabold text-slate-900 text-base">Quick Head-to-Head Setup</h3>
                      <p className="text-xs text-slate-400">
                        Pick candidates from Ward {selectedWardId} to inspect demographic projections & matching support parameters.
                      </p>

                      <div className="space-y-2 mt-2">
                        {activeCandidateList.map(c => {
                          const isComparing = compareCandidateIds.includes(c.id);
                          return (
                            <button
                              key={c.id}
                              onClick={() => {
                                if (isComparing) {
                                  setCompareCandidateIds(prev => prev.filter(id => id !== c.id));
                                } else {
                                  setCompareCandidateIds(prev => [...prev, c.id]);
                                }
                              }}
                              className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                                isComparing 
                                  ? 'bg-indigo-50 border-indigo-600 text-indigo-900' 
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <img src={c.photoUrl} alt={c.name} className="w-6 h-6 rounded-full" />
                                <div>
                                  <div>{c.name}</div>
                                  <div className="text-[10px] text-slate-400">{c.party}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-mono">{c.supportPercent}%</span>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isComparing ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                                  {isComparing && <Check className="w-3 h-3" />}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {compareCandidateIds.length >= 2 ? (
                        <div className="space-y-3 pt-2">
                          <div className="bg-indigo-50 rounded-xl p-3 text-xs text-indigo-900 space-y-2">
                            <div className="font-extrabold text-center uppercase tracking-wider text-[10px] text-indigo-700">Projected Margin Difference</div>
                            {/* Projections math */}
                            <div className="flex justify-between font-black">
                              <span>BJP / INC Comparison:</span>
                              <span className="text-indigo-950 font-mono">
                                {Math.abs(activeCandidateList[0].supportPercent - activeCandidateList[1].supportPercent)}% Gap
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-tight">
                              AI metrics suggest highest campaign activity in residential sectors. Sewer gridlocks are the key swing vote reason.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-center text-slate-400 italic py-6">
                          Select at least 2 candidates to trigger head-to-head projection calculations.
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              )}


              {/* ========================================================= */}
              {/* TAB 3: CANDIDATE CATALOG STAND */}
              {/* ========================================================= */}
              {activeTab === 'candidates' && (
                <div id="tab_candidates_view" className="space-y-6">
                  
                  {/* SEARCH AND FILTERS */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-80">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        placeholder="Search candidate name or ward..."
                        value={candidateSearchQuery}
                        onChange={(e)=>setCandidateSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                      <span className="text-xs text-slate-400 font-bold whitespace-nowrap">Filter party:</span>
                      {(['All', 'BJP', 'INC', 'AAP', 'IND'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => setSelectedPartyFilter(p)}
                          className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            selectedPartyFilter === p 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* HIGH-FIDELITY CANDIDATE LIST GRIDS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allScreenCandidatesFiltered.slice(0, 24).map(candidate => {
                      const isComparing = compareCandidateIds.includes(candidate.id);
                      return (
                        <div key={candidate.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                          
                          {/* Card Header with Seed logo background */}
                          <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-5 flex items-start gap-3 border-b border-slate-100">
                            <img 
                              src={candidate.photoUrl} 
                              alt={candidate.name} 
                              className="w-12 h-12 rounded-full border border-slate-200 bg-white"
                            />
                            <div className="min-w-0">
                              <h3 className="text-sm font-extrabold text-slate-900 truncate">
                                {candidate.name}
                              </h3>
                              <div className="text-[10px] text-slate-400 font-semibold truncate">
                                Candidate for Ward {candidate.wardId} ({getWardName(candidate.wardId)})
                              </div>
                              
                              <span className={`inline-block text-[9px] font-black uppercase mt-1 px-2 py-0.5 rounded ${
                                candidate.party === 'BJP' ? 'bg-orange-50 text-orange-850 border border-orange-200' :
                                candidate.party === 'INC' ? 'bg-sky-50 text-sky-850 border border-sky-200' :
                                candidate.party === 'AAP' ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-slate-50 text-slate-700 border border-slate-200'
                              }`}>
                                {candidate.party}
                              </span>
                            </div>
                          </div>

                          {/* Card Body parameters */}
                          <div className="p-5 space-y-4 flex-1">
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                              {candidate.bio}
                            </p>

                            <div className="flex items-center justify-between pt-2">
                              <span className="text-xs font-bold text-slate-400">SUPPORT SHARE %</span>
                              <span className="text-lg font-black text-indigo-950 font-mono">
                                {candidate.supportPercent}%
                              </span>
                            </div>

                            {/* Sparkline line generator simulator using mini lines */}
                            <div className="space-y-1">
                              <div className="text-[10px] text-slate-400 font-extrabold">5-WEEK CAMPAIGN SWINGS</div>
                              <div className="flex items-end gap-1 h-8 pt-1 bg-slate-50 rounded-lg px-2">
                                {candidate.trend.map((val, tIdx) => (
                                  <div 
                                    key={tIdx} 
                                    title={`Week ${tIdx+1}: ${val}%`}
                                    className="flex-1 bg-indigo-500 rounded-t"
                                    style={{ height: `${(val / 100) * 24}px` }}
                                  ></div>
                                ))}
                              </div>
                            </div>

                            {/* Comments Box */}
                            <div className="space-y-2 pt-2 border-t border-slate-100">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                                Verified Feedback Sentiment
                              </div>
                              {candidate.comments.map((comment, cIdx) => (
                                <div key={cIdx} className="bg-slate-50 rounded-lg p-2 text-[10px] leading-relaxed">
                                  <div className="flex justify-between font-bold text-slate-600 mb-0.5">
                                    <span>{comment.authorName}</span>
                                    <span className={comment.sentiment === 'positive' ? 'text-emerald-600' : 'text-red-500'}>
                                      {comment.sentiment.toUpperCase()}
                                    </span>
                                  </div>
                                  <p className="text-slate-500 italic">"{comment.text}"</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Action Compare check */}
                          <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                            <button
                              onClick={() => {
                                if (isComparing) {
                                  setCompareCandidateIds(prev => prev.filter(id => id !== candidate.id));
                                } else {
                                  setCompareCandidateIds(prev => [...prev, candidate.id]);
                                }
                              }}
                              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                                isComparing 
                                  ? 'bg-indigo-600 border-indigo-650 text-white' 
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {isComparing ? '✓ Compare Selection' : 'Add to Compare'}
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedWardId(candidate.wardId);
                                setActiveTab('bot');
                                sendAiQuery(`How does candidate ${candidate.name} stand to resolve issues in Ward ${candidate.wardId}?`);
                              }}
                              className="bg-indigo-900 text-white rounded-xl p-2 hover:bg-slate-900 transition-all cursor-pointer"
                              title="Engage WardBot AI about this candidate"
                            >
                              <MessageSquareCode className="w-4 h-4" />
                            </button>
                          </div>

                        </div>
                      );
                    })}

                    {allScreenCandidatesFiltered.length === 0 && (
                      <div className="col-span-full py-12 text-center text-slate-400">
                        No candidates found corresponding to details inputted.
                      </div>
                    )}
                  </div>

                </div>
              )}


              {/* ========================================================= */}
              {/* TAB 4: WARDBOT AI PLATFORM WORKSPACE */}
              {/* ========================================================= */}
              {activeTab === 'bot' && (
                <div id="tab_assistant_view" className="flex flex-col h-[540px] bg-white rounded-2xl border border-slate-200">
                  
                  {/* Chat Assistant Header */}
                  <div className="p-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-900 rounded-xl flex items-center justify-center text-white">
                        <Building2 className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                          {getTranslation(lang, 'aiChatTitle')}
                        </h3>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                          <span>In-Context: Indore Ward {selectedWardId} (Vijay Nagar) stand</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* TTS Toggler */}
                      <button 
                        onClick={() => setTtsEnabled(!ttsEnabled)}
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${ttsEnabled ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white text-slate-400 border-slate-200'}`}
                        title={ttsEnabled ? 'Mute AI text-to-speech feedback' : 'Enable AI text-to-speech speaker rendering'}
                      >
                        {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </button>

                      {/* Info */}
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-1 rounded">
                        gemini-1.5-flash
                      </span>
                    </div>
                  </div>

                  {/* Messages container list */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
                    {chatHistory.map((chat, idx) => (
                      <div 
                        key={idx}
                        className={`flex gap-3 max-w-[85%] ${chat.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold leading-none ${chat.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-indigo-900 text-white'}`}>
                          {chat.sender === 'user' ? 'ME' : '🤖'}
                        </div>
                        <div className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                          chat.sender === 'user' 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-white text-slate-800 border border-slate-205 rounded-tl-none shadow-sm'
                        }`}>
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {chat.text}
                          </p>
                          <span className="block text-[9px] opacity-60 text-right mt-1">
                            {chat.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}

                    {isAiLoading && (
                      <div className="flex gap-3 max-w-[80%]">
                        <div className="w-8 h-8 rounded-full bg-indigo-900 text-white flex items-center justify-center text-xs font-bold">
                          🤖
                        </div>
                        <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                          <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></span>
                          <span className="w-2 h-2 bg-indigo-650 rounded-full animate-bounce delay-100"></span>
                          <span className="w-2 h-2 bg-indigo-700 rounded-full animate-bounce delay-200"></span>
                          <span className="text-xs text-slate-400 font-bold ml-1">Scanning localized public datasets...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Sample Query Suggesters */}
                  <div className="p-3 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto shrink-0 select-none">
                    <button 
                      onClick={() => setAiInput(`Ward ${selectedWardId} ka sentiment feedback kya chal raha hai?`)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer"
                    >
                      "Ward {selectedWardId} ka sentiment check karein"
                    </button>
                    <button 
                      onClick={() => setAiInput(`Kaun aage hai BJP ya Congress is ward me?`)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer"
                    >
                      "Kaun aage hai?"
                    </button>
                    <button 
                      onClick={() => setAiInput(`Pending water issues status update`)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer"
                    >
                      "Civic complaints overview"
                    </button>
                  </div>

                  {/* Input form */}
                  <form 
                    onSubmit={(e) => { e.preventDefault(); sendAiQuery(aiInput); }}
                    className="p-3 border-t border-slate-200 bg-white rounded-b-2xl flex items-center gap-2"
                  >
                    <input 
                      type="text"
                      id="ai_chat_textbox"
                      placeholder="Ask WardBot AI in Hindi, English, Hinglish..."
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-bold"
                    />

                    {/* Microphone Audio/TTS simulator tool */}
                    <button 
                      type="button"
                      onClick={toggleVoiceInput}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${voiceActive ? 'bg-red-550 border-red-200 text-white animate-pulse' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'}`}
                      title="Trigger Voice Microphone Feed Simulator"
                    >
                      <Mic className="w-4 h-4" />
                    </button>

                    <button 
                      type="submit"
                      id="ai_submit_btn"
                      className="bg-indigo-650 text-white font-bold py-2.5 px-5 rounded-xl text-xs hover:bg-slate-900 transition-all cursor-pointer"
                    >
                      Send Message
                    </button>
                  </form>

                </div>
              )}


              {/* ========================================================= */}
              {/* TAB 5: VOTER PROFILE & PDF GENERATION SYSTEMS */}
              {/* ========================================================= */}
              {activeTab === 'profile' && (
                <div id="tab_profile_view" className="space-y-6">
                  
                  {/* Account overview bar */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-16 h-16 bg-indigo-600/10 text-indigo-700 rounded-full flex items-center justify-center text-3xl font-black">
                        T
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold text-slate-900">
                          {user.name}
                        </h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                          Verified Voter • Sector {selectedWardId} (Indore Central Boundary)
                        </p>
                        
                        {/* Interactive Epic tag */}
                        <div className="mt-1 flex items-center gap-1">
                          <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 py-0.5 px-2 rounded-full font-bold">
                            EPIC NOTARISED: Verified
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex gap-4 text-center">
                      <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 w-24">
                        <div className="text-[10px] text-indigo-500 font-bold uppercase">POINTS</div>
                        <div className="text-xl font-black text-indigo-950 font-mono">{user.points}</div>
                      </div>

                      <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 w-24 animate-pulse">
                        <div className="text-[10px] text-amber-500 font-bold uppercase">STREAK</div>
                        <div className="text-xl font-black text-amber-950 font-mono">{user.streak} Days</div>
                      </div>
                    </div>
                  </div>

                  {/* Leaderboards Standings block (Indore wide ranks & local Wards check) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Ward Leaderboard Standings list */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="pb-3 border-b border-slate-100 mb-4 flex justify-between items-center">
                        <h3 className="font-extrabold text-slate-900 text-sm">
                          {getTranslation(lang, 'leaderboardWard')} (Vijay Nagar Node)
                        </h3>
                        <span className="text-[10px] text-indigo-650 bg-indigo-55 rounded font-bold px-2 py-0.5">Top Contributors</span>
                      </div>

                      <div className="space-y-3">
                        {LEADERBOARD_WARD_DATA.map((entry, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-slate-400 w-4">#{idx + 1}</span>
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">
                                {entry.userName[0]}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-800">{entry.userName}</div>
                                <div className="text-[10px] text-slate-400">Ward {entry.wardId}</div>
                              </div>
                            </div>
                            <span className="text-xs font-black text-indigo-950 font-mono">{entry.points} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* City leaderboard standings list */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="pb-3 border-b border-slate-100 mb-4 flex justify-between items-center">
                        <h3 className="font-extrabold text-slate-900 text-sm">
                          {getTranslation(lang, 'leaderboardCity')} (85 Wards)
                        </h3>
                        <span className="text-[10px] text-emerald-650 bg-emerald-55 rounded font-bold px-2 py-0.5">Champions</span>
                      </div>

                      <div className="space-y-3">
                        {LEADERBOARD_CITY_DATA.map((entry, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-slate-400 w-4">#{idx + 1}</span>
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">
                                {entry.userName[0]}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-800">{entry.userName}</div>
                                <div className="text-[10px] text-slate-400">Ward {entry.wardId}</div>
                              </div>
                            </div>
                            <span className="text-xs font-black text-indigo-950 font-mono">{entry.points} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* UNLOCKED BADGES */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-extrabold text-slate-900 text-sm mb-4">Gained Swachh Social Badges</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      
                      {/* Badge 1 */}
                      <div className={`p-4 rounded-xl border text-center space-y-2 ${user.badges.includes("Verified Voter") ? 'bg-indigo-50/50 border-indigo-200 text-indigo-900' : 'bg-slate-100/50 border-slate-200 text-slate-400 opacity-50'}`}>
                        <div className="text-2xl">🗳️</div>
                        <div className="text-xs font-bold leading-tight">Verified Voter</div>
                        <p className="text-[9px] text-slate-400">Linked standard Voter ID authentication card.</p>
                      </div>

                      {/* Badge 2 */}
                      <div className={`p-4 rounded-xl border text-center space-y-2 ${user.badges.includes("7-Day Streak") ? 'bg-indigo-50/50 border-indigo-200 text-indigo-900' : 'bg-slate-100/50 border-slate-200 text-slate-400 opacity-50'}`}>
                        <div className="text-2xl">🔥</div>
                        <div className="text-xs font-bold leading-tight">7-Day Streak</div>
                        <p className="text-[9px] text-slate-400">Logged in 7 consecutive days for civic monitoring.</p>
                      </div>

                      {/* Badge 3 */}
                      <div className={`p-4 rounded-xl border text-center space-y-2 ${user.badges.includes("Feedback Champion") ? 'bg-indigo-50/50 border-indigo-200 text-indigo-900' : 'bg-slate-100/50 border-slate-200 text-slate-400 opacity-50'}`}>
                        <div className="text-2xl">✍️</div>
                        <div className="text-xs font-bold leading-tight">Feedback Champion</div>
                        <p className="text-[9px] text-slate-400">Submitted verified civic opinions to AI scanning pipelines.</p>
                      </div>

                      {/* Badge 4 */}
                      <div className={`p-4 rounded-xl border text-center space-y-2 ${user.badges.includes("Top Contributor") ? 'bg-indigo-50/50 border-indigo-200 text-indigo-900' : 'bg-slate-100/50 border-slate-200 text-slate-400 opacity-50'}`}>
                        <div className="text-2xl">⭐</div>
                        <div className="text-xs font-bold leading-tight">Social Leader</div>
                        <p className="text-[9px] text-slate-400">Earned over 300 points tracking local polls activity.</p>
                      </div>

                    </div>
                  </div>

                  {/* PDF ANALYSIS PROFILE GENERATOR (P3 requirements) */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">{getTranslation(lang, 'downloadReport')}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Generates premium analytical brief of political swing patterns and pending public complaints.</p>
                      </div>

                      {/* Date Filter selector */}
                      <div className="flex gap-2">
                        <select 
                          value={reportDateRange}
                          onChange={(e)=>setReportDateRange(e.target.value)}
                          className="py-1.5 px-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 focus:outline outline-indigo-500"
                        >
                          <option value="May 2026">May 2026 Brief (Current)</option>
                          <option value="April 2026">April 2026 Brief</option>
                          <option value="Q1 2026">Q1 2026 Consolidated</option>
                        </select>
                        <button 
                          onClick={() => setShowPdfPreview(!showPdfPreview)} 
                          className="bg-slate-100 hover:bg-slate-200 py-1.5 px-4 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
                        >
                          {showPdfPreview ? 'Hide Preview' : 'Preview Document'}
                        </button>
                      </div>
                    </div>

                    {showPdfPreview && (
                      <div className="mt-4 p-6 border-2 border-indigo-100 rounded-2xl bg-slate-50 relative space-y-4 print:border-none print:bg-white">
                        <div className="flex justify-between items-center border-b pb-3 border-indigo-200">
                          <div>
                            <h4 className="text-md font-extrabold text-indigo-950 uppercase tracking-wide">
                              WARD PROGRESS PROFILE INTEL REPORT
                            </h4>
                            <span className="text-[10px] text-slate-400 font-bold block">
                              Indore Elections Master Grid System • Compiled {reportDateRange}
                            </span>
                          </div>
                          <span className="text-xs bg-indigo-600 text-white font-black py-1 px-3 rounded">
                            CONFIDENTIAL BRIEFING
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                          <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-400 block font-bold">WARD FOCUS</span>
                            <span className="font-extrabold text-slate-900 text-sm">Ward {selectedWardId}: {activeWardObj.name}</span>
                            <p className="text-slate-500 leading-snug">
                              Total monitored voter pool represents a dynamic population index of {activeWardObj.population} inhabitants.
                            </p>
                          </div>
                          
                          <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-400 block font-bold">COMPLIANCE STATS</span>
                            <div className="font-extrabold text-slate-900 text-sm">Active Hardship: {activeWardObj.issues.length} Issues</div>
                            <p className="text-slate-500 leading-snug">
                              Key concerns centre extensively on water pressure, potholes on main square links, and student neighborhood streetlights status.
                            </p>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                          <span className="text-[10px] text-indigo-700 block font-bold uppercase tracking-widest">
                            AI GENERATIVE SENTIMENT PREDICTION & HEAD-TO-HEAD SNAPSHOT
                          </span>
                          <p className="text-xs text-slate-755 leading-relaxed">
                            BJP is predicted to hold {leadingCandidate ? leadingCandidate.supportPercent : 42}% margin. Public sentiment indices indicate voter focus leans towards water supply reliability and localized park security enhancement. Candidate {leadingCandidate ? leadingCandidate.name : 'Ramesh Patel'} displays high accessibility on WhatsApp channels during monsoons.
                          </p>
                        </div>

                        <div className="pt-4 flex justify-end">
                          <button 
                            onClick={handlePrintPdfDownload}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2.5 px-5 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            <span>{downloadingPdf ? 'Compiling PDF File...' : 'Trigger Print Document'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>
          </main>

        </div>
      )}

      {/* --- SITE FOOTER INFO DESCRIPTIONS (Not-Tech-Larp, professional credit) --- */}
      <footer className="py-4 bg-white border-t border-slate-250 text-center text-[10px] text-slate-400 shrink-0 font-medium">
        <p>© 2026 Indore Municipal Corporation. Dynamic Political Analytics Pro — All Rights Reserved.</p>
      </footer>

    </div>
  );
}
