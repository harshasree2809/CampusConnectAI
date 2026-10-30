import { canApply } from '../utils/academic';
import { useState, FormEvent } from 'react';
import { Opportunity, User, StudentApplication } from '../types';
import { getDeadlineInfo, formatDateSimple } from '../utils/dateUtils';
import { 
  ThumbsUp, 
  Bookmark, 
  ExternalLink, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Pin, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  MessageSquare, 
  Send,
  Building2,
  MapPin,
  Sparkles,
  Award,
  BookOpen,
  Briefcase,
  Code,
  Plus
} from 'lucide-react';

interface OpportunityCardProps {
  key?: string;
  opportunity: Opportunity;
  currentUser: User;
  isSaved: boolean;
  application?: StudentApplication;
  onToggleLike: (id: string) => void;
  onToggleSave: (id: string) => void;
  onEdit: (opportunity: Opportunity) => void;
  onDelete: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onToggleVerify?: (id: string) => void;
  onAddComment: (oppId: string, text: string) => void;
  onOpenResumeMatch?: (opportunity: Opportunity) => void;
  onMarkApplied?: (opportunity: Opportunity) => void;
  onOpenTracker?: () => void;
}

export default function OpportunityCard({
  opportunity,
  currentUser,
  isSaved,
  application,
  onToggleLike,
  onToggleSave,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleVerify,
  onAddComment,
  onOpenResumeMatch,
  onMarkApplied,
  onOpenTracker,
}: OpportunityCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const deadlineInfo = getDeadlineInfo(opportunity.deadline);
  const isLikedByMe = opportunity.likes.includes(currentUser.id);
  const isAuthor = currentUser.id === opportunity.authorId;
  const allowed = canApply(currentUser,opportunity);
  const isAdmin = currentUser.role === 'admin';

  const handleCommentSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    onAddComment(opportunity.id, commentInput.trim());
    setCommentInput('');
  };

  const getCategoryBadge = (cat: Opportunity['category']) => {
    switch (cat) {
      case 'internship':
        return {
          label: 'Internship',
          color: 'bg-teal-50 text-teal-700 border-teal-200/80',
          icon: <Briefcase className="w-3 h-3" />,
        };
      case 'job':
        return {
          label: 'Full-Time Job',
          color: 'bg-blue-50 text-blue-700 border-blue-200/80',
          icon: <Building2 className="w-3 h-3" />,
        };
      case 'certificate':
        return {
          label: 'Free Certificate',
          color: 'bg-purple-50 text-purple-700 border-purple-200/80',
          icon: <Award className="w-3 h-3" />,
        };
      case 'hackathon':
        return {
          label: 'Hackathon',
          color: 'bg-amber-50 text-amber-700 border-amber-200/80',
          icon: <Code className="w-3 h-3" />,
        };
      case 'knowledge':
        return {
          label: 'Knowledge & Roadmap',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          icon: <BookOpen className="w-3 h-3" />,
        };
    }
  };

  const catBadge = getCategoryBadge(opportunity.category);

  return (
    <article 
      id={`opp-card-${opportunity.id}`}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 hover:shadow-md ${
        opportunity.isPinned
          ? 'border-indigo-300 ring-1 ring-indigo-200/60 shadow-xs'
          : deadlineInfo.isUrgent24h
          ? 'border-amber-300 ring-1 ring-amber-200/50'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Top Badges Row */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Pinned Tag */}
            {opportunity.isPinned && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Pin className="w-3 h-3 text-indigo-500 fill-indigo-100" />
                <span>Pinned by Admin</span>
              </span>
            )}

            {/* Category Tag */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-medium border ${catBadge.color}`}>
              {catBadge.icon}
              <span>{catBadge.label}</span>
            </span>

            {/* Admin Verified Badge */}
            {opportunity.isVerifiedByAdmin && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Verified</span>
              </span>
            )}

            {/* Deadline Urgency Badge */}
            {deadlineInfo.isUrgent24h ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                <Clock className="w-3 h-3 text-amber-700" />
                <span>{deadlineInfo.formattedText}</span>
              </span>
            ) : deadlineInfo.isUrgent48h ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>{deadlineInfo.formattedText}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs text-slate-500 bg-slate-50 border border-slate-200">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{deadlineInfo.formattedText}</span>
              </span>
            )}

            {/* AI Resume Match Trigger */}
            {onOpenResumeMatch && (
              <button
                onClick={() => onOpenResumeMatch(opportunity)}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
                title="Calculate your match score and skill fit"
              >
                <Sparkles className="w-3 h-3 text-indigo-600" />
                <span>Resume Match</span>
              </button>
            )}
          </div>

          {/* Quick Actions (Save & Context Menu) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onToggleSave(opportunity.id)}
              className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ${
                isSaved ? 'text-indigo-600 fill-indigo-50 hover:text-indigo-700' : ''
              }`}
              title={isSaved ? 'Remove from saved' : 'Save opportunity'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-600 text-indigo-600' : ''}`} />
            </button>

            {/* Role-Based Actions Menu (Edit / Delete / Admin Controls) */}
            {(isAuthor || isAdmin) && (
              <div className="relative">
                <button
                  onClick={() => setShowAdminMenu(!showAdminMenu)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Actions"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showAdminMenu && (
                  <div 
                    className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setShowAdminMenu(false)}
                  >
                    {/* Author Edit OR Admin Edit */}
                    <button
                      onClick={() => {
                        setShowAdminMenu(false);
                        onEdit(opportunity);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isAdmin && !isAuthor ? 'Admin Edit' : 'Edit Post'}</span>
                    </button>

                    {/* Admin Pin Toggle */}
                    {isAdmin && onTogglePin && (
                      <button
                        onClick={() => {
                          setShowAdminMenu(false);
                          onTogglePin(opportunity.id);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-indigo-700 hover:bg-indigo-50 flex items-center gap-2"
                      >
                        <Pin className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{opportunity.isPinned ? 'Unpin Post' : 'Pin to Top'}</span>
                      </button>
                    )}

                    {/* Admin Verify Toggle */}
                    {isAdmin && onToggleVerify && (
                      <button
                        onClick={() => {
                          setShowAdminMenu(false);
                          onToggleVerify(opportunity.id);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{opportunity.isVerifiedByAdmin ? 'Remove Verified' : 'Mark Verified'}</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    {/* Author Delete OR Admin Delete */}
                    <button
                      onClick={() => {
                        setShowAdminMenu(false);
                        if (window.confirm('Are you sure you want to delete this opportunity?')) {
                          onDelete(opportunity.id);
                        }
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>{isAdmin && !isAuthor ? 'Delete as Admin' : 'Delete My Post'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Title & Company */}
        <div className="mt-3">
          <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-indigo-950">
            {opportunity.title}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1 text-slate-800 font-semibold">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              {opportunity.company}
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {opportunity.location}
            </span>
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              {opportunity.stipendOrSalary}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="mt-3 text-xs text-slate-600 leading-relaxed line-clamp-3">
          {opportunity.description}
        </p>

        {/* Preparation / Interview Tips if available */}
        {opportunity.preparationTips && (
          <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-2xs text-slate-700">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Student Preparation Note:</span>
            </div>
            <p className="text-slate-600 leading-normal">{opportunity.preparationTips}</p>
          </div>
        )}

        {/* Eligibility Tags */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
          <span className="text-3xs font-semibold uppercase tracking-wider text-slate-400 mr-1">Eligibility:</span>
          {opportunity.eligibilityBatches.map((batch) => (
            <span key={batch} className="px-2 py-0.5 text-2xs font-medium rounded-md bg-slate-100 text-slate-700">
              {batch} Batch
            </span>
          ))}
          {opportunity.eligibleBranches.map((branch) => (
            <span key={branch} className="px-2 py-0.5 text-2xs font-medium rounded-md bg-slate-100 text-slate-700">
              {branch}
            </span>
          ))}
        </div>
      </div>

      {/* Card Footer: Author Attribution, Like Count, and Apply Link */}
      <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 rounded-b-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Author details */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-3xs font-bold text-slate-700 overflow-hidden">
            {opportunity.authorName.charAt(0)}
          </div>
          <div className="text-2xs">
            <span className="font-semibold text-slate-800">{opportunity.authorName}</span>
            {opportunity.authorDept && (
              <span className="text-slate-400 ml-1">· {opportunity.authorDept}</span>
            )}
            <span className="text-slate-400 ml-1 block sm:inline">
              ({formatDateSimple(opportunity.postedAt)})
            </span>
          </div>
        </div>

        {/* Actions: Likes, Comments Toggle, and Apply Button */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Like / Helpful Button */}
          <button
            id={`like-btn-${opportunity.id}`}
            onClick={() => onToggleLike(opportunity.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isLikedByMe
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
            title="Like this opportunity"
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isLikedByMe ? 'fill-white' : ''}`} />
            <span>{opportunity.likes.length}</span>
            <span className="hidden sm:inline">{isLikedByMe ? 'Helpful' : 'Helpful'}</span>
          </button>

          {/* Comments Toggle */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            title="Questions & Discussion"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            <span>{opportunity.comments ? opportunity.comments.length : 0}</span>
          </button>

          {/* Application Tracking Badge / Action */}
          {application ? (
            <button
              onClick={onOpenTracker}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
              title="Click to view/update your application in Tracker"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="capitalize">{application.status === 'assessment' ? 'OA Stage' : application.status}</span>
            </button>
          ) : onMarkApplied ? (
            <button
              disabled={!allowed}
              onClick={() => onMarkApplied(opportunity)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              title="Track this opportunity in your Applications Tracker"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Track</span>
            </button>
          ) : null}

          {/* Direct Apply / View Link */}
          <a
            href={allowed || currentUser.role !== 'student' ? opportunity.applyUrl : undefined}
            aria-disabled={!allowed && currentUser.role === 'student'}
            onClick={e=>{if(!allowed && currentUser.role === 'student')e.preventDefault();}}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-xs hover:shadow-sm transition-all"
          >
            <span>{deadlineInfo.isExpired ? 'Expired' : currentUser.role !== 'student' ? 'View employer link' : allowed ? 'Apply Now' : 'Not eligible'}</span>
            <ExternalLink className="w-3 h-3 text-slate-300" />
          </a>
        </div>
      </div>

      {/* Expandable Comments / Q&A Section */}
      {showComments && (
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 rounded-b-2xl space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
            <span>Student Q&A / Doubts</span>
            <span className="text-slate-400 font-normal">{opportunity.comments?.length || 0} questions</span>
          </div>

          {/* Comments list */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {opportunity.comments && opportunity.comments.length > 0 ? (
              opportunity.comments.map((comment) => (
                <div key={comment.id} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs">
                  <div className="flex items-center justify-between text-2xs text-slate-500 mb-1">
                    <span className="font-semibold text-slate-800">{comment.authorName}</span>
                    <span>{comment.createdAt}</span>
                  </div>
                  <p className="text-slate-700">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic py-1">No questions yet. Ask anything about eligibility or interview rounds!</p>
            )}
          </div>

          {/* Add comment form */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Ask a question about this opportunity..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="flex-1 text-xs px-3 py-2 rounded-lg bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
            <button
              type="submit"
              disabled={!commentInput.trim()}
              className="px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
