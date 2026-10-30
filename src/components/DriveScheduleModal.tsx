import { calendar, downloadFile } from '../utils/exports';
import EventEditor from './EventEditor';
import { useState, useMemo } from 'react';
import { DriveEvent, User, Opportunity } from '../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Building2, 
  X, 
  Download, 
  Filter, 
  ChevronRight, 
  Sparkles,
  Award,
  BookOpen,
  Code,
  Briefcase
} from 'lucide-react';

interface DriveScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: DriveEvent[];
  currentUser: User;
  onSaveEvent?: (event: Partial<DriveEvent>) => Promise<void>;
  onDeleteEvent?: (id:string) => void;
  onSelectOpportunity?: (opportunityId: string) => void;
}

export default function DriveScheduleModal({
  isOpen,
  onClose,
  events,
  currentUser,
  onSelectOpportunity,
  onSaveEvent, onDeleteEvent,
}: DriveScheduleModalProps) {
  const [editing, setEditing] = useState<Partial<DriveEvent>|null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const filteredEvents = useMemo(() => {
    return events
      .filter((evt) => {
        if (filterType !== 'all' && evt.eventType !== filterType) return false;
        return true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, filterType]);

  if (!isOpen) return null;

  const getEventBadge = (type: DriveEvent['eventType']) => {
    switch (type) {
      case 'ppt':
        return { label: 'Pre-Placement Talk (PPT)', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'assessment':
        return { label: 'Online Assessment (OA)', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'interview':
        return { label: 'Interview Rounds', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'hackathon':
        return { label: 'Hackathon / Challenge', color: 'bg-teal-50 text-teal-700 border-teal-200' };
      case 'deadline':
        return { label: 'Application Deadline', color: 'bg-rose-50 text-rose-700 border-rose-200 font-bold' };
    }
  };

  const formatEventDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return {
      dayMonth: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }),
      time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };
  };

  const handleExportICS = () => downloadFile(calendar(filteredEvents),`campus-drive-schedule-${new Date().toISOString().slice(0,10)}.ics`,'text/calendar;charset=utf-8;');

  return (
    <div data-dialog="schedule" role="dialog" aria-modal="true" aria-label="DriveSchedule" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {editing && onSaveEvent && <EventEditor event={editing} onCancel={()=>setEditing(null)} onSave={async e=>{await onSaveEvent(e);setEditing(null);}}/>}
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Campus Placement Schedule &amp; Key Events</h3>
                <span className="px-2 py-0.5 rounded-full text-3xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Live Calendar
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Official timeline for upcoming PPTs, proctored assessments, and interview blocks
              </p>
            </div>
          </div>
          <button aria-label="Close dialog"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {onSaveEvent && currentUser.role !== 'student' && <button className="m-3 border p-2 rounded-lg" onClick={()=>setEditing({})}>Add placement event</button>}
        {/* Filter Bar */}
        <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Events' },
              { id: 'assessment', label: 'Coding Tests (OA)' },
              { id: 'interview', label: 'Interviews' },
              { id: 'ppt', label: 'Pre-Placement Talks' },
              { id: 'deadline', label: 'Deadlines' },
            ].map((tab) => (
            <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportICS}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer ml-auto"
            title="Export to Apple Calendar / Google Calendar (.ics)"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Add to Calendar (.ics)</span>
          </button>
        </div>

        {/* Events Timeline List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 divide-y divide-slate-100">
          {filteredEvents.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Calendar className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No scheduled events in this category</p>
              <p className="text-xs text-slate-400">All dates are updated directly by the Training &amp; Placement Office.</p>
            </div>
          ) : (
            filteredEvents.map((evt) => {
              const badge = getEventBadge(evt.eventType);
              const dateInfo = formatEventDate(evt.date);

              return (
                <div key={evt.id} className="pt-3 first:pt-0 bg-white hover:bg-slate-50/50 p-4 rounded-2xl border border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left Date Block */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center shrink-0 shadow-2xs">
                      <span className="text-3xs font-bold uppercase text-slate-500">
                        {dateInfo.dayMonth.split(',')[0]}
                      </span>
                      <span className="text-base font-black text-slate-900 leading-none">
                        {dateInfo.dayMonth.split(' ')[1] || '14'}
                      </span>
                      <span className="text-3xs font-semibold text-indigo-700 mt-0.5">
                        {dateInfo.time}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">
                          {evt.company}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-2xs font-semibold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{evt.title}</h4>
                      <div className="flex items-center gap-2 text-2xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {evt.location}
                        </span>
                        <span>&bull; Batches: {evt.eligibleBatches.join(', ')}</span>
                      </div>
                      {evt.notes && (
                        <p className="text-2xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                          {evt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {currentUser.role !== 'student' && onSaveEvent && <div className="flex gap-2"><button className="border p-2 rounded-lg" onClick={()=>setEditing(evt)}>Edit event</button><button className="border p-2 rounded-lg text-rose-700" onClick={()=>{if(window.confirm('Delete this event?'))onDeleteEvent?.(evt.id);}}>Delete event</button></div>}
                  {/* Right Action */}
                  {evt.opportunityId && onSelectOpportunity && (
                    <button
                      onClick={() => {
                        onClose();
                        onSelectOpportunity(evt.opportunityId!);
                      }}
                      className="inline-flex items-center gap-1 self-end sm:self-center px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors shrink-0 cursor-pointer"
                    >
                      <span>View Opportunity</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <p className="text-2xs">
            College Placement Notification Board &bull; Proctored Testing Guidelines Apply
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
