import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { api, post } from './api';
import DialogAccessibility from './components/DialogAccessibility';
import VerificationPending from './components/VerificationPending';
import { availableBatches, currentYear } from './utils/academic';
import { 
  User, 
  Opportunity, 
  KYCSubmission, 
  NotificationItem,
  StudentApplication,
  DriveEvent,
  ApplicationStatus
} from './types';
import { getDeadlineInfo } from './utils/dateUtils';
import Navbar from './components/Navbar';
import UrgentBanner from './components/UrgentBanner';
import OpportunityFeed from './components/OpportunityFeed';
import PostOpportunityModal from './components/PostOpportunityModal';
import AIChatBotModal from './components/AIChatBotModal';
import AuthModal from './components/AuthModal';
import AdminKYCPanel from './components/AdminKYCPanel';
import AdminAccountsReview from './components/AdminAccountsReview';
import BookmarksDrawer from './components/BookmarksDrawer';
import WelcomeScreen from './components/WelcomeScreen';
import ApplicationsTrackerModal from './components/ApplicationsTrackerModal';
import ResumeMatchModal from './components/ResumeMatchModal';
import DriveScheduleModal from './components/DriveScheduleModal';
import { 
  Sparkles, 
  GraduationCap, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Briefcase, 
  Award, 
  PlusCircle, 
  Flame,
  Bot,
  Ban,
  Info,
  X,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  // All Users in the system
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  // New User initial state: starts at Welcome & Sign Up screen
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Main Opportunities State
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  
  // Saved Bookmarks
  const [savedOppIds, setSavedOppIds] = useState<string[]>([]);

  // Admin KYC submissions queue
  const [kycSubmissions, setKycSubmissions] = useState<KYCSubmission[]>([]);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals & Drawers
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [isAiBotOpen, setIsAiBotOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isKycPanelOpen, setIsKycPanelOpen] = useState(false);
  const [showAlumniPolicyModal, setShowAlumniPolicyModal] = useState(false);
  const [testYear, setTestYear] = useState<number>(currentYear);

  // Student Applications Pipeline State
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

  // Campus Placement Drive Events & Timeline State
  const [driveEvents, setDriveEvents] = useState<DriveEvent[]>([]);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // AI Resume Match evaluation modal state
  const [resumeMatchOpportunity, setResumeMatchOpportunity] = useState<Opportunity | null>(null);

  // Urgent opportunities count (< 24 hours)
  const urgentCount = useMemo(() => {
    return opportunities.filter((o) => {
      const info = getDeadlineInfo(o.deadline);
      return !info.isExpired && info.isUrgent24h;
    }).length;
  }, [opportunities]);

  // Controlled Opportunity Feed filters (supports quick 4-card navigation)
  const [feedCategory, setFeedCategory] = useState<string>('all');
  const [feedSortBy, setFeedSortBy] = useState<'newest' | 'trending' | 'expiring' | 'stipend'>('newest');
  const [feedUrgentOnly, setFeedUrgentOnly] = useState<boolean>(false);

  const scrollToFeed = () => {
    document.getElementById('opportunities-feed')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNavActiveDrives = () => {
    setFeedCategory('all');
    setFeedUrgentOnly(false);
    setFeedSortBy('newest');
    scrollToFeed();
  };

  const handleNavUrgent = () => {
    setFeedUrgentOnly(true);
    scrollToFeed();
  };

  const handleNavInternships = () => {
    setFeedCategory('internship');
    setFeedUrgentOnly(false);
    scrollToFeed();
  };

  const handleNavTrending = () => {
    setFeedUrgentOnly(false);
    setFeedSortBy('trending');
    scrollToFeed();
  };

  // Pending KYC submissions for Admin badge
  const pendingKycCount = useMemo(() => {
    return kycSubmissions.filter((k) => k.status === 'pending').length;
  }, [kycSubmissions]);

  // Saved Opportunities full objects
  const savedOpportunities = useMemo(() => {
    return opportunities.filter((o) => savedOppIds.includes(o.id));
  }, [opportunities, savedOppIds]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sampleData, setSampleData] = useState(false);
  const refreshVersion = useRef(0);
  const refresh = useCallback(async () => {
    const version = ++refreshVersion.current;
    try {
      const state = await api('/state');
      if (version !== refreshVersion.current) return;
      setCurrentUser(state.currentUser); setAllUsers(state.allUsers);
      setOpportunities(state.opportunities); setApplications(state.applications);
      setDriveEvents(state.driveEvents); setKycSubmissions(state.kycSubmissions);
      setNotifications(state.notifications); setSavedOppIds(state.savedOppIds);
      setSampleData(state.config.sampleData);
    } catch (e: any) {
      if (version !== refreshVersion.current) return;
      if (e.status === 401) { setCurrentUser(null); setOpportunities([]); setApplications([]); setSavedOppIds([]); setNotifications([]); setAllUsers([]); setDriveEvents([]); setKycSubmissions([]); }
      else throw e;
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh().catch(e => setError(e.message)); const timer = setInterval(() => refresh().catch(e => setError(e.message)), 15000); return () => clearInterval(timer); }, [refresh]);
  // Recompute deadline-derived counts and labels every minute.
  const [, tick] = useState(0);
  useEffect(() => { const timer = setInterval(() => { tick(t => t + 1); setOpportunities(o => [...o]); }, 60000); return () => clearInterval(timer); }, []);
  const mutate = async (path: string, body: any = {}, method = 'POST') => {
    try { setError(''); const r = await api(path, {method,body: JSON.stringify(body)}); await refresh(); return r; }
    catch (e: any) { setError(e.message); throw e; }
  };
  const perform = (path: string, body: any = {}, method = 'POST') => { void mutate(path,body,method).catch(() => {}); };
  const handleToggleLike = (id: string) => perform(`/opportunities/${id}/like`);
  const handleToggleSave = (id: string) => perform(`/opportunities/${id}/bookmark`);
  const handleSaveOpportunity = async (data: Partial<Opportunity>) => {
    await mutate(editingOpportunity ? `/opportunities/${editingOpportunity.id}` : '/opportunities', data, editingOpportunity ? 'PATCH' : 'POST');
    setEditingOpportunity(null);
  };
  const handleDeleteOpportunity = (id: string) => perform(`/opportunities/${id}`, {}, 'DELETE');
  const handleTogglePin = (id: string) => perform(`/opportunities/${id}/pin`);
  const handleToggleVerify = (id: string) => perform(`/opportunities/${id}/verify`);
  const handleAddComment = (id: string, text: string) => perform(`/opportunities/${id}/comment`, {text});
  const decision = (id: string,status: string) => { const k = kycSubmissions.find(k => k.id === id); if(k?.userId) perform(`/users/${k.userId}/decision`,{status}); };
  const handleApproveKyc = (id: string) => decision(id,'approved');
  const handleRejectKyc = (id: string) => decision(id,'rejected');
  const handleRegisterStudentKyc = (_submission: KYCSubmission) => { void refresh(); };
  // Account impersonation is intentionally removed; admins review accounts without switching identity.
  const handleSwitchUser = (_user: User) => {};
  const handleMarkAllNotificationsRead = () => perform('/notifications/read');
  const myApplicationsCount = applications.length;
  const handleUpdateApplicationStatus = (id: string,status: ApplicationStatus,notes?: string,nextStepDate?: string) => perform(`/applications/${id}`,{status,notes,nextStepDate},'PATCH');
  const handleDeleteApplication = (id: string) => { if(window.confirm('Remove this application tracking record?')) perform(`/applications/${id}`,{},'DELETE'); };
  const handleMarkApplied = (opp: Opportunity) => { void mutate('/applications',{opportunityId:opp.id}).then(() => setIsTrackerOpen(true)).catch(() => {}); };
  const logout = async () => { try { await post('/auth/logout'); setIsPostModalOpen(false); setIsAuthModalOpen(false); setIsAiBotOpen(false); setIsTrackerOpen(false); setIsKycPanelOpen(false); setIsScheduleOpen(false); setIsBookmarksOpen(false); setResumeMatchOpportunity(null); await refresh(); } catch(e:any) {setError(e.message);} };
  const selectOpportunity = (id: string) => { const o = opportunities.find(o => o.id === id); if(o) {setIsAiBotOpen(false);setIsScheduleOpen(false);setIsTrackerOpen(false);setResumeMatchOpportunity(o);} else setError('This opportunity is no longer available.'); };

  if (loading) return <main className="p-10 text-center">Loading Campus Connect…</main>;
  // If no user is logged in, show Campus Connect AI Welcome & Sign Up Screen
  if (!currentUser) {
    return (
      <>{error && <p role="alert" className="bg-rose-50 text-rose-800 p-3">{error}</p>}<WelcomeScreen
        onLoginSuccess={() => { void refresh().catch(e => setError(e.message)); }}
        onRegisterStudentKyc={handleRegisterStudentKyc}
      /></>
    );
  }

  if (!currentUser.isVerified || currentUser.verificationStatus !== 'approved') return <><VerificationPending user={currentUser} submissions={kycSubmissions} refresh={refresh} logout={logout}/>{error && <p role="alert" className="p-4 text-rose-700">{error}</p>}</>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      
      <DialogAccessibility handlers={{post:()=>setIsPostModalOpen(false),auth:()=>setIsAuthModalOpen(false),chat:()=>setIsAiBotOpen(false),kyc:()=>setIsKycPanelOpen(false),bookmarks:()=>setIsBookmarksOpen(false),policy:()=>setShowAlumniPolicyModal(false),tracker:()=>setIsTrackerOpen(false),resume:()=>setResumeMatchOpportunity(null),schedule:()=>setIsScheduleOpen(false)}}/>
      {error && <div role="alert" className="sticky top-0 z-[100] bg-rose-50 text-rose-800 p-3 flex justify-between">{error}<button aria-label="Dismiss error" onClick={()=>setError('')}>✕</button></div>}
      {currentUser.role === 'admin' && (
        <AdminAccountsReview
          users={allUsers}
          onDecision={(userId, status) => perform(`/users/${userId}/decision`, { status })}
          onDeleteUser={(userId) => perform(`/users/${userId}`, {}, 'DELETE')}
          onOpenKycPanel={() => setIsKycPanelOpen(true)}
        />
      )}
      {/* 24-Hour Expiry Alert Top Banner */}
      <UrgentBanner
        opportunities={opportunities}
        onSelectOpportunity={(opp) => selectOpportunity(opp.id)}
        onOpenAiBot={() => setIsAiBotOpen(true)}
      />

      {/* Main Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        allUsers={allUsers}
        onSwitchUser={handleSwitchUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={logout}
        onOpenPostModal={() => {
          setEditingOpportunity(null);
          setIsPostModalOpen(true);
        }}
        onOpenAiBot={() => setIsAiBotOpen(true)}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenKycPanel={() => setIsKycPanelOpen(true)}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onOpenSchedule={() => setIsScheduleOpen(true)}
        applicationsCount={myApplicationsCount}
        pendingKycCount={pendingKycCount}
        savedOppCount={savedOppIds.length}
        urgentDeadlineCount={urgentCount}
        notifications={notifications}
        onNotificationClick={(notif) => { perform('/notifications/read',{id:notif.id}); if(notif.opportunityId) selectOpportunity(notif.opportunityId); else if(notif.type === 'kyc_status') setIsKycPanelOpen(currentUser.role === 'admin'); }}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
      />

      {/* Hero Welcome & Live Stats Section */}
      <section className="bg-white border-b border-slate-200/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Greeting & Subtitle */}
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="btn-graduating-students-status"
                  onClick={handleNavActiveDrives}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 group"
                  title="Click to view all active opportunities for currently enrolled graduating batches"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span>Currently Graduating Students Only (All Enrolled Batches)</span>
                  <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-bold px-1.5 py-0.5 rounded-full">
                    Active
                  </span>
                </button>

                <button
                  id="btn-alumni-blocked-policy"
                  onClick={() => setShowAlumniPolicyModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 group"
                  title="Click to view strict campus alumni blocking policy and batch rules"
                >
                  <Ban className="w-3.5 h-3.5 text-rose-600 group-hover:rotate-12 transition-transform" />
                  <span>Alumni Blocked</span>
                  <Info className="w-3 h-3 text-rose-500 opacity-70 group-hover:opacity-100" />
                </button>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Welcome to Campus Connect AI, {currentUser.name.split(' ')[0]} 👋
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                Campus portal for verified graduating students to discover off-campus internships, on-campus job drives, free certification vouchers, and peer interview roadmaps.
              </p>
            </div>

            {/* Live Interactive Navigation Cards for 4 Key Views */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
              
              {/* 1. Active Drives */}
              <button
                id="nav-card-active-drives"
                onClick={handleNavActiveDrives}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5 group ${
                  feedCategory === 'all' && !feedUrgentOnly && feedSortBy === 'newest'
                    ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/20'
                    : 'bg-slate-50 hover:bg-white text-slate-900 border-slate-200/80'
                }`}
                title="Click to view all active campus drives"
              >
                <span className={`text-xl font-extrabold block group-hover:scale-105 transition-transform ${
                  feedCategory === 'all' && !feedUrgentOnly && feedSortBy === 'newest' ? 'text-white' : 'text-slate-900'
                }`}>
                  {opportunities.filter(o => !getDeadlineInfo(o.deadline).isExpired).length}
                </span>
                <span className={`text-2xs font-semibold uppercase tracking-wider ${
                  feedCategory === 'all' && !feedUrgentOnly && feedSortBy === 'newest' ? 'text-slate-300' : 'text-slate-500'
                }`}>
                  Active Drives ↗
                </span>
              </button>

              {/* 2. < 24h Left Urgent */}
              <button
                id="nav-card-urgent-drives"
                onClick={handleNavUrgent}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5 group ${
                  feedUrgentOnly
                    ? 'bg-amber-600 text-white border-amber-600 ring-2 ring-amber-500/30'
                    : 'bg-amber-50 hover:bg-amber-100/70 text-amber-900 border-amber-200/80'
                }`}
                title="Click to filter drives closing within 24 hours"
              >
                <span className={`text-xl font-extrabold flex items-center justify-center gap-1 group-hover:scale-105 transition-transform ${
                  feedUrgentOnly ? 'text-white' : 'text-amber-700'
                }`}>
                  <Clock className={`w-4 h-4 ${feedUrgentOnly ? 'text-white animate-spin' : 'text-amber-600'}`} />
                  <span>{urgentCount}</span>
                </span>
                <span className={`text-2xs font-bold uppercase tracking-wider ${
                  feedUrgentOnly ? 'text-amber-100' : 'text-amber-800'
                }`}>
                  &lt; 24h Left ↗
                </span>
              </button>

              {/* 3. Internships */}
              <button
                id="nav-card-internships"
                onClick={handleNavInternships}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5 group ${
                  feedCategory === 'internship' && !feedUrgentOnly
                    ? 'bg-indigo-700 text-white border-indigo-700 ring-2 ring-indigo-500/30'
                    : 'bg-indigo-50 hover:bg-indigo-100/70 text-indigo-900 border-indigo-200/80'
                }`}
                title="Click to view only internship opportunities"
              >
                <span className={`text-xl font-extrabold block group-hover:scale-105 transition-transform ${
                  feedCategory === 'internship' && !feedUrgentOnly ? 'text-white' : 'text-indigo-700'
                }`}>
                  {opportunities.filter((o) => o.category === 'internship').length}
                </span>
                <span className={`text-2xs font-bold uppercase tracking-wider ${
                  feedCategory === 'internship' && !feedUrgentOnly ? 'text-indigo-200' : 'text-indigo-800'
                }`}>
                  Internships ↗
                </span>
              </button>

              {/* 4. Helpful Likes / Trending */}
              <button
                id="nav-card-trending"
                onClick={handleNavTrending}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5 group ${
                  feedSortBy === 'trending' && !feedUrgentOnly
                    ? 'bg-emerald-700 text-white border-emerald-700 ring-2 ring-emerald-500/30'
                    : 'bg-emerald-50 hover:bg-emerald-100/70 text-emerald-900 border-emerald-200/80'
                }`}
                title="Click to sort by most liked and student-rated opportunities"
              >
                <span className={`text-xl font-extrabold flex items-center justify-center gap-1 group-hover:scale-105 transition-transform ${
                  feedSortBy === 'trending' && !feedUrgentOnly ? 'text-white' : 'text-emerald-700'
                }`}>
                  <Flame className={`w-4 h-4 ${feedSortBy === 'trending' && !feedUrgentOnly ? 'text-amber-300' : 'text-emerald-600'}`} />
                  <span>{opportunities.reduce((acc, o) => acc + o.likes.length, 0)}</span>
                </span>
                <span className={`text-2xs font-bold uppercase tracking-wider ${
                  feedSortBy === 'trending' && !feedUrgentOnly ? 'text-emerald-100' : 'text-emerald-800'
                }`}>
                  Top Rated ↗
                </span>
              </button>

            </div>

          </div>
        </div>
      </section>

      {/* Main Feed Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OpportunityFeed
          opportunities={opportunities}
          currentUser={currentUser}
          savedOppIds={savedOppIds}
          applications={applications}
          selectedCategory={feedCategory}
          sortBy={feedSortBy}
          urgentOnly={feedUrgentOnly}
          onCategoryChange={setFeedCategory}
          onSortChange={setFeedSortBy}
          onUrgentToggle={setFeedUrgentOnly}
          onToggleLike={handleToggleLike}
          onToggleSave={handleToggleSave}
          onEdit={(opp) => {
            setEditingOpportunity(opp);
            setIsPostModalOpen(true);
          }}
          onDelete={handleDeleteOpportunity}
          onTogglePin={currentUser.role === 'admin' ? handleTogglePin : undefined}
          onToggleVerify={currentUser.role === 'admin' ? handleToggleVerify : undefined}
          onAddComment={handleAddComment}
          onOpenPostModal={() => {
            setEditingOpportunity(null);
            setIsPostModalOpen(true);
          }}
          onOpenResumeMatch={(opp) => setResumeMatchOpportunity(opp)}
          onMarkApplied={handleMarkApplied}
          onOpenTracker={() => setIsTrackerOpen(true)}
        />
      </main>

      {/* Floating AI Assistant Trigger Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          id="floating-ai-bot-btn"
          onClick={() => setIsAiBotOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-xl hover:shadow-2xl border border-slate-700 transition-all duration-200 hover:scale-105"
          title="Open AI Opportunity Assistant (Lazy Student Digest)"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-emerald-300 group-hover:rotate-12 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold leading-tight">AI Assistant</p>
            <p className="text-3xs text-slate-400 leading-tight">24h Deadline &amp; Likes Bot</p>
          </div>
          {urgentCount > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-2xs font-extrabold text-amber-950 bg-amber-400 rounded-full animate-bounce">
              {urgentCount} Urgent
            </span>
          )}
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-slate-700" />
            <span className="font-semibold text-slate-800">Campus Connect AI Final Year Project</span>
            <span className="text-slate-400">· Central Placement &amp; Career Cell</span>
          </div>
          <p className="text-2xs text-slate-400">
            Campus opportunities, administrator-reviewed enrollment, and application tracking.
          </p>
        </div>
      </footer>

      {/* Modals & Slide-over Drawers */}
      <PostOpportunityModal
        isOpen={isPostModalOpen}
        onClose={() => {
          setIsPostModalOpen(false);
          setEditingOpportunity(null);
        }}
        onSubmit={handleSaveOpportunity}
        initialData={editingOpportunity}
        currentUser={currentUser}
      />

      <AIChatBotModal
        isOpen={isAiBotOpen}
        onClose={() => setIsAiBotOpen(false)}
        opportunities={opportunities}
        currentUser={currentUser}
        onSelectOpportunity={(opp) => selectOpportunity(opp.id)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={() => { void refresh().catch(e => setError(e.message)); }}
        onRegisterStudentKyc={handleRegisterStudentKyc}
      />

      {currentUser.role === 'admin' && (
        <AdminKYCPanel
          isOpen={isKycPanelOpen}
          onClose={() => setIsKycPanelOpen(false)}
          submissions={kycSubmissions}
          onApprove={handleApproveKyc}
          onReject={handleRejectKyc}
        />
      )}

      <BookmarksDrawer currentUser={currentUser}
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        savedOpportunities={savedOpportunities}
        onRemoveBookmark={handleToggleSave}
      />

      {/* Strict Alumni Blocking Policy Modal */}
      {showAlumniPolicyModal && (
        <div data-dialog="policy" role="dialog" aria-modal="true" aria-label="Enrollment policy" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Campus Access &amp; Alumni Restriction Policy</h3>
                  <p className="text-2xs text-slate-500">College Placement Cell Enforcement</p>
                </div>
              </div>
              <button
                onClick={() => setShowAlumniPolicyModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <h4 className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Eligible: Currently Enrolled Graduating Students</span>
                </h4>
                <p className="text-emerald-800">
                  Students currently studying in graduating batches (<strong>{availableBatches.join(", ")}</strong>) may access opportunities after enrollment approval, subject to individual eligibility to on-campus recruitment drives, paid internships, and free certification vouchers.
                </p>
              </div>

              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200">
                <h4 className="font-bold text-rose-900 flex items-center gap-1.5 mb-1">
                  <Ban className="w-4 h-4 text-rose-600" />
                  <span>Strictly Restricted: Passed-Out Students &amp; Alumni</span>
                </h4>
                <p className="text-rose-800">
                  Candidates who have already completed graduation (<strong>graduation years before {currentYear}</strong>) are blocked from registering or applying. On-campus recruitment quotas are strictly reserved for currently enrolled students.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Batch Year Status Checker:</span>
                  <span className="text-3xs text-slate-400 uppercase">Interactive Test</span>
                </div>
                <div className="flex items-center gap-2">
                  {[currentYear - 1, ...availableBatches.slice(0,4)].map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setTestYear(yr)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        testYear === yr
                          ? yr < currentYear
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
                <div className="text-2xs font-semibold pt-1">
                  {testYear < currentYear ? (
                    <span className="text-rose-700 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Batch {testYear} is passed out / alumni: Registration &amp; Drive Application Blocked.
                    </span>
                  ) : (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Batch {testYear} is currently enrolled: Graduation year is in range. Enrollment approval and drive eligibility still apply.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowAlumniPolicyModal(false)}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Understood &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Applications Pipeline & Candidate Tracker Modal */}
      <ApplicationsTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        applications={applications}
        currentUser={currentUser}
        opportunities={opportunities}
        onUpdateStatus={handleUpdateApplicationStatus}
        onDeleteApplication={handleDeleteApplication}
        onOpenOpportunity={(opp) => selectOpportunity(opp.id)}
      />

      {/* AI Resume & Job Fit Matcher Modal */}
      <ResumeMatchModal key={`${currentUser.id}-${resumeMatchOpportunity?.id || "closed"}`}
        isOpen={!!resumeMatchOpportunity}
        onClose={() => setResumeMatchOpportunity(null)}
        opportunity={resumeMatchOpportunity}
        currentUser={currentUser}
        onMarkApplied={handleMarkApplied}
        isApplied={
          resumeMatchOpportunity
            ? applications.some(
                (a) =>
                  a.opportunityId === resumeMatchOpportunity.id &&
                  a.studentId === currentUser.id
              )
            : false
        }
      />

      {/* Campus Placement Schedule & Key Dates Modal */}
      <DriveScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        events={driveEvents}
        currentUser={currentUser}
        onSelectOpportunity={selectOpportunity}
        onSaveEvent={async (event) => { await mutate(event.id ? `/events/${event.id}` : '/events',event,event.id ? 'PATCH' : 'POST'); }}
        onDeleteEvent={(id) => perform(`/events/${id}`,{},'DELETE')}
      />

    </div>
  );
}
