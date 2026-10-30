import { csv, downloadFile } from '../utils/exports';
import { useState, useMemo } from 'react';
import { StudentApplication, ApplicationStatus, User, Opportunity } from '../types';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Download, 
  Search, 
  X, 
  Trash2, 
  Building2, 
  Award,
  Filter,
  Check,
  ChevronRight,
  Plus
} from 'lucide-react';

interface ApplicationsTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: StudentApplication[];
  currentUser: User;
  opportunities: Opportunity[];
  onUpdateStatus: (applicationId: string, status: ApplicationStatus, notes?: string, nextStepDate?: string) => void;
  onDeleteApplication: (applicationId: string) => void;
  onOpenOpportunity?: (opp: Opportunity) => void;
}

export default function ApplicationsTrackerModal({
  isOpen,
  onClose,
  applications,
  currentUser,
  opportunities,
  onUpdateStatus,
  onDeleteApplication,
  onOpenOpportunity,
}: ApplicationsTrackerModalProps) {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editNextStep, setEditNextStep] = useState('');

  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'faculty';

  // Filter applications: if student, show only their own; if admin, show all
  const filteredApps = useMemo(() => {
    return applications
      .filter((app) => {
        if (!isAdmin && app.studentId !== currentUser.id) return false;
        if (selectedStatusFilter !== 'all' && app.status !== selectedStatusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCompany = app.company.toLowerCase().includes(q);
          const matchTitle = app.opportunityTitle.toLowerCase().includes(q);
          const matchStudent = app.studentName.toLowerCase().includes(q);
          const matchRoll = app.studentRoll.toLowerCase().includes(q);
          return matchCompany || matchTitle || matchStudent || matchRoll;
        }
        return true;
      })
      .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
  }, [applications, isAdmin, currentUser.id, selectedStatusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const relevant = isAdmin ? applications : applications.filter(a => a.studentId === currentUser.id);
    return {
      total: relevant.length,
      assessment: relevant.filter(a => a.status === 'assessment' || a.status === 'shortlisted').length,
      interview: relevant.filter(a => a.status === 'interview').length,
      offered: relevant.filter(a => a.status === 'offered').length,
    };
  }, [applications, isAdmin, currentUser.id]);

  if (!isOpen) return null;

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'applied':
        return { label: 'Applied', color: 'bg-slate-100 text-slate-700 border-slate-300' };
      case 'shortlisted':
        return { label: 'Resume Shortlisted', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'assessment':
        return { label: 'Assessment Scheduled', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'interview':
        return { label: 'Interview Round', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'offered':
        return { label: 'Selected / Offer Received', color: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold' };
      case 'rejected':
        return { label: 'Not Selected', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    }
  };

  const handleExportCSV = () => {
    const headers = ['Company', 'Opportunity Title', 'Applied Date', 'Status', 'App Number', 'Student Name', 'Roll Number', 'Branch', 'Next Step', 'Notes'];
    const rows = filteredApps.map(a => [a.company,a.opportunityTitle,a.appliedDate,a.status,a.applicationNumber,a.studentName,a.studentRoll,a.studentBranch,a.nextStepDate,a.notes]);
    downloadFile(csv([headers,...rows]),`campus-applications-${new Date().toISOString().slice(0,10)}.csv`,'text/csv;charset=utf-8;');
  };

  const startEdit = (app: StudentApplication) => {
    setEditingAppId(app.id);
    setEditNotes(app.notes || '');
    setEditNextStep(app.nextStepDate || '');
  };

  const saveEdit = (app: StudentApplication) => {
    onUpdateStatus(app.id, app.status, editNotes, editNextStep);
    setEditingAppId(null);
  };

  return (
    <div data-dialog="tracker" role="dialog" aria-modal="true" aria-label="ApplicationsTracker" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {isAdmin ? 'Campus Placement Applications & Candidate Tracker' : 'My Job & Internship Applications Tracker'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-3xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {filteredApps.length} Active Records
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {isAdmin ? 'Monitor self-reported candidate progression through screening, OAs, and interview rounds' : 'Self-reported tracking only. Submit applications separately on the employer website.'}
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

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 bg-slate-50 border-b border-slate-200 text-xs">
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-2xs text-slate-500 font-semibold uppercase">Total Applications</span>
            <p className="text-xl font-black text-slate-900 mt-0.5">{stats.total}</p>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-purple-200 shadow-2xs">
            <span className="text-2xs text-purple-700 font-semibold uppercase">Assessment Stage</span>
            <p className="text-xl font-black text-purple-900 mt-0.5">{stats.assessment}</p>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-amber-200 shadow-2xs">
            <span className="text-2xs text-amber-700 font-semibold uppercase">Interview Scheduled</span>
            <p className="text-xl font-black text-amber-900 mt-0.5">{stats.interview}</p>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-emerald-200 shadow-2xs">
            <span className="text-2xs text-emerald-700 font-semibold uppercase">Offers / Selected</span>
            <p className="text-xl font-black text-emerald-700 mt-0.5">{stats.offered}</p>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="p-4 sm:px-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search company, drive title, or student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'applied', 'shortlisted', 'assessment', 'interview', 'offered'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-colors cursor-pointer ${
                  selectedStatusFilter === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'all' ? 'All Statuses' : st}
              </button>
            ))}

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs ml-auto"
              title="Download applications in CSV format"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Applications List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 divide-y divide-slate-100">
          {filteredApps.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Briefcase className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No applications found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Explore verified opportunities on the home feed and click "Mark Applied" to begin tracking your recruitment journey!
              </p>
            </div>
          ) : (
            filteredApps.map((app) => {
              const statusBadge = getStatusBadge(app.status);
              const isEditing = editingAppId === app.id;
              const matchingOpp = opportunities.find(o => o.id === app.opportunityId);

              return (
                <div key={app.id} className="pt-3 first:pt-0 bg-white hover:bg-slate-50/50 p-4 rounded-2xl border border-slate-200 transition-all space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 hover:text-indigo-900">
                          {app.opportunityTitle}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-semibold border ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {app.company}
                        </span>
                        <span>• Applied on {app.appliedDate}</span>
                        {app.applicationNumber && (
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded text-2xs font-mono">
                            Ref: {app.applicationNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Advance Dropdown / Buttons */}
                    <div className="flex items-center gap-1.5 self-start">
                      <select
                        value={app.status}
                        onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                        className="text-xs font-semibold py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 focus:outline-hidden cursor-pointer"
                        title="Change application recruitment stage"
                      >
                        <option value="applied">Applied</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="assessment">Assessment</option>
                        <option value="interview">Interview</option>
                        <option value="offered">Offered / Selected</option>
                        <option value="rejected">Rejected</option>
                      </select>

                      <button
                        onClick={() => onDeleteApplication(app.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Withdraw / Remove tracking"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Student Details (if admin) */}
                  {isAdmin && (
                    <div className="text-2xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-slate-600">
                      <span>Candidate: <strong>{app.studentName}</strong> ({app.studentRoll})</span>
                      <span>Branch: <strong>{app.studentBranch || 'Engineering'}</strong> &bull; Batch: <strong>{app.studentBatch || 2026}</strong></span>
                      <span>Email: <code className="text-slate-800">{app.studentEmail}</code></span>
                    </div>
                  )}

                  {/* Next Step & Notes */}
                  {isEditing ? (
                    <div className="space-y-2 p-3 bg-indigo-50/50 rounded-xl border border-indigo-200">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          placeholder="Upcoming date & round (e.g. Assessment: Sept 14, 6 PM)"
                          value={editNextStep}
                          onChange={(e) => setEditNextStep(e.target.value)}
                          className="flex-1 text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Personal interview notes, topics revised, preparation links..."
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingAppId(null)}
                          className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(app)}
                          className="px-3 py-1 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                        >
                          Save Notes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <div className="space-y-1">
                        {app.nextStepDate ? (
                          <p className="font-semibold text-purple-900 flex items-center gap-1.5 text-2xs">
                            <Clock className="w-3.5 h-3.5 text-purple-600" />
                            <span>Next Step: {app.nextStepDate}</span>
                          </p>
                        ) : (
                          <p className="text-slate-400 text-2xs italic">No next round scheduled yet</p>
                        )}
                        {app.notes && (
                          <p className="text-2xs text-slate-600">
                            <strong>Note:</strong> {app.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(app)}
                          className="text-2xs font-semibold text-slate-700 hover:text-slate-900 underline"
                        >
                          {app.notes || app.nextStepDate ? 'Edit Schedule/Notes' : '+ Add Schedule/Notes'}
                        </button>

                        {matchingOpp && onOpenOpportunity && (
                          <button
                            onClick={() => {
                              onClose();
                              onOpenOpportunity(matchingOpp);
                            }}
                            className="inline-flex items-center gap-1 text-2xs font-bold text-indigo-700 hover:text-indigo-900"
                          >
                            <span>View Drive</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <p className="text-2xs">
            Directly synced with Central Campus Placement Cell Records
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
