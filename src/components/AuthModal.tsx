import AccountForm from './AccountForm';
import { User, KYCSubmission } from '../types';
export default function AuthModal({ isOpen,onClose,onLoginSuccess }: { isOpen:boolean;onClose:()=>void;onLoginSuccess:(u:User)=>void;onRegisterStudentKyc?:(s:KYCSubmission)=>void }) {
 if (!isOpen) return null;
 return <div data-dialog="auth" role="dialog" aria-modal="true" aria-label="Auth" className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"><div className="bg-white p-6 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-auto"><button aria-label="Close account form" className="float-right p-2" onClick={onClose}>✕</button><h2 className="text-xl font-bold mb-5">Campus account</h2><AccountForm onLoginSuccess={u=>{onLoginSuccess(u);onClose();}}/></div></div>;
}
