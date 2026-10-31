import React, { useState, useEffect } from 'react';
import {
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  Key,
  Shield,
  ExternalLink,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';

interface RealEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  candidatePersonalEmail: string;
  corporateEmail: string;
  joiningBonusInr: number;
  laptopModel: string;
}

export const RealEmailModal: React.FC<RealEmailModalProps> = ({
  isOpen,
  onClose,
  candidateName,
  candidatePersonalEmail,
  corporateEmail,
  joiningBonusInr,
  laptopModel
}) => {
  const [smtpStatus, setSmtpStatus] = useState<any>(null);
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Dispatch state
  const [targetEmail, setTargetEmail] = useState(candidatePersonalEmail || 'your.personal@gmail.com');
  const [isSending, setIsSending] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'send' | 'credentials_guide'>('send');

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/onboarding/smtp-status');
      if (res.ok) {
        const d = await res.json();
        setSmtpStatus(d);
        if (d.smtpUser && d.smtpUser !== 'Not Configured') {
          setSmtpUser(d.smtpUser);
        }
        if (d.smtpHost) setSmtpHost(d.smtpHost);
        if (d.smtpPort) setSmtpPort(String(d.smtpPort));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      if (candidatePersonalEmail) {
        setTargetEmail(candidatePersonalEmail);
      }
    }
  }, [isOpen, candidatePersonalEmail]);

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/onboarding/configure-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpHost,
          smtpPort: parseInt(smtpPort) || 587,
          smtpUser,
          smtpPassword,
          smtpFromEmail: smtpUser,
          smtpFromName: 'EnterpriseFlow People Operations'
        })
      });

      if (res.ok) {
        const d = await res.json();
        setSaveSuccess(d.message || 'Credentials saved!');
        setTimeout(() => setSaveSuccess(null), 4000);
        fetchStatus();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDispatchRealEmail = async () => {
    if (!targetEmail.trim()) return;
    try {
      setIsSending(true);
      setDispatchResult(null);

      const res = await fetch('/api/onboarding/send-real-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: targetEmail.trim(),
          employeeName: candidateName || 'Rahul Verma',
          corporateEmail: corporateEmail || 'rahul.verma@enterpriseflow.corp',
          temporaryPassword: 'TempPass#2026@EF',
          employeeId: 'EF-IN-9812',
          joiningBonusInr: joiningBonusInr || 250000.0,
          laptopModel: laptopModel || 'Apple MacBook Pro 16" (M3 Max, 36GB RAM, 1TB SSD)',
          courierTrackingId: 'BD-IN-98214412',
          reportingManager: 'Alexander Sterling',
          dateOfJoining: '2026-11-15',
          department: 'Platform Engineering & DevOps',
          designation: 'Staff Cloud Infrastructure Engineer',
          workLocation: 'Bengaluru Tech Corridor'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDispatchResult(data);
      }
    } catch (e) {
      setDispatchResult({
        success: false,
        message: 'Network error connecting to email dispatcher backend'
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Real-World Company Email Dispatcher (SMTP)
              </h3>
              <p className="text-xs text-slate-500">
                Transmit actual welcome letters directly to candidates' personal Gmail or Outlook inboxes.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('send')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'send'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>1. Dispatch to Personal Email</span>
          </button>

          <button
            onClick={() => setActiveTab('credentials_guide')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'credentials_guide'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>2. SMTP Credentials & Setup Guide</span>
          </button>
        </div>

        {/* TAB 1: SEND REAL EMAIL */}
        {activeTab === 'send' && (
          <div className="space-y-4 text-xs">
            {/* Status notification */}
            <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
              smtpStatus?.isConfigured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}>
              <div className="mt-0.5 shrink-0">
                {smtpStatus?.isConfigured ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <div className="space-y-0.5">
                <div className="font-bold">
                  {smtpStatus?.isConfigured
                    ? `Ready to Send via ${smtpStatus.smtpUser}`
                    : 'Company SMTP Credentials Not Yet Saved'}
                </div>
                <div className="text-[11px] opacity-90">
                  {smtpStatus?.isConfigured
                    ? 'Emails are transmitted live over TLS via your authenticated company email address.'
                    : 'Switch to the "SMTP Credentials & Setup Guide" tab above to enter your company sender email and 16-character Google App Password.'}
                </div>
              </div>
            </div>

            {/* Recipient Input */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Target Personal Mailbox Address (Candidate's Real Inbox) *:
              </label>
              <input
                type="email"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                placeholder="Enter personal Gmail, Outlook, or Yahoo email (e.g. rahul.verma@gmail.com)..."
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-400 block">
                Tip: Enter your own personal email address here to immediately receive and inspect the real onboarding welcome package!
              </span>
            </div>

            {/* Payload summary */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-[11px]">
              <div className="font-bold text-slate-800">What will be transmitted in the email:</div>
              <div className="text-slate-600">• Official Candidate Name: <strong>{candidateName || 'Rahul Verma'}</strong></div>
              <div className="text-slate-600">• Corporate SSO Email: <strong>{corporateEmail || 'rahul.verma@enterpriseflow.corp'}</strong></div>
              <div className="text-slate-600">• Temporary Password: <strong>TempPass#2026@EF</strong></div>
              <div className="text-slate-600">• Workstation: <strong>{laptopModel || 'Apple MacBook Pro 16"'}</strong></div>
              <div className="text-slate-600">• Joining Bonus (₹): <strong>₹{(joiningBonusInr || 250000).toLocaleString('en-IN')}</strong></div>
              <div className="text-slate-600">• Blue Dart Courier Tracking: <strong>BD-IN-98214412</strong></div>
            </div>

            {/* Action button */}
            <button
              disabled={isSending}
              onClick={handleDispatchRealEmail}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className={`w-4 h-4 ${isSending ? 'animate-bounce' : ''}`} />
              <span>{isSending ? 'Connecting to SMTP Server & Transmitting...' : '🚀 Dispatch Real Welcome Email via SMTP'}</span>
            </button>

            {/* Results feedback */}
            {dispatchResult && (
              <div className={`p-4 rounded-2xl border text-xs space-y-1 ${
                dispatchResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}>
                <div className="font-bold flex items-center gap-1.5">
                  {dispatchResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{dispatchResult.success ? 'Delivered to Real Inbox!' : 'Delivery Incomplete'}</span>
                </div>
                <div className="text-[11px] font-mono">{dispatchResult.message}</div>
                {dispatchResult.error && (
                  <div className="text-[10px] text-rose-700 font-mono mt-1">
                    Error trace: {dispatchResult.error}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CREDENTIALS & SETUP GUIDE */}
        {activeTab === 'credentials_guide' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-950 space-y-2">
              <div className="font-bold text-blue-900 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-700" />
                <span>What credentials are required to send real emails?</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                To send emails from a common company address without using a fake simulator, SMTP relies on an authenticated company mailbox. Here is what is needed:
              </p>
              <div className="space-y-1 font-mono text-[11px] bg-white/70 p-3 rounded-xl border border-blue-100">
                <div><strong>1. SMTP_USER:</strong> Your Company Email (e.g. <code>hr-onboarding@yourcompany.com</code> or your Gmail)</div>
                <div><strong>2. SMTP_PASSWORD:</strong> 16-character Google App Password (or Office365 password)</div>
                <div><strong>3. SMTP_HOST:</strong> <code>smtp.gmail.com</code> (Gmail) or <code>smtp.office365.com</code> (Outlook)</div>
                <div><strong>4. SMTP_PORT:</strong> <code>587</code> (standard TLS)</div>
              </div>
            </div>

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{saveSuccess}</span>
              </div>
            )}

            {/* Quick credentials save form */}
            <form onSubmit={handleSaveCredentials} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="font-bold text-slate-800 text-xs">
                Enter & Save SMTP Credentials:
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Company Sender Email (SMTP_USER) *</label>
                <input
                  type="email"
                  required
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="careers@yourcompany.com or your.name@gmail.com"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">App Password (SMTP_PASSWORD) *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                    placeholder="16-character App Password (e.g. abcd efgh ijkl mnop)"
                    className="w-full p-2.5 pr-10 rounded-xl border border-slate-200 bg-white font-mono text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">SMTP Host</label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">SMTP Port</label>
                  <input
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white font-mono text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm"
              >
                Save & Connect Credentials
              </button>
            </form>

            {/* How to generate Google App Password */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-amber-950 space-y-1.5 text-[11px]">
              <div className="font-bold text-amber-900">How to generate a 16-character Google App Password:</div>
              <ol className="list-decimal pl-4 space-y-1 text-amber-900">
                <li>Log in to your Google Account at <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="underline font-bold">myaccount.google.com/security</a>.</li>
                <li>Ensure <strong>2-Step Verification</strong> is enabled.</li>
                <li>In the top search box, type <strong>"App Passwords"</strong>.</li>
                <li>Give the app a name like <em>"EnterpriseFlow Onboarding"</em> and click <strong>Create</strong>.</li>
                <li>Copy the 16-character code (format: <code>xxxx xxxx xxxx xxxx</code>) and paste it into the password box above!</li>
              </ol>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
