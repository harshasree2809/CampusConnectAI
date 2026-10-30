import { useEffect, useState, FormEvent } from 'react';
import { api, post } from '../api';
import { User } from '../types';
import { availableBatches } from '../utils/academic';

export default function AccountForm({ onLoginSuccess }: { onLoginSuccess: (user: User) => void }) {
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [fields, setFields] = useState({ name: '', email: '', password: '', role: 'student', method: 'college_email', department: 'CSE', graduationYear: availableBatches[1], rollNumber: '', phone: '' });
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [error, setError] = useState('');
  const [domains, setDomains] = useState<string[]>([]);
  useEffect(() => { api('/config').then(c => setDomains(c.collegeDomains)).catch(e => setError(e.message)); }, []);
  const change = (key: string, value: any) => { setFields(f => ({ ...f, [key]: value, ...(key === 'role' && value === 'faculty' ? {method:'college_email'} : {}) })); };
  const submit = async (e: FormEvent) => { e.preventDefault(); setBusy(true); setError(''); try { const r = await post(mode === 'login' ? '/auth/login' : '/auth/register', fields); onLoginSuccess(r.user); } catch(e: any) { setError(e.message); } finally { setBusy(false); } };
  const input = (key: keyof typeof fields, label: string, type = 'text', required = true) => <label className="block text-sm font-semibold">{label}<input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal" type={type} required={required} value={fields[key]} maxLength={key === 'password' ? 128 : 254} minLength={key === 'password' && mode === 'register' ? 12 : undefined} autoComplete={key === 'password' ? mode === 'login' ? 'current-password' : 'new-password' : key === 'email' ? 'email' : undefined} onChange={e => change(key,e.target.value)} /></label>;
  return <div className="space-y-4"><div className="flex gap-2">{(['login','register'] as const).map(m => <button key={m} type="button" onClick={() => {setMode(m);setError('');setMessage('');}} className={`rounded-xl px-4 py-2 font-bold ${mode === m ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>{m === 'login' ? 'Sign in' : 'Create account'}</button>)}</div>
    <form onSubmit={submit} className="space-y-3">
      {mode === 'register' && <>{input('name','Full name')}<label className="block text-sm font-semibold">Role<select className="block mt-1 w-full border rounded-xl p-2" value={fields.role} onChange={e => change('role',e.target.value)}><option value="student">Student</option><option value="faculty">Faculty</option></select></label>
      <label className="block text-sm font-semibold">Verification method<select className="block mt-1 w-full border rounded-xl p-2" value={fields.method} onChange={e => change('method',e.target.value)}><option value="college_email">College email + administrator approval</option>{fields.role === 'student' && <option value="id_card_kyc">Personal email + college ID review</option>}</select></label>
      {fields.role === 'student' && <>{input('rollNumber','Roll number')}<label className="block text-sm font-semibold">Graduation year<select className="block mt-1 w-full border rounded-xl p-2" value={fields.graduationYear} onChange={e => change('graduationYear',Number(e.target.value))}>{availableBatches.map(y => <option key={y}>{y}</option>)}</select></label></>}
      <label className="block text-sm font-semibold">Department<select className="block mt-1 w-full border rounded-xl p-2" value={fields.department} onChange={e => change('department',e.target.value)}>{['CSE','IT','ECE','EEE','Mechanical','Civil'].map(d => <option key={d}>{d}</option>)}</select></label>{input('phone','Phone (optional; not verified)','tel',false)}
      <p className="text-xs text-slate-600">Allowed college email domains: {domains.join(', ') || 'Not configured yet. Ask your administrator.'}. Every account requires administrator approval.</p></>}
      {input('email','Email address','email')}{input('password',mode === 'register' ? 'Password (at least 12 characters)' : 'Password','password')}
      {error && <p role="alert" className="text-sm text-rose-700 bg-rose-50 p-3 rounded-xl">{error}</p>}{message && <p role="status" className="text-sm text-blue-700">{message}</p>}
      <button disabled={busy} className="w-full bg-slate-900 text-white rounded-xl p-3 font-bold disabled:opacity-50">{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
    </form></div>;
}
