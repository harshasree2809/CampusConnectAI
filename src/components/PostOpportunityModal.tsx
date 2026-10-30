import { availableBatches } from '../utils/academic';
import { useState, useEffect, FormEvent } from 'react';
import { Opportunity, OpportunityCategory, User } from '../types';
import { X, Sparkles, Building2, Calendar, Link2, DollarSign, MapPin } from 'lucide-react';

interface PostOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Opportunity>) => Promise<void>;
  initialData?: Opportunity | null;
  currentUser: User;
}

const AVAILABLE_BATCHES = availableBatches;
const AVAILABLE_BRANCHES = ['All Branches', 'CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil'];

export default function PostOpportunityModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  currentUser,
}: PostOpportunityModalProps) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState<OpportunityCategory>('internship');
  const [description, setDescription] = useState('');
  const [eligibilityBatches, setEligibilityBatches] = useState<number[]>([availableBatches[0]]);
  const [eligibleBranches, setEligibleBranches] = useState<string[]>(['All Branches']);
  const [stipendOrSalary, setStipendOrSalary] = useState('');
  const [location, setLocation] = useState('Remote');
  const [applyUrl, setApplyUrl] = useState('');
  const [saveError,setSaveError]=useState('');
  const [saving,setSaving]=useState(false);
  const [deadline,setDeadline]=useState('');
  const [amount,setAmount]=useState('');
  const [currency,setCurrency]=useState('INR');
  const [period,setPeriod]=useState('month');
  const [deadlineNumberDays, setDeadlineNumberDays] = useState(3);
  const [preparationTips, setPreparationTips] = useState('');

  useEffect(() => {
    const local = (iso:string) => { const d=new Date(iso);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16); };
    setSaveError('');
    setDeadline(local(initialData?.deadline || new Date(Date.now()+3*86400000).toISOString()));
    setAmount(initialData?.compensationAmount == null ? '' : String(initialData.compensationAmount));
    setCurrency(initialData?.compensationCurrency || 'INR');setPeriod(initialData?.compensationPeriod || 'month');
    if (initialData) {
      setTitle(initialData.title);
      setCompany(initialData.company);
      setCategory(initialData.category);
      setDescription(initialData.description);
      setEligibilityBatches(initialData.eligibilityBatches);
      setEligibleBranches(initialData.eligibleBranches);
      setStipendOrSalary(initialData.stipendOrSalary);
      setLocation(initialData.location);
      setApplyUrl(initialData.applyUrl);
      setPreparationTips(initialData.preparationTips || '');
    } else {
      // Default reset
      setTitle('');
      setCompany('');
      setCategory('internship');
      setDescription('');
      setEligibilityBatches([currentUser.graduationYear || availableBatches[0]]);
      setEligibleBranches(['All Branches']);
      setStipendOrSalary('');
      setLocation('Remote');
      setApplyUrl('');
      setDeadlineNumberDays(3);
      setPreparationTips('');
    }
  }, [initialData, isOpen, currentUser.id]);

  if (!isOpen) return null;

  const toggleBatch = (batch: number) => {
    if (eligibilityBatches.includes(batch)) {
      if (eligibilityBatches.length > 1) {
        setEligibilityBatches(eligibilityBatches.filter((b) => b !== batch));
      }
    } else {
      setEligibilityBatches([...eligibilityBatches, batch].sort());
    }
  };

  const toggleBranch = (branch: string) => {
    if (branch === 'All Branches') {
      setEligibleBranches(['All Branches']);
      return;
    }
    const current = eligibleBranches.filter((b) => b !== 'All Branches');
    if (current.includes(branch)) {
      const next = current.filter((b) => b !== branch);
      setEligibleBranches(next.length === 0 ? ['All Branches'] : next);
    } else {
      setEligibleBranches([...current, branch]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim() || !applyUrl.trim()) return;

    // Calculate deadline ISO
    const deadlineDate = new Date(Date.now() + deadlineNumberDays * 24 * 60 * 60 * 1000).toISOString();

    setSaving(true);setSaveError('');
    try { await onSubmit({
      title: title.trim(),
      company: company.trim(),
      category,
      description: description.trim(),
      eligibilityBatches,
      eligibleBranches,
      stipendOrSalary: stipendOrSalary.trim() || 'Undisclosed / Free',
      location: location.trim() || 'Remote',
      applyUrl: applyUrl.trim().startsWith('http') ? applyUrl.trim() : `https://${applyUrl.trim()}`,
      deadline: new Date(deadline).toISOString(),
      compensationAmount: amount === '' ? null : Number(amount),compensationCurrency:currency,compensationPeriod:period,
      preparationTips: preparationTips.trim() || undefined,
    });
    onClose();
    } catch(e:any) {setSaveError(e.message);} finally {setSaving(false);}
  };

  return (
    <div data-dialog="post" role="dialog" aria-modal="true" aria-label="PostOpportunity" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {initialData ? 'Edit Opportunity Message' : 'Share New Opportunity'}
            </h3>
            <p className="text-xs text-slate-500">
              Posting as <span className="font-semibold text-slate-800">{currentUser.name}</span> ({currentUser.role})
            </p>
          </div>
          <button aria-label="Close dialog"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Opportunity Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'internship', label: 'Internship' },
                { id: 'job', label: 'Full-Time Job' },
                { id: 'certificate', label: 'Free Certificate' },
                { id: 'hackathon', label: 'Hackathon' },
                { id: 'knowledge', label: 'Knowledge / Notes' },
              ].map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.id as OpportunityCategory)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-center ${
                    category === c.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Role Title & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Role / Opportunity Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Software Engineer Intern 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company / Organization *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Google India, Microsoft, Coursera"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Stipend & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stipend / CTC / Reward
              </label>
              <input
                type="text"
                placeholder="e.g. ₹40,000/mo, 100% Free, or 12 LPA"
                value={stipendOrSalary}
                onChange={(e) => setStipendOrSalary(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Work Mode / Location
              </label>
              <input
                type="text"
                placeholder="e.g. Remote, Hybrid, Bengaluru, On-Campus"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Application Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Direct Application / Registration URL *
            </label>
            <input
              type="url"
              required
              placeholder="https://careers.company.com/apply"
              value={applyUrl}
              onChange={(e) => setApplyUrl(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white"
            />
          </div>

          {/* Eligibility: Batches */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Eligible Graduating Batches *
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_BATCHES.map((batch) => {
                const active = eligibilityBatches.includes(batch);
                return (
                  <button
                    type="button"
                    key={batch}
                    onClick={() => toggleBatch(batch)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {batch} Batch
                  </button>
                );
              })}
            </div>
          </div>

          {/* Eligibility: Branches */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Eligible Departments / Branches *
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_BRANCHES.map((branch) => {
                const active = eligibleBranches.includes(branch);
                return (
                  <button
                    type="button"
                    key={branch}
                    onClick={() => toggleBranch(branch)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      active
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {branch}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block text-sm font-semibold">Application deadline (your local time)<input className="block w-full border rounded-xl p-2 mt-1" type="datetime-local" required value={deadline} onChange={e=>setDeadline(e.target.value)}/></label>
          <fieldset className="border p-3 rounded-xl"><legend className="text-sm font-semibold">Numeric compensation (optional, used for sorting)</legend><div className="flex flex-wrap gap-2"><input aria-label="Compensation amount" className="border p-2 rounded-lg" type="number" min="0" step="0.01" value={amount} placeholder="Amount" onChange={e=>setAmount(e.target.value)}/><select aria-label="Currency" className="border p-2 rounded-lg" value={currency} onChange={e=>setCurrency(e.target.value)}>{['INR','USD','EUR'].map(c=><option key={c}>{c}</option>)}</select><select aria-label="Payment period" className="border p-2 rounded-lg" value={period} onChange={e=>setPeriod(e.target.value)}><option value="month">Per month</option><option value="year">Per year</option><option value="one_time">One-time</option></select></div><p className="text-xs text-slate-500 mt-2">Sort groups by currency and annualizes monthly amounts. One-time amounts stay as entered.</p></fieldset>
          {saveError && <p role="alert" className="text-rose-700">{saveError}</p>}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Opportunity Details / Job Description *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Outline role responsibilities, eligibility criteria, interview rounds, or skills required..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white"
            />
          </div>

          {/* Helpful Tips for Peer Students */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Student Preparation Tips (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Tips for test preparation, what to review (e.g. DSA, SQL, Aptitude), or advice from placed batchmates..."
              value={preparationTips}
              onChange={(e) => setPreparationTips(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white"
            />
          </div>

          {/* Submit Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={saving}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
            >
              {initialData ? 'Update Message' : 'Publish Opportunity'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
