import { canApply } from '../utils/academic';
import { Opportunity, User } from '../types';
import { getDeadlineInfo } from '../utils/dateUtils';
import { Bookmark, X, ExternalLink, Clock, Building2, Trash2 } from 'lucide-react';

interface BookmarksDrawerProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  savedOpportunities: Opportunity[];
  onRemoveBookmark: (id: string) => void;
}

export default function BookmarksDrawer({
  currentUser,
  isOpen,
  onClose,
  savedOpportunities,
  onRemoveBookmark,
}: BookmarksDrawerProps) {
  if (!isOpen) return null;

  return (
    <div data-dialog="bookmarks" role="dialog" aria-modal="true" aria-label="Bookmarks" className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900">
                <Bookmark className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Saved Opportunities</h3>
                <p className="text-2xs text-slate-500">
                  {savedOpportunities.length} saved drives to review & apply
                </p>
              </div>
            </div>
            <button aria-label="Close dialog"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 p-6 overflow-y-auto space-y-3 bg-slate-50/50">
            {savedOpportunities.length === 0 ? (
              <div className="text-center py-24 text-slate-400 text-xs">
                <Bookmark className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-600">No saved opportunities yet</p>
                <p className="text-slate-400 mt-1">
                  Click the bookmark icon on any opportunity card to review it later!
                </p>
              </div>
            ) : (
              savedOpportunities.map((opp) => {
                const info = getDeadlineInfo(opp.deadline);
                return (
                  <div
                    key={opp.id}
                    className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{opp.title}</h4>
                        <p className="text-2xs text-slate-600 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{opp.company}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => onRemoveBookmark(opp.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-2xs pt-1 border-t border-slate-100">
                      <span className={`flex items-center gap-1 font-semibold ${
                        info.isUrgent24h ? 'text-amber-700 font-bold' : 'text-slate-500'
                      }`}>
                        <Clock className="w-3 h-3" />
                        <span>{info.formattedText}</span>
                      </span>
                      <a
                        href={canApply(currentUser,opp) || currentUser.role !== 'student' ? opp.applyUrl : undefined}
                        aria-disabled={!canApply(currentUser,opp) && currentUser.role === 'student'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-2xs font-semibold shadow-xs"
                      >
                        <span>{getDeadlineInfo(opp.deadline).isExpired ? 'Expired' : currentUser.role !== 'student' ? 'View link' : canApply(currentUser,opp) ? 'Apply' : 'Not eligible'}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
