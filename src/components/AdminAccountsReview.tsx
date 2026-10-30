import React, { useState } from 'react';
import { User } from '../types';
import { 
  Users, CheckCircle2, XCircle, Clock, Trash2, 
  ChevronDown, ChevronUp, ShieldCheck, GraduationCap, 
  Briefcase, AlertCircle 
} from 'lucide-react';

interface AdminAccountsReviewProps {
  users: User[];
  onDecision: (userId: string, status: 'approved' | 'rejected') => void;
  onDeleteUser: (userId: string) => void;
  onOpenKycPanel?: () => void;
}

export default function AdminAccountsReview({
  users,
  onDecision,
  onDeleteUser,
  onOpenKycPanel,
}: AdminAccountsReviewProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('all');

  const nonAdminUsers = users.filter((u) => u.role !== 'admin');
  const pendingCount = nonAdminUsers.filter((u) => u.verificationStatus === 'pending').length;
  const approvedCount = nonAdminUsers.filter((u) => u.verificationStatus === 'approved').length;
  const rejectedCount = nonAdminUsers.filter((u) => u.verificationStatus === 'rejected').length;

  const filteredUsers = nonAdminUsers.filter((u) => {
    if (filter === 'pending') return u.verificationStatus === 'pending';
    if (filter === 'approved') return u.verificationStatus === 'approved';
    if (filter === 'rejected') return u.verificationStatus === 'rejected';
    return true;
  });

  const handleDelete = (user: User) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently remove ${user.name} (${user.email})? This will delete their account and records from MongoDB.`
    );
    if (confirmed) {
      onDeleteUser(user.id);
    }
  };

  return (
    <section className="bg-white border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Header Toggle */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between cursor-pointer select-none group py-1"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-colors">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Review &amp; Manage Accounts
                </h3>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {nonAdminUsers.length} total
                </span>
                {pendingCount > 0 && (
                  <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {pendingCount} Pending Approval
                  </span>
                )}
              </div>
              <p className="text-2xs text-slate-500">
                Approve, reject, or permanently remove registered students and faculty
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-600">
            <span className="text-2xs font-semibold hidden sm:inline">
              {isOpen ? 'Collapse' : 'Expand'}
            </span>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {/* Collapsible Content */}
        {isOpen && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-2xs font-semibold">
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filter === 'all'
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({nonAdminUsers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    filter === 'pending'
                      ? 'bg-amber-500 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Pending</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-3xs ${filter === 'pending' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {pendingCount}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('approved')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    filter === 'approved'
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Approved</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-3xs ${filter === 'approved' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {approvedCount}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('rejected')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    filter === 'rejected'
                      ? 'bg-rose-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Rejected</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-3xs ${filter === 'rejected' ? 'bg-rose-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {rejectedCount}
                  </span>
                </button>
              </div>

              {onOpenKycPanel && (
                <button
                  type="button"
                  onClick={onOpenKycPanel}
                  className="text-2xs font-bold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Open Student ID KYC Queue</span>
                </button>
              )}
            </div>

            {/* User List */}
            {filteredUsers.length === 0 ? (
              <div className="py-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                No accounts found in this category.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {filteredUsers.map((user) => {
                  const isApproved = user.verificationStatus === 'approved';
                  const isPending = user.verificationStatus === 'pending';
                  const isRejected = user.verificationStatus === 'rejected';

                  return (
                    <div
                      key={user.id}
                      className="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col justify-between gap-3 hover:border-slate-300 hover:shadow-xs transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            user.role === 'faculty' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {user.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900 leading-tight">
                                {user.name}
                              </h4>
                              <span className={`text-3xs font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                                user.role === 'faculty' 
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              }`}>
                                {user.role}
                              </span>
                            </div>
                            <p className="text-2xs text-slate-500 truncate max-w-[200px] sm:max-w-[260px]">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isApproved && (
                            <span className="inline-flex items-center gap-1 text-3xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Approved
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 text-3xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-500" />
                              Pending
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 text-3xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Metadata tags */}
                      <div className="flex flex-wrap items-center gap-1.5 text-3xs text-slate-600">
                        {user.department && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100">
                            Dept: {user.department}
                          </span>
                        )}
                        {user.rollNumber && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono">
                            Roll: {user.rollNumber}
                          </span>
                        )}
                        {user.graduationYear && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100">
                            Batch: {user.graduationYear}
                          </span>
                        )}
                        {user.verificationMethod === 'id_card_kyc' && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-medium">
                            ID Card KYC
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                        <div className="flex items-center gap-1.5">
                          {!isApproved ? (
                            <button
                              type="button"
                              onClick={() => onDecision(user.id, 'approved')}
                              className="px-2.5 py-1 text-2xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Approve
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onDecision(user.id, 'rejected')}
                              className="px-2.5 py-1 text-2xs font-medium text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                              title="Revoke access"
                            >
                              Revoke
                            </button>
                          )}

                          {!isRejected && !isApproved && (
                            <button
                              type="button"
                              onClick={() => onDecision(user.id, 'rejected')}
                              className="px-2.5 py-1 text-2xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          )}
                        </div>

                        {/* Delete / Remove Account Button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
                          className="px-2 py-1 text-2xs font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title="Permanently remove user from MongoDB"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
