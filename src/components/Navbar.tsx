import { useState } from 'react';
import { User, Opportunity, NotificationItem } from '../types';
import { 
  GraduationCap, 
  Sparkles, 
  Bell, 
  Bookmark, 
  PlusCircle, 
  ShieldCheck, 
  UserCheck, 
  LogOut, 
  ChevronDown,
  Clock,
  CheckCircle2,
  ExternalLink,
  Briefcase,
  Calendar
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (user: User) => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onOpenPostModal: () => void;
  onOpenAiBot?: () => void;
  onOpenBookmarks: () => void;
  onOpenKycPanel: () => void;
  onOpenTracker?: () => void;
  onOpenSchedule?: () => void;
  applicationsCount?: number;
  pendingKycCount: number;
  savedOppCount: number;
  urgentDeadlineCount: number;
  notifications: NotificationItem[];
  onNotificationClick: (notif: NotificationItem) => void;
  onMarkAllNotificationsRead: () => void;
}

export default function Navbar({
  currentUser,
  allUsers,
  onSwitchUser,
  onOpenAuthModal,
  onLogout,
  onOpenPostModal,
  onOpenAiBot,
  onOpenBookmarks,
  onOpenKycPanel,
  onOpenTracker,
  onOpenSchedule,
  applicationsCount = 0,
  pendingKycCount,
  savedOppCount,
  urgentDeadlineCount,
  notifications,
  onNotificationClick,
  onMarkAllNotificationsRead,
}: NavbarProps) {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between min-h-16 py-3 gap-3">
          
          {/* Attractive Boxed Logo & Brand Container */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white shadow-md border border-slate-700/60 ring-1 ring-white/10 hover:border-slate-500/70 transition-all flex items-center gap-2.5 sm:gap-3 group">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white shadow-inner shrink-0 relative ring-2 ring-white/20">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-xs group-hover:scale-105 transition-transform" />
                <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-black tracking-tight text-white flex items-center">
                    Campus Connect AI
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-2xs">
                    Campus Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium hidden md:block leading-tight">
                  Career &amp; Opportunity Portal for Graduating Batches
                </p>
              </div>
            </div>
          </div>

          {/* Center / Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            
            {/* Account Selector: ONLY visible to Admin. Students only see their verified identity */}
            {currentUser.role === 'admin' ? (
              <span className="text-xs font-bold text-slate-700 px-3 py-2">Administrator · {allUsers.length} accounts</span>
            ) : (
              /* Non-Admin: Student/Faculty sees ONLY their own verified account badge */
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold shadow-2xs">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                <span>{currentUser.role === 'faculty' ? 'Faculty' : 'Student'}: {currentUser.name.split(' ')[0]}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Active Verified Session" />
              </div>
            )}

            {/* Admin KYC Queue Button (visible if Admin) */}
            {currentUser.role === 'admin' && (
              <button
                id="admin-kyc-queue-btn"
                onClick={onOpenKycPanel}
                className="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
                title="Review student ID card and photograph submissions"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span className="hidden md:inline">KYC Verifications</span>
                {pendingKycCount > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-2xs font-bold leading-none text-white bg-purple-600 rounded-full">
                    {pendingKycCount}
                  </span>
                )}
              </button>
            )}

            {/* Campus Drives Schedule / Calendar Trigger */}
            {onOpenSchedule && (
              <button
                id="schedule-nav-btn"
                onClick={onOpenSchedule}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="View campus placement timeline, PPTs, and coding assessment dates"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden lg:inline">Schedule</span>
              </button>
            )}

            {/* Applications Tracker Trigger */}
            {onOpenTracker && (
              <button
                id="tracker-nav-btn"
                onClick={onOpenTracker}
                className="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                title={currentUser.role === 'admin' ? 'View all candidate placement applications' : 'Track your applied jobs & interview rounds'}
              >
                <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Tracker</span>
                {applicationsCount > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-2xs font-bold leading-none text-white bg-emerald-600 rounded-full">
                    {applicationsCount}
                  </span>
                )}
              </button>
            )}

            {/* AI Placement Assistant Trigger */}
            {onOpenAiBot && (
              <button
                id="ai-bot-nav-btn"
                onClick={onOpenAiBot}
                className="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
                title="Open Campus Placement & Opportunity AI Assistant"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">AI Assistant</span>
                {urgentDeadlineCount > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-2xs font-bold leading-none text-amber-950 bg-amber-400 rounded-full animate-pulse">
                    {urgentDeadlineCount}
                  </span>
                )}
              </button>
            )}

            {/* Post Opportunity Button */}
            <button
              id="post-opportunity-nav-btn"
              onClick={onOpenPostModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs hover:shadow-sm transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Post Opportunity</span>
              <span className="sm:hidden">Post</span>
            </button>

            {/* Bookmarks Drawer Trigger */}
            <button
              id="bookmarks-nav-btn"
              onClick={onOpenBookmarks}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Saved Opportunities"
              aria-label="Bookmarks"
            >
              <Bookmark className="w-4 h-4" />
              {savedOppCount > 0 && (
                <span className="absolute top-1 right-1 h-4 min-w-4 px-1 bg-slate-900 text-white rounded-full text-2xs flex items-center justify-center font-bold">
                  {savedOppCount}
                </span>
              )}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                id="notifications-nav-btn"
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-amber-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {showNotifDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setShowNotifDropdown(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Notifications</h4>
                      <p className="text-2xs text-slate-500">Live 24h deadline & placement updates</p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkAllNotificationsRead}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No notifications right now
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            onNotificationClick(notif);
                            setShowNotifDropdown(false);
                          }}
                          className={`p-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                            !notif.isRead ? 'bg-slate-50/70' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            {notif.type === 'urgent_deadline' ? (
                              <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-800">{notif.title}</p>
                              <p className="text-2xs text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                              <span className="text-3xs text-slate-400 mt-1 block">{notif.timestamp}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar / Logout */}
            <div className="relative">
              <button
                id="user-profile-btn"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-slate-200 transition-all"
              >
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-300"
                />
              </button>

              {showUserDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setShowUserDropdown(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900">{currentUser.name}</p>
                    <p className="text-2xs text-slate-500 truncate">{currentUser.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="inline-block px-1.5 py-0.5 rounded text-3xs font-semibold uppercase bg-slate-100 text-slate-700">
                        {currentUser.role}
                      </span>
                      {currentUser.graduationYear && (
                        <span className="text-2xs text-slate-500">Batch {currentUser.graduationYear}</span>
                      )}
                    </div>
                  </div>

                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenAuthModal();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-purple-700 hover:bg-purple-50 font-semibold transition-colors"
                    >
                      Switch / Add Account
                    </button>
                  )}

                  {currentUser.role === 'student' && (
                    <div className="px-4 py-2 text-2xs text-emerald-800 bg-emerald-50/60 border-b border-slate-100 flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Verified Graduating Student</span>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
