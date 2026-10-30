import { availableBatches } from '../utils/academic';
import { useState, useMemo, ReactNode } from 'react';
import { Opportunity, OpportunityCategory, User, StudentApplication } from '../types';
import OpportunityCard from './OpportunityCard';
import { getDeadlineInfo } from '../utils/dateUtils';
import { 
  Search, 
  Filter, 
  Flame, 
  Clock, 
  ArrowUpDown, 
  Sparkles, 
  Briefcase, 
  Building2, 
  Award, 
  Code, 
  BookOpen, 
  SlidersHorizontal,
  X
} from 'lucide-react';

interface OpportunityFeedProps {
  opportunities: Opportunity[];
  currentUser: User;
  savedOppIds: string[];
  applications?: StudentApplication[];
  onToggleLike: (id: string) => void;
  onToggleSave: (id: string) => void;
  onEdit: (opp: Opportunity) => void;
  onDelete: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onToggleVerify?: (id: string) => void;
  onAddComment: (oppId: string, text: string) => void;
  onOpenPostModal: () => void;
  onOpenResumeMatch?: (opp: Opportunity) => void;
  onMarkApplied?: (opp: Opportunity) => void;
  onOpenTracker?: () => void;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  onCategoryChange?: (category: string) => void;
  sortBy?: 'newest' | 'expiring' | 'trending' | 'stipend';
  onSortByChange?: (sortBy: 'newest' | 'expiring' | 'trending' | 'stipend') => void;
  onSortChange?: (sortBy: 'newest' | 'expiring' | 'trending' | 'stipend') => void;
  urgentOnly?: boolean;
  onToggleUrgentOnly?: (urgent: boolean) => void;
  onUrgentToggle?: (urgent: boolean) => void;
}

