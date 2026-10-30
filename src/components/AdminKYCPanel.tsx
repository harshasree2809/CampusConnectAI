import { useState } from 'react';
import { KYCSubmission } from '../types';
import { ShieldCheck, X, CheckCircle2, XCircle, AlertCircle, FileText, UserCheck, Video } from 'lucide-react';

interface AdminKYCPanelProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: KYCSubmission[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function AdminKYCPanel({
  isOpen,
  onClose,
  submissions,
  onApprove,
  onReject,
}: AdminKYCPanelProps) {
  const [selectedId, setSelectedId] = useState<string>(submissions[0]?.id || '');
  const activeSubmission = submissions.find((s) => s.id === selectedId) || submissions[0] || null;

  if (!isOpen) return null;

  return (
    <div data-dialog="kyc" role="dialog" aria-modal="true" aria-label="AdminKYCPanel" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Admin KYC Verification Queue</h3>
              <p className="text-2xs text-slate-500">
                Review and approve student ID card + manual document verification
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

        {/* Content Layout */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* Submissions List Column */}
          <div className="w-full md:w-80 border-r border-slate-100 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
            <div className="p-3 bg-slate-100/70 text-2xs font-semibold text-slate-600 uppercase tracking-wider flex items-center justify-between">
              <span>All Submissions ({submissions.length})</span>
              <span className="text-purple-700 font-bold">
                {submissions.filter((s) => s.status === 'pending').length} Pending
              </span>
            </div>

            {submissions.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No submissions in queue
              </div>
            ) : (
              submissions.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => setSelectedId(sub.id)}
                  className={`p-3.5 cursor-pointer hover:bg-slate-100/80 transition-colors ${
                    activeSubmission?.id === sub.id ? 'bg-white font-medium shadow-2xs border-l-4 border-purple-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{sub.studentName}</p>
                      <p className="text-2xs text-slate-500">{sub.rollNumber} • {sub.department}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-3xs font-bold uppercase flex items-center gap-1 ${
                      sub.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : sub.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {sub.status === 'approved' && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />}
                      {sub.status === 'approved' ? 'Approved' : sub.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-3xs text-slate-400">
                    <span>Batch: {sub.passingYear}</span>
                    <span>Biometric Match: {sub.matchScore}%</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Submission Details Column */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-white">
            {activeSubmission ? (
              <div className="space-y-4">
                
                {/* Approved status alert banner if approved */}
                {activeSubmission.status === 'approved' && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-300/80 rounded-2xl flex items-center justify-between shadow-2xs animate-in fade-in duration-150">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-950">Student Approved by Placement Admin</p>
                        <p className="text-2xs text-emerald-700">Documents approved by an administrator. Account access is active.</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-200/90 text-emerald-900 rounded-lg text-2xs font-extrabold uppercase tracking-wide border border-emerald-300">
                      ✓ Approved
                    </span>
                  </div>
                )}

                {/* Basic student card */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{activeSubmission.studentName}</h4>
                    <p className="text-xs text-slate-600">
                      Roll No: <span className="font-semibold text-slate-900">{activeSubmission.rollNumber}</span> • {activeSubmission.department}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Graduation Year on ID: <strong className="text-emerald-700">{activeSubmission.passingYear} (Valid Currently Graduating Batch)</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      activeSubmission.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Manual review · {activeSubmission.status}</span>
                    </span>
                    <p className="text-3xs text-slate-400 mt-1">Submitted: {activeSubmission.submittedAt}</p>
                  </div>
                </div>

                {/* Proof Artifacts: ID Card + Passport Photo + Video Check */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* ID Card preview */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <p className="text-xs font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <span>Uploaded College ID Card (Proof)</span>
                    </p>
                    <div className="h-44 rounded-xl overflow-hidden bg-slate-200 border border-slate-300">
                      <img
                        src={activeSubmission.idCardUrl}
                        alt="College ID Card"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Passport Photo & Video Status */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-blue-600" />
                        <span>Passport Photograph</span>
                      </p>
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-200 border border-slate-300">
                        <img
                          src={activeSubmission.passportPhotoUrl}
                          alt="Student Passport"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                        <Video className="w-4 h-4 text-emerald-600" />
                        <span>Document verification</span>
                      </div>
                      <p className="text-2xs text-emerald-700 mt-0.5">
                        Review the submitted ID and photograph. No automatic biometric or video match is performed.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Admin Decision Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  {activeSubmission.status === 'approved' ? (
                    <div className="flex items-center gap-3">
                      <span className="px-5 py-2.5 text-xs font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 rounded-xl flex items-center gap-2 shadow-2xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Approved</span>
                      </span>
                      <button
                        onClick={() => onReject(activeSubmission.id)}
                        className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        Revoke Approval
                      </button>
                    </div>
                  ) : activeSubmission.status === 'rejected' ? (
                    <div className="flex items-center gap-3">
                      <span className="px-4 py-2 text-xs font-bold text-rose-800 bg-rose-100 border border-rose-300 rounded-xl flex items-center gap-2 shadow-2xs">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Rejected</span>
                      </span>
                      <button
                        onClick={() => onApprove(activeSubmission.id)}
                        className="px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Re-Approve</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onReject(activeSubmission.id)}
                        className="px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject Verification</span>
                      </button>

                      <button
                        onClick={() => onApprove(activeSubmission.id)}
                        className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve &amp; Grant Student Access</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="text-center py-20 text-xs text-slate-400">
                Select a submission from the left list to review
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
