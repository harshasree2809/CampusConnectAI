import { useState } from 'react';
import { Opportunity } from '../types';
import { getDeadlineInfo } from '../utils/dateUtils';
import { AlertTriangle, Clock, ArrowRight, X, Sparkles } from 'lucide-react';

interface UrgentBannerProps {
  opportunities: Opportunity[];
  onSelectOpportunity: (opp: Opportunity) => void;
  onOpenAiBot?: () => void;
}

export default function UrgentBanner({
  opportunities,
  onSelectOpportunity,
  onOpenAiBot,
}: UrgentBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // Find all active opportunities that close in <= 24 hours
  const urgentItems = opportunities.filter((opp) => {
    const info = getDeadlineInfo(opp.deadline);
    return !info.isExpired && info.isUrgent24h;
  });

  if (dismissed || urgentItems.length === 0) {
    return null;
  }

  const topUrgent = urgentItems[0];
  const deadlineInfo = getDeadlineInfo(topUrgent.deadline);

  return (
    <div
      id="urgent-deadline-banner"
      className="bg-amber-500/10 border-b border-amber-500/20 text-amber-950 px-4 py-2.5 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-sm">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-600"></span>
          </span>
          <div className="flex items-center gap-1.5 font-semibold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>24-Hour Expiry Alert:</span>
          </div>
          <p className="text-amber-800 line-clamp-1">
            <span className="font-medium text-amber-950">{topUrgent.title}</span> ({topUrgent.company}){' '}
            <span className="text-amber-700 font-semibold underline decoration-amber-400 decoration-2">
              closes in {deadlineInfo.hoursRemaining} hours!
            </span>
          </p>
          {urgentItems.length > 1 && (
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-200/80 text-amber-900">
              +{urgentItems.length - 1} more closing soon
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenAiBot && (
            <button
              id="banner-ai-bot-btn"
              onClick={onOpenAiBot}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-950 bg-amber-200/90 hover:bg-amber-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="Ask AI Assistant about closing opportunities"
            >
              <Sparkles className="w-3 h-3 text-amber-800" />
              <span>Ask AI Bot</span>
            </button>
          )}
          <button
            id="banner-view-opp-btn"
            onClick={() => onSelectOpportunity(topUrgent)}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors"
          >
            <span>Review & Apply</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            id="banner-dismiss-btn"
            onClick={() => setDismissed(true)}
            className="p-1 text-amber-700 hover:text-amber-950 rounded-md transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
