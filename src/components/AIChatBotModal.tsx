import { useEffect, useRef, useState, useMemo } from 'react';
import { Opportunity, User } from '../types';
import { api, post } from '../api';
import { getDeadlineInfo } from '../utils/dateUtils';
import {
  Sparkles,
  Bot,
  User as UserIcon,
  Send,
  X,
  RotateCcw,
  Clock,
  Briefcase,
  Building2,
  AlertTriangle,
  ArrowRight,
  Info,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  opportunities: Opportunity[];
  currentUser: User;
  onSelectOpportunity: (o: Opportunity) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  senderLabel: string;
  text: string;
  cards?: Opportunity[];
  suggestions?: string[];
  timestamp?: string;
  isError?: boolean;
}

function createWelcomeMessage(userName: string, activeCount: number, department?: string): ChatMessage {
  return {
    id: 'welcome-init',
    sender: 'assistant',
    senderLabel: 'Campus AI Assistant',
    text: `Hello ${userName}! 👋 Welcome to your Campus Placement & Opportunity Assistant.\n\nI can help you explore ${activeCount} active placement drives, highlight urgent deadlines closing soon, check department eligibility (${department || 'All Branches'}), and review placement cell rules.`,
    suggestions: [
      '⚡ 24h Urgent Deadlines',
      '💼 Internships',
      '🎓 Full-Time Jobs',
      '🎯 Jobs for my Branch',
      '📜 Placement Cell Rules & FAQs'
    ],
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

export default function AIChatBotModal({
  isOpen,
  onClose,
  opportunities,
  currentUser,
  onSelectOpportunity
}: Props) {
  const activeOpps = useMemo(
    () => opportunities.filter((o) => !getDeadlineInfo(o.deadline).isExpired),
    [opportunities]
  );

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    createWelcomeMessage(
      currentUser.name.split(' ')[0],
      activeOpps.length,
      currentUser.department
    )
  ]);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const request = useRef(0);
  const bottom = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if server has Gemini AI configured
  useEffect(() => {
    api('/config')
      .then((c) => {
        setEnabled(!!c.aiEnabled);
        if (c.aiEnabled) {
          setUseAI(true);
        }
      })
      .catch(() => {});
  }, []);

  // When user changes, reset chat to fresh greeting
  useEffect(() => {
    request.current++;
    setBusy(false);
    setMessages([
      createWelcomeMessage(
        currentUser.name.split(' ')[0],
        activeOpps.length,
        currentUser.department
      )
    ]);
    setQuery('');
  }, [currentUser.id]);

  // When modal closes, cancel in-flight request
  useEffect(() => {
    if (!isOpen) {
      request.current++;
      setBusy(false);
    } else {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  if (!isOpen) return null;

  const handleResetChat = () => {
    request.current++;
    setBusy(false);
    setQuery('');
    setMessages([
      createWelcomeMessage(
        currentUser.name.split(' ')[0],
        activeOpps.length,
        currentUser.department
      )
    ]);
  };

  const answerLocally = (
    q: string
  ): { text: string; cards: Opportunity[]; suggestions?: string[] } => {
    const lower = q.toLowerCase().trim();
    const branch = currentUser.department?.toLowerCase() || '';

    // 1. Greetings
    if (/^(hi|hello|hey|hola|greetings|good\s*(morning|afternoon|evening)|namaste)\b/i.test(lower)) {
      return {
        text: `Hello ${currentUser.name.split(' ')[0]}! 😊 How can I help you today? You can ask me to find jobs, internships, check urgent deadlines, or view placement cell guidelines.`,
        cards: [],
        suggestions: [
          '⚡ 24h Urgent Deadlines',
          '💼 Internships',
          '🏢 Top Hiring Companies',
          '📜 Placement Cell Rules & FAQs'
        ]
      };
    }

    // 2. Help / What can you do
    if (/who\s+are\s+you|what\s+can\s+you\s+do|help|how\s+does\s+this\s+work/i.test(lower)) {
      return {
        text: `I am your Campus Placement & Opportunity Assistant! 🎓\n\n• Explore ${activeOpps.length} verified campus drives from top recruiters.\n• Track 24-hour urgent deadlines so you never miss a registration.\n• Discover internships, coding assessments, and interview dates.\n• Check placement cell rules, office timings, and attendance policies.`,
        cards: [],
        suggestions: [
          '⚡ 24h Urgent Deadlines',
          '💼 Internships',
          '🎯 Match my Branch',
          '🏢 Show All Companies'
        ]
      };
    }

    // 3. Urgent / Closing Soon / Deadlines
    if (/urgent|closing|deadline|today|24\s*h|hours|expir/i.test(lower)) {
      const urgent = activeOpps.filter((o) => getDeadlineInfo(o.deadline).isUrgent24h);
      if (urgent.length > 0) {
        return {
          text: `⚡ Found ${urgent.length} opportunity(s) closing in less than 24 hours! Make sure to apply right away:`,
          cards: urgent.slice(0, 5),
          suggestions: ['💼 Internships', '🏢 Top Hiring Companies', '📅 Placement Schedule']
        };
      } else {
        const earliest = [...activeOpps]
          .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
          .slice(0, 3);
        return {
          text: `Good news! There are currently no opportunities closing within the next 24 hours. Here are the earliest upcoming deadlines:`,
          cards: earliest,
          suggestions: ['💼 Internships', '🎓 Full-Time Jobs']
        };
      }
    }

    // 4. Placement Cell FAQs / Rules / Attendance / Office Hours
    if (/faq|rule|rules|office|timing|hours|attendance|cgpa|contact|guideline|placement\s*cell/i.test(lower)) {
      return {
        text: `🏛️ **Central Placement Cell Guidelines & FAQs**:\n\n• **Location**: Room 302, Academic Block A\n• **Office Hours**: Monday – Friday, 9:00 AM – 5:00 PM\n• **Attendance Mandate**: Minimum 75% aggregate class attendance required to participate in campus recruitment drives.\n• **Enrollment Policy**: Only verified, currently enrolled graduating students with approved KYC IDs can register for on-campus drives.\n• **Support Email**: placement-cell@college.edu.in`,
        cards: [],
        suggestions: ['⚡ 24h Urgent Deadlines', '💼 Internships', '📅 Drive Schedule']
      };
    }

    // 5. Internships
    if (/intern|internship|summer\s*intern|stipend/i.test(lower)) {
      const internships = activeOpps.filter((o) => o.category === 'internship');
      return {
        text: internships.length
          ? `💼 Found ${internships.length} active internship opportunities:`
          : `No active internship listings found right now. Check back soon or explore full-time jobs.`,
        cards: internships.slice(0, 5),
        suggestions: ['⚡ 24h Urgent Deadlines', '🎓 Full-Time Jobs', '🎯 Jobs for my Branch']
      };
    }

    // 6. Full-time Jobs
    if (/job|full\s*time|graduate\s*trainee|sde|engineer|fresher/i.test(lower)) {
      const jobs = activeOpps.filter((o) => o.category === 'job');
      return {
        text: jobs.length
          ? `🎓 Found ${jobs.length} full-time job openings for campus placement:`
          : `No full-time job listings found matching that query.`,
        cards: jobs.slice(0, 5),
        suggestions: ['💼 Internships', '⚡ 24h Urgent Deadlines', '🏢 Top Hiring Companies']
      };
    }

    // 7. Department / Branch matching
    if (/branch|department|eligible|cse|ece|mech|civil|it|eee|aids|aiml/i.test(lower)) {
      let target = branch;
      const branches = ['cse', 'ece', 'mech', 'civil', 'it', 'eee', 'aids', 'aiml'];
      for (const b of branches) {
        if (lower.includes(b)) {
          target = b;
          break;
        }
      }
      const matched = activeOpps.filter((o) =>
        o.eligibleBranches.some(
          (b) => b.toLowerCase().includes(target) || b.toLowerCase() === 'all'
        )
      );
      return {
        text: `🎯 Found ${matched.length} opportunity(s) open to **${target.toUpperCase() || 'your department'}** students:`,
        cards: matched.slice(0, 5),
        suggestions: ['⚡ 24h Urgent Deadlines', '💼 Internships', '🏢 Top Hiring Companies']
      };
    }

    // 8. Popular / Trending / Most Liked
    if (/popular|trending|top|most\s*liked|highest|best/i.test(lower)) {
      const sorted = [...activeOpps].sort(
        (a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)
      );
      return {
        text: `🔥 Top trending opportunities with the highest student interest:`,
        cards: sorted.slice(0, 5),
        suggestions: ['⚡ 24h Urgent Deadlines', '💼 Internships', '🎯 Jobs for my Branch']
      };
    }

    // 9. Keyword search across title, company, description, branches
    const matched = activeOpps.filter((o) => {
      const content = `${o.title} ${o.company} ${o.description} ${o.category} ${o.eligibleBranches.join(' ')}`.toLowerCase();
      return content.includes(lower);
    });

    if (matched.length > 0) {
      return {
        text: `🔍 Found ${matched.length} opportunity(s) matching "${q}":`,
        cards: matched.slice(0, 5),
        suggestions: ['⚡ 24h Urgent Deadlines', '💼 Internships', '📜 Placement Cell Rules & FAQs']
      };
    }

    // 10. Fallback
    return {
      text: `I couldn't find any opportunities matching "${q}".\n\nTry searching for a company name, role type ("internship" or "job"), your branch (e.g., "CSE"), or pick an option below:`,
      cards: activeOpps.slice(0, 3),
      suggestions: [
        '⚡ 24h Urgent Deadlines',
        '💼 Internships',
        '🎓 Full-Time Jobs',
        '📜 Placement Cell Rules & FAQs'
      ]
    };
  };

  const send = async (textToSend?: string) => {
    const raw = textToSend !== undefined ? textToSend : query;
    if (busy || !raw.trim()) return;

    const q = raw.trim();
    setQuery('');
    setBusy(true);
    const id = ++request.current;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      senderLabel: currentUser.name.split(' ')[0],
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((m) => [...m, userMsg]);

    try {
      let answerText = '';
      let cards: Opportunity[] = [];
      let suggestions: string[] | undefined;

      if (useAI && enabled) {
        const res = await post('/ai/chat', { query: q });
        answerText = res.text;
        suggestions = ['⚡ 24h Urgent Deadlines', '💼 Internships', '🏢 Top Hiring Companies'];
      } else {
        const local = answerLocally(q);
        answerText = local.text;
        cards = local.cards;
        suggestions = local.suggestions;
      }

      if (id === request.current) {
        setMessages((m) => [
          ...m,
          {
            id: crypto.randomUUID(),
            sender: 'assistant',
            senderLabel: useAI && enabled ? 'Gemini AI Assistant' : 'Campus Assistant',
            text: answerText,
            cards,
            suggestions,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (e: any) {
      if (id === request.current) {
        setMessages((m) => [
          ...m,
          {
            id: crypto.randomUUID(),
            sender: 'system',
            senderLabel: 'Assistant Notification',
            text: `⚠️ ${e.message || 'Unable to fetch response.'} Switching to local search.`,
            isError: true,
            suggestions: ['⚡ 24h Urgent Deadlines', '💼 Internships', '📜 Placement Cell Rules & FAQs'],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } finally {
      if (id === request.current) {
        setBusy(false);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      data-dialog="chat"
      role="dialog"
      aria-modal="true"
      aria-label="Campus Placement AI Assistant"
    >
      <div className="w-full max-w-2xl h-[88vh] max-h-[720px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <header className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white shadow-inner ring-2 ring-white/20 shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-white tracking-tight">
                  Campus Placement AI Assistant
                </h2>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    enabled && useAI
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      enabled && useAI ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400'
                    }`}
                  />
                  {enabled && useAI ? 'Gemini AI' : 'Smart Local Engine'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {enabled && useAI
                  ? 'Real-time conversational intelligence powered by Gemini LLM'
                  : 'Instant keyword, deadline, and eligibility queries'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleResetChat}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Reset conversation"
              aria-label="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              aria-label="Close assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* AI Mode Banner & Toggle */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none font-medium text-slate-700">
            <input
              type="checkbox"
              checked={useAI}
              disabled={!enabled || busy}
              onChange={(e) => setUseAI(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 disabled:opacity-50 cursor-pointer"
            />
            <span>Use configured Gemini AI</span>
          </label>

          <div className="text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {enabled
                ? 'Generative mode active. Always verify drive dates with placement cell.'
                : 'Local engine active. Set GEMINI_API_KEY in .env to activate Gemini.'}
            </span>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            const isSystem = m.sender === 'system';

            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    {isSystem ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-xs ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-xs'
                      : isSystem
                      ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-tl-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`text-[11px] font-bold ${
                        isUser ? 'text-indigo-200' : 'text-slate-500'
                      }`}
                    >
                      {m.senderLabel}
                    </span>
                    {m.timestamp && (
                      <span
                        className={`text-[10px] ${
                          isUser ? 'text-slate-400' : 'text-slate-400'
                        }`}
                      >
                        {m.timestamp}
                      </span>
                    )}
                  </div>

                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.text}</p>

                  {/* Render Opportunity Cards if attached */}
                  {m.cards && m.cards.length > 0 && (
                    <div className="mt-3 space-y-2 pt-2 border-t border-slate-100">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Matched Opportunities:
                      </p>
                      {m.cards.map((o) => {
                        const dInfo = getDeadlineInfo(o.deadline);
                        return (
                          <div
                            key={o.id}
                            className="bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 rounded-xl p-3 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                                  {o.title}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    o.category === 'internship'
                                      ? 'bg-blue-100 text-blue-800'
                                      : o.category === 'job'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-purple-100 text-purple-800'
                                  }`}
                                >
                                  {o.category}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                                <span className="flex items-center gap-1 text-slate-700 font-medium">
                                  <Building2 className="w-3 h-3 text-slate-400" />
                                  {o.company}
                                </span>
                                <span
                                  className={`flex items-center gap-1 font-semibold ${
                                    dInfo.isUrgent24h ? 'text-amber-600' : 'text-slate-500'
                                  }`}
                                >
                                  <Clock className="w-3 h-3" />
                                  {dInfo.formattedText}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => onSelectOpportunity(o)}
                              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-indigo-600 rounded-lg shadow-2xs transition-colors shrink-0 cursor-pointer"
                            >
                              <span>View Details</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Render Follow-up Suggestion Chips if available */}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {m.suggestions.map((sug) => (
                        <button
                          key={sug}
                          disabled={busy}
                          onClick={() => send(sug)}
                          className="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-full transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            );
          })}

          {busy && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Bot className="w-4 h-4 text-emerald-400 animate-spin" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-4 shadow-xs flex items-center gap-2">
                <span className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {useAI ? 'Gemini AI is analyzing...' : 'Searching campus database...'}
                </span>
              </div>
            </div>
          )}

          <div ref={bottom} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 self-center shrink-0">
            Quick:
          </span>
          {[
            '⚡ 24h Deadlines',
            '💼 Internships',
            '🎓 Full-Time Jobs',
            '🎯 My Branch',
            '🏢 Top Companies',
            '📜 Placement FAQs'
          ].map((tag) => (
            <button
              key={tag}
              disabled={busy}
              onClick={() => send(tag)}
              className="px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full border border-slate-200 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Query Input Form */}
        <form
          className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <input
            ref={inputRef}
            aria-label="Question or search query"
            className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            value={query}
            maxLength={2000}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about placement drives, internships, deadlines, or rules…"
          />
          <button
            type="submit"
            disabled={busy || !query.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-xs hover:shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
          >
            <span className="hidden sm:inline">Send</span>
            <Send className="w-4 h-4 text-emerald-400" />
          </button>
        </form>

      </div>
    </div>
  );
}