export default function OpportunityFeed({
  opportunities,
  currentUser,
  savedOppIds,
  applications = [],
  onToggleLike,
  onToggleSave,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleVerify,
  onAddComment,
  onOpenPostModal,
  onOpenResumeMatch,
  onMarkApplied,
  onOpenTracker,
  selectedCategory: controlledCategory,
  onSelectCategory,
  onCategoryChange,
  sortBy: controlledSortBy,
  onSortByChange,
  onSortChange,
  urgentOnly: controlledUrgentOnly,
  onToggleUrgentOnly,
  onUrgentToggle,
}: OpportunityFeedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [internalCategory, setInternalCategory] = useState<string>('all');
  const [internalSortBy, setInternalSortBy] = useState<'newest' | 'expiring' | 'trending' | 'stipend'>('newest');
  const [internalUrgentOnly, setInternalUrgentOnly] = useState<boolean>(false);
  const [showExpired,setShowExpired] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  const selectedCategory = controlledCategory !== undefined ? controlledCategory : internalCategory;
  const handleCategoryChange = (cat: string) => {
    if (onCategoryChange) onCategoryChange(cat);
    if (onSelectCategory) onSelectCategory(cat);
    setInternalCategory(cat);
  };

  const sortBy = controlledSortBy !== undefined ? controlledSortBy : internalSortBy;
  const handleSortChange = (s: 'newest' | 'expiring' | 'trending' | 'stipend') => {
    if (onSortChange) onSortChange(s);
    if (onSortByChange) onSortByChange(s);
    setInternalSortBy(s);
  };

  const urgentOnly = controlledUrgentOnly !== undefined ? controlledUrgentOnly : internalUrgentOnly;
  const handleUrgentToggle = (u: boolean) => {
    if (onUrgentToggle) onUrgentToggle(u);
    if (onToggleUrgentOnly) onToggleUrgentOnly(u);
    setInternalUrgentOnly(u);
  };

  const categories: { id: string; label: string; icon: ReactNode }[] = [
    { id: 'all', label: 'All Feeds', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'internship', label: 'Internships', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { id: 'job', label: 'Full-Time Jobs', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'certificate', label: 'Free Certificates', icon: <Award className="w-3.5 h-3.5" /> },
    { id: 'hackathon', label: 'Hackathons', icon: <Code className="w-3.5 h-3.5" /> },
    { id: 'knowledge', label: 'Knowledge / Notes', icon: <BookOpen className="w-3.5 h-3.5" /> },
  ];

  const filteredOpportunities = useMemo(() => {
    let list = opportunities.filter(o=>showExpired || !getDeadlineInfo(o.deadline).isExpired);

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (opp) =>
          opp.title.toLowerCase().includes(q) ||
          opp.company.toLowerCase().includes(q) ||
          opp.description.toLowerCase().includes(q) ||
          opp.eligibleBranches.some((b) => b.toLowerCase().includes(q))
      );
    }

    // Urgent < 24h filter
    if (urgentOnly) {
      list = list.filter((opp) => {
        const info = getDeadlineInfo(opp.deadline);
        return !info.isExpired && info.isUrgent24h;
      });
    }

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter((opp) => opp.category === selectedCategory);
    }

    // Batch filter
    if (selectedBatch !== 'all') {
      const batchNum = parseInt(selectedBatch, 10);
      list = list.filter((opp) => opp.eligibilityBatches.includes(batchNum));
    }

    // Branch filter
    if (selectedBranch !== 'all') {
      list = list.filter(
        (opp) =>
          opp.eligibleBranches.includes('All Branches') ||
          opp.eligibleBranches.includes(selectedBranch)
      );
    }

    // Sorting
    list.sort((a, b) => {
      // Pinned always comes first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sortBy === 'trending') {
        // High like count
        return b.likes.length - a.likes.length;
      }
      if (sortBy === 'expiring') {
        // Nearest deadline first
        const diffA = new Date(a.deadline).getTime() - Date.now();
        const diffB = new Date(b.deadline).getTime() - Date.now();
        return diffA - diffB;
      }
      if (sortBy === 'stipend') {
        // Simple heuristic for demo
        const annual = (o: Opportunity) => o.compensationAmount == null ? -1 : o.compensationAmount * (o.compensationPeriod === 'month' ? 12 : 1);
        // Group currencies: comparing raw INR and USD amounts would be misleading.
        const ca = a.compensationCurrency || 'INR', cb = b.compensationCurrency || 'INR';
        return ca.localeCompare(cb) || annual(b) - annual(a);
      }
      // default: newest
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    });

    return list;
  }, [opportunities, searchQuery, selectedCategory, selectedBatch, selectedBranch, sortBy, urgentOnly, showExpired]);

  // Counts for categories
  const categoryCounts = useMemo(() => {
    const visible = opportunities.filter(o=>showExpired || !getDeadlineInfo(o.deadline).isExpired);
    const counts: Record<string, number> = { all: visible.length };
    visible.forEach((o) => {
      counts[o.category] = (counts[o.category] || 0) + 1;
    });
    return counts;
  }, [opportunities, showExpired]);

  return (
    <div id="opportunities-feed" className="space-y-6 scroll-mt-24">
      <label className="flex items-center gap-2 text-sm mb-3"><input type="checkbox" checked={showExpired} onChange={e=>setShowExpired(e.target.checked)}/>Include expired opportunities</label>
      
      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
        
        {/* Top Search & Sorting Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="opportunity-search-input"
              type="text"
              placeholder="Search by company, role (e.g. Google, Software Intern), skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls: Sort Dropdown & Quick Batch Filter */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort:</span>
              <select
                id="sort-by-select"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as any)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="newest">Latest Posted</option>
                <option value="trending">🔥 Most Liked / Trending</option>
                <option value="expiring">⏳ Expiring Soon (&lt; 24h)</option>
                <option value="stipend">💰 Highest Reward</option>
              </select>
            </div>

            {/* Batch Filter - For ALL Graduating Batches */}
            <select
              id="batch-filter-select"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="text-xs font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="all">🎓 All Graduating Batches</option>
              {availableBatches.map(y=><option key={y} value={y}>{y} Batch</option>)}
              <option value="2029">2029 Batch (Graduating)</option>
              <option value="2030">2030 Batch (Graduating)</option>
            </select>

            {/* Branch Filter */}
            <select
              id="branch-filter-select"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="text-xs font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="all">🏢 All Branches</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
            </select>
          </div>

        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {categories.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const isSelected = selectedCategory === cat.id && !urgentOnly;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  handleUrgentToggle(false);
                  handleCategoryChange(cat.id);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
                <span className={`text-2xs px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-200/80 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Urgent Only Active Notification Banner */}
      {urgentOnly && (
        <div className="flex items-center justify-between p-3.5 bg-amber-50 rounded-2xl border border-amber-300/80 text-xs text-amber-900 shadow-xs animate-in fade-in duration-150">
          <span className="flex items-center gap-2 font-bold">
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>Active Filter: Showing {filteredOpportunities.length} opportunities expiring in &lt; 24 hours</span>
          </span>
          <button
            onClick={() => handleUrgentToggle(false)}
            className="px-3 py-1 text-xs font-semibold bg-white rounded-xl border border-amber-300 hover:bg-amber-100 text-amber-900 shadow-2xs transition-colors"
          >
            Clear Filter (Show All)
          </button>
        </div>
      )}

      {/* Results Header Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-900 font-semibold">{filteredOpportunities.length}</strong> opportunities
          {selectedCategory !== 'all' && ` in ${selectedCategory}`}
          {selectedBatch !== 'all' && ` for ${selectedBatch} Batch`}
        </span>
        {filteredOpportunities.some((o) => getDeadlineInfo(o.deadline).isUrgent24h) && (
          <span className="flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Opportunities closing in &lt; 24 hours available!</span>
          </span>
        )}
      </div>

      {/* Opportunity Cards Feed */}
      {filteredOpportunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
          {filteredOpportunities.map((opp) => {
            const studentApp = applications.find(
              (a) => a.opportunityId === opp.id && a.studentId === currentUser.id
            );

            return (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                currentUser={currentUser}
                isSaved={savedOppIds.includes(opp.id)}
                application={studentApp}
                onToggleLike={onToggleLike}
                onToggleSave={onToggleSave}
                onEdit={onEdit}
                onDelete={onDelete}
                onTogglePin={onTogglePin}
                onToggleVerify={onToggleVerify}
                onAddComment={onAddComment}
                onOpenResumeMatch={onOpenResumeMatch}
                onMarkApplied={onMarkApplied}
                onOpenTracker={onOpenTracker}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-slate-800">No opportunities match your filters</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Try adjusting your search query, clearing batch restrictions, or be the first to share an opportunity!
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => {
                setSearchQuery('');
                handleCategoryChange('all');
                handleUrgentToggle(false);
                setSelectedBatch('all');
                setSelectedBranch('all');
              }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Reset Filters
            </button>
            <button
              onClick={onOpenPostModal}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              + Post New Opportunity
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
