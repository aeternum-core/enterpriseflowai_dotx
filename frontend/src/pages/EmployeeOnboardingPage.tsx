import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Laptop,
  Gift,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Truck,
  Building,
  Key,
  Clock,
  Send,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  RefreshCw,
  FileText,
  BadgeCheck,
  Calendar,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RealEmailModal } from '../components/onboarding/RealEmailModal';

interface EmployeeOnboardingPageProps {
  onNavigate: (path: string) => void;
}

export const EmployeeOnboardingPage: React.FC<EmployeeOnboardingPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [showRealEmailModal, setShowRealEmailModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'wizard' | 'mailbox' | 'roster'>('wizard');

  // Form State: Employee Personal Information
  const [fullName, setFullName] = useState('Rahul Verma');
  const [personalEmail, setPersonalEmail] = useState('rahul.verma@gmail.com');
  const [phoneNumber, setPhoneNumber] = useState('+91 98450 12345');
  const [dateOfJoining, setDateOfJoining] = useState('2026-11-15');
  const [designation, setDesignation] = useState('Staff Cloud Infrastructure Engineer');
  const [department, setDepartment] = useState('Platform Engineering & DevOps');
  const [reportingManager, setReportingManager] = useState('Alexander Sterling');
  const [workLocation, setWorkLocation] = useState('Bengaluru Tech Corridor');
  const [annualSalaryInr, setAnnualSalaryInr] = useState('3200000');
  const [panCardNumber, setPanCardNumber] = useState('AAAPL8912K');
  const [aadhaarNumber, setAadhaarNumber] = useState('5412-8891-4921');

  // Form State: Equipment & Hardware
  const [laptopModel, setLaptopModel] = useState('Apple MacBook Pro 16" (M3 Max, 36GB RAM, 1TB SSD)');
  const [monitors, setMonitors] = useState('Dual 27" Dell UltraSharp 4K USB-C Displays');
  const [peripherals, setPeripherals] = useState('Logitech MX Master 3S Mouse + Mechanical Wireless Keyboard');
  const [securityKey, setSecurityKey] = useState('YubiKey 5C NFC Multi-Protocol Security Key');
  const [welcomeSwagKit, setWelcomeSwagKit] = useState('EnterpriseFlow Hoodie, Hydro Flask, Notebook & Tech Backpack');
  const [courierPartner, setCourierPartner] = useState('Bluedart Express Priority Dispatch');

  // Form State: Perks & Allowances
  const [joiningBonusInr, setJoiningBonusInr] = useState('250000');
  const [learningBudgetInr, setLearningBudgetInr] = useState('120000');
  const [healthInsuranceInr, setHealthInsuranceInr] = useState('1500000');
  const [homeOfficeAllowanceInr, setHomeOfficeAllowanceInr] = useState('50000');
  const [monthlyMealAllowanceInr, setMonthlyMealAllowanceInr] = useState('4500');
  const [paidTimeOffDays, setPaidTimeOffDays] = useState('28');

  // Auto-calculated corporate credentials
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Submission & Workflow State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<any | null>(null);

  // Personal Mailbox State
  const [mailboxMessages, setMailboxMessages] = useState<any[]>([]);
  const [selectedMail, setSelectedMail] = useState<any | null>(null);

  // Roster State
  const [rosterRecords, setRosterRecords] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-generate company email & username preview
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0] ? nameParts[0].toLowerCase() : 'employee';
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : 'corp';
  const generatedEmail = `${firstName}.${lastName}@enterpriseflow.corp`;
  const generatedUsername = `${firstName[0] || 'e'}${lastName}`;

  // Fetch onboarding records and mailbox on mount
  const fetchAllData = async () => {
    try {
      const [recordsRes, mailRes] = await Promise.all([
        fetch('/api/onboarding/records'),
        fetch('/api/onboarding/mailbox')
      ]);

      if (recordsRes.ok) {
        const d = await recordsRes.json();
        setRosterRecords(d.records || []);
      }
      if (mailRes.ok) {
        const d = await mailRes.json();
        const msgs = d.messages || [];
        setMailboxMessages(msgs);
        if (msgs.length > 0 && !selectedMail) {
          setSelectedMail(msgs[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load onboarding data:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Quick Preset Handlers
  const handlePresetSelect = (preset: 'cloud_arch' | 'ai_engineer' | 'lead_dev') => {
    if (preset === 'cloud_arch') {
      setFullName('Rahul Verma');
      setPersonalEmail('rahul.verma@gmail.com');
      setDesignation('Staff Cloud Infrastructure Engineer');
      setDepartment('Platform Engineering & DevOps');
      setReportingManager('Alexander Sterling');
      setWorkLocation('Bengaluru Tech Corridor');
      setAnnualSalaryInr('3200000');
      setJoiningBonusInr('250000');
      setLaptopModel('Apple MacBook Pro 16" (M3 Max, 36GB RAM, 1TB SSD)');
    } else if (preset === 'ai_engineer') {
      setFullName('Priya Sundaram');
      setPersonalEmail('priya.sundaram@outlook.com');
      setDesignation('Senior Staff AI Systems Engineer');
      setDepartment('AI Architecture & Machine Learning');
      setReportingManager('Sophia Chen');
      setWorkLocation('Mumbai BKC Operations Hub');
      setAnnualSalaryInr('3800000');
      setJoiningBonusInr('400000');
      setLaptopModel('Apple MacBook Pro 16" (M3 Max, 64GB RAM, 2TB SSD)');
    } else {
      setFullName('Aditya Kulkarni');
      setPersonalEmail('aditya.kulkarni@gmail.com');
      setDesignation('Lead Full-Stack Developer');
      setDepartment('Core Products & Experiences');
      setReportingManager('Elena Rostova');
      setWorkLocation('Remote (India)');
      setAnnualSalaryInr('2600000');
      setJoiningBonusInr('200000');
      setLaptopModel('Dell XPS 15 (Intel Core i9 14th Gen, 64GB RAM, 2TB SSD)');
    }
  };

  // Handle Form Submission: Provision credentials, allocate hardware & perks, dispatch dummy mail
  const handleProvisionOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      personalInfo: {
        fullName,
        personalEmail,
        phoneNumber,
        dateOfJoining,
        designation,
        department,
        reportingManager,
        workLocation,
        annualSalaryInr: parseFloat(annualSalaryInr) || 2400000.0,
        panCardNumber,
        aadhaarNumber
      },
      equipment: {
        laptopModel,
        monitors,
        peripherals,
        securityKey,
        welcomeSwagKit,
        courierPartner
      },
      perks: {
        joiningBonusInr: parseFloat(joiningBonusInr) || 250000.0,
        learningBudgetInr: parseFloat(learningBudgetInr) || 120000.0,
        healthInsuranceInr: parseFloat(healthInsuranceInr) || 1500000.0,
        homeOfficeAllowanceInr: parseFloat(homeOfficeAllowanceInr) || 50000.0,
        monthlyMealAllowanceInr: parseFloat(monthlyMealAllowanceInr) || 4500.0,
        paidTimeOffDays: parseInt(paidTimeOffDays, 10) || 28
      },
      submittedByUserId: user?.id || 'usr-hr-02',
      submittedByName: user?.name || 'Elena Rostova',
      submittedByRole: 'HR_MANAGER'
    };

    try {
      const res = await fetch('/api/onboarding/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const result = await res.json();
        setSubmissionSuccess(result);
        await fetchAllData();
        if (result.dispatchedEmail) {
          setSelectedMail(result.dispatchedEmail);
        }
      } else {
        const err = await res.json();
        alert('Provisioning failed: ' + (err.detail || 'Server error'));
      }
    } catch (err) {
      console.error(err);
      alert('Network error connecting to onboarding engine');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 text-white border border-blue-900/50 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Enterprise People Operations Hub
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                ₹ INR Indian Enterprise Standard
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-cyan-400" />
              <span>Employee Onboarding & Credential Provisioning</span>
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Autonomous multi-agent onboarding orchestrator: Provision high-performance hardware, allocate joining bonuses and corporate perks (₹ INR), generate secure SSO credentials, and dispatch the official welcome package to employee personal mailboxes.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-right">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Onboarded Hires</div>
              <div className="text-lg font-black text-cyan-300">{rosterRecords.length}</div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-right">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Total Joining Bonuses</div>
              <div className="text-lg font-black text-emerald-400">
                ₹{(rosterRecords.reduce((acc, r) => acc + (r.perks?.joiningBonusInr || 250000), 0)).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10">
          <button
            onClick={() => setActiveTab('wizard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'wizard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Onboard New Employee & Allocate Resources</span>
          </button>

          <button
            onClick={() => setActiveTab('mailbox')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer relative ${
              activeTab === 'mailbox'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Mail className="w-4 h-4 text-amber-400" />
            <span>Employee Personal Mailbox Simulator</span>
            {mailboxMessages.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-900 text-[10px] font-black flex items-center justify-center">
                {mailboxMessages.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'roster'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building className="w-4 h-4 text-purple-400" />
            <span>Onboarded Personnel & Asset Roster ({rosterRecords.length})</span>
          </button>

          <button
            onClick={() => setShowRealEmailModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20"
          >
            <Send className="w-4 h-4 text-cyan-300" />
            <span>Dispatch Real Email via SMTP</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ONBOARDING WIZARD & RESOURCE ALLOCATOR */}
      {/* ========================================================================= */}
      {activeTab === 'wizard' && (
        <div className="space-y-6">
          
          {/* Quick Preset Selector */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-800">Quick-Fill Role & Resource Templates:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handlePresetSelect('cloud_arch')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-200"
              >
                Staff Cloud Architect (Bengaluru • ₹32L CTC • ₹2.5L Bonus)
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect('ai_engineer')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 transition border border-purple-200"
              >
                Staff AI Systems Engineer (Mumbai • ₹38L CTC • ₹4.0L Bonus)
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect('lead_dev')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200"
              >
                Lead Full-Stack Developer (Remote • ₹26L CTC • ₹2.0L Bonus)
              </button>
            </div>
          </div>

          <form onSubmit={handleProvisionOnboarding} className="space-y-6">
            
            {/* Section 1: Personal & Identity Information */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                <Users className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  1. Employee Information & Identity
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Rahul Verma"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Personal Mailbox Address *</label>
                  <input
                    type="email"
                    required
                    value={personalEmail}
                    onChange={(e) => setPersonalEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. rahul.verma@gmail.com"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Welcome email and credentials will be dispatched to this inbox.
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Contact *</label>
                  <input
                    type="text"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Job Designation *</label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Corporate Department *</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Platform Engineering & DevOps">Platform Engineering & DevOps</option>
                    <option value="AI Architecture & Machine Learning">AI Architecture & Machine Learning</option>
                    <option value="Information Security & Infrastructure">Information Security & Infrastructure</option>
                    <option value="Finance & Corporate Treasury">Finance & Corporate Treasury</option>
                    <option value="Customer Experience & Support">Customer Experience & Support</option>
                    <option value="People Operations & HR">People Operations & HR</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Joining (Day 1) *</label>
                  <input
                    type="date"
                    required
                    value={dateOfJoining}
                    onChange={(e) => setDateOfJoining(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reporting Manager *</label>
                  <input
                    type="text"
                    required
                    value={reportingManager}
                    onChange={(e) => setReportingManager(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Office / Work Hub *</label>
                  <select
                    value={workLocation}
                    onChange={(e) => setWorkLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Bengaluru Tech Corridor">Bengaluru Tech Corridor (Prestige Tech Cloud)</option>
                    <option value="Mumbai BKC Operations Hub">Mumbai BKC Operations Hub (One BKC)</option>
                    <option value="Hyderabad CyberCity Lab">Hyderabad CyberCity Lab (HITEC City)</option>
                    <option value="Remote (India)">Remote (India Flexible)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Annual Fixed CTC (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    value={annualSalaryInr}
                    onChange={(e) => setAnnualSalaryInr(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PAN Card Verification</label>
                  <input
                    type="text"
                    value={panCardNumber}
                    onChange={(e) => setPanCardNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Aadhaar Verification Number</label>
                  <input
                    type="text"
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Equipment & Hardware Allocations */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                <Laptop className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  2. Employee Hardware, Peripherals & Assets
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Allocated Workstation Laptop *</label>
                  <select
                    value={laptopModel}
                    onChange={(e) => setLaptopModel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Apple MacBook Pro 16&quot; (M3 Max, 36GB RAM, 1TB SSD)">
                      Apple MacBook Pro 16" (M3 Max, 36GB Unified Memory, 1TB SSD) - Space Black
                    </option>
                    <option value="Apple MacBook Pro 14&quot; (M3 Pro, 18GB RAM, 512GB SSD)">
                      Apple MacBook Pro 14" (M3 Pro, 18GB Unified Memory, 512GB SSD) - Silver
                    </option>
                    <option value="Dell XPS 15 (Intel Core i9 14th Gen, 64GB RAM, 2TB SSD)">
                      Dell XPS 15 Workstation (Intel Core i9 14th Gen, 64GB RAM, 2TB NVMe)
                    </option>
                    <option value="Lenovo ThinkPad P1 Gen 6 (Workstation 64GB RAM, RTX 4080)">
                      Lenovo ThinkPad P1 Gen 6 (Intel i7, 64GB RAM, RTX 4080 GPU)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monitors & Displays</label>
                  <input
                    type="text"
                    value={monitors}
                    onChange={(e) => setMonitors(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Peripherals & Audio</label>
                  <input
                    type="text"
                    value={peripherals}
                    onChange={(e) => setPeripherals(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hardware Security Key</label>
                  <input
                    type="text"
                    value={securityKey}
                    onChange={(e) => setSecurityKey(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Welcome Swag Package</label>
                  <input
                    type="text"
                    value={welcomeSwagKit}
                    onChange={(e) => setWelcomeSwagKit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Courier Logistics Partner</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={courierPartner}
                      onChange={(e) => setCourierPartner(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold border border-blue-200 shrink-0">
                      Tracking Auto-Generated
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Perks, Bonuses & Allowances (₹ INR) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    3. Joining Bonus, Perks & Employee Benefits (₹ INR)
                  </h2>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Confirmed Offer Terms
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                
                {/* Joining Bonus */}
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-emerald-950">Joining Bonus (₹ INR) *</label>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      Disbursed Month 1
                    </span>
                  </div>
                  <input
                    type="number"
                    required
                    value={joiningBonusInr}
                    onChange={(e) => setJoiningBonusInr(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-emerald-800 font-black text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-emerald-700 mt-1">
                    Directly deposited into salary bank account in 1st payroll cycle.
                  </p>
                </div>

                {/* Annual Learning Budget */}
                <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50">
                  <label className="font-bold text-blue-950 block mb-1">Annual Learning Allowance (₹ INR)</label>
                  <input
                    type="number"
                    value={learningBudgetInr}
                    onChange={(e) => setLearningBudgetInr(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-blue-800 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-blue-600 mt-1">
                    AWS, GCP, CKA & technical book reimbursements.
                  </p>
                </div>

                {/* Health Insurance */}
                <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50">
                  <label className="font-bold text-purple-950 block mb-1">Health Insurance Coverage (₹ INR)</label>
                  <input
                    type="number"
                    value={healthInsuranceInr}
                    onChange={(e) => setHealthInsuranceInr(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-purple-800 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-[10px] text-purple-600 mt-1">
                    Family floater sum insured (covers employee, spouse & parents).
                  </p>
                </div>

                {/* Home Office Setup */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <label className="font-bold text-slate-800 block mb-1">Home Office Setup Reimbursement (₹)</label>
                  <input
                    type="number"
                    value={homeOfficeAllowanceInr}
                    onChange={(e) => setHomeOfficeAllowanceInr(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    One-time ergonomic chair & standing desk allowance.
                  </p>
                </div>

                {/* Monthly Meal Card */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <label className="font-bold text-slate-800 block mb-1">Monthly Meal Card (₹ / month)</label>
                  <input
                    type="number"
                    value={monthlyMealAllowanceInr}
                    onChange={(e) => setMonthlyMealAllowanceInr(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Zomato / Sodexo Enterprise meal card credits.
                  </p>
                </div>

                {/* Paid Time Off */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <label className="font-bold text-slate-800 block mb-1">Annual Paid Leaves (PTO Days)</label>
                  <input
                    type="number"
                    value={paidTimeOffDays}
                    onChange={(e) => setPaidTimeOffDays(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Plus 12 gazetted Indian national holidays.
                  </p>
                </div>

              </div>
            </div>

            {/* Section 4: Live Corporate Credentials Preview */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-md">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                    4. Auto-Generated Corporate Credentials & Single Sign-On (SSO) Preview
                  </h2>
                </div>
                <span className="text-[11px] font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                  To Be Dispatched to {personalEmail || 'Personal Mailbox'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Corporate Work Email</div>
                  <div className="text-cyan-300 font-bold text-sm truncate">{generatedEmail}</div>
                  <div className="text-[10px] text-slate-500 mt-1 font-sans">Username: {generatedUsername}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Temporary Initial SSO Password</div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-amber-300 font-bold text-sm font-mono">
                      {showPassword ? 'EF#Welcome2026!k9Z' : '••••••••••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-white transition"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-sans">Forces password reset upon 1st login</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Single Sign-On (SSO) Portal</div>
                  <div className="text-blue-300 font-bold text-xs truncate">http://127.0.0.1:5173/login</div>
                  <div className="text-[10px] text-emerald-400 mt-1 font-sans flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>MFA & YubiKey Enrollment Enabled</span>
                  </div>
                </div>

              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-emerald-400" />
                  <span>Pre-Provisioned Apps: Google Workspace, GitHub Enterprise, Slack, Jira, Workday HCM</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Compliance: SOC2 Type II • ISO 27001 • DPDP Act (India)
                </div>
              </div>
            </div>

            {/* Bottom Actions Banner */}
            <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl border border-blue-700/40 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-cyan-300" />
                  Ready to Dispatch Onboarding Credentials & Welcome Package
                </h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  Spawns the 5-stage autonomous multi-agent onboarding DAG and transmits the welcome email to <strong>{personalEmail}</strong>.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition cursor-pointer shrink-0 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Orchestrating Multi-Agent Onboarding...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-cyan-200" />
                    <span>Authorize & Dispatch to Personal Mailbox</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Success Banner if Just Submitted */}
          {submissionSuccess && (
            <div className="p-6 bg-emerald-50 border-2 border-emerald-400 rounded-2xl shadow-sm text-emerald-950 animate-in fade-in">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base font-bold text-emerald-900">
                      Onboarding Package Successfully Dispatched!
                    </h3>
                    <p className="text-xs text-emerald-800 mt-1">
                      Credentials, joining bonus details (<strong>{submissionSuccess.perks?.joiningBonusInr ? `₹${submissionSuccess.perks.joiningBonusInr.toLocaleString('en-IN')}` : '₹2,50,000.00'}</strong>), and hardware tracking number (<strong>{submissionSuccess.equipment?.courierTrackingId}</strong>) have been delivered to <strong>{personalEmail}</strong>.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => setActiveTab('mailbox')}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Open Personal Mailbox Simulator to Read Email</span>
                      </button>
                      <button
                        onClick={() => onNavigate(`/workflows/${submissionSuccess.workflowId}`)}
                        className="px-4 py-2 bg-white hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl transition border border-emerald-300 flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Inspect Multi-Agent Execution DAG</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EMPLOYEE PERSONAL MAILBOX SIMULATOR */}
      {/* ========================================================================= */}
      {activeTab === 'mailbox' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Personal Mailbox Client Header */}
          <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-sm">
                M
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Candidate Personal Mailbox Simulator</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                    Live Webmail Delivery
                  </span>
                </h2>
                <div className="text-xs text-slate-500">
                  Recipient Inbox: <strong className="text-slate-800 font-mono">{personalEmail}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchAllData}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Inbox</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[580px]">
            
            {/* Left Col: Mailbox Inbox List */}
            <div className="border-r border-slate-200 bg-slate-50/50 p-4 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
                Delivered Onboarding Messages ({mailboxMessages.length})
              </div>

              {mailboxMessages.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No emails delivered yet. Fill out the wizard and click Dispatch to send credentials!
                </div>
              ) : (
                mailboxMessages.map((msg) => {
                  const isSelected = selectedMail?.id === msg.id;
                  return (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedMail(msg)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-blue-300 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-bold text-blue-700 font-mono">{msg.to}</span>
                        <span>{new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 leading-snug line-clamp-1">{msg.subject}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{msg.summary}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Col: Beautiful Authentic Rendered Corporate Welcome Email */}
            <div className="lg:col-span-2 p-6 overflow-y-auto">
              {selectedMail ? (
                <div className="space-y-6">
                  
                  {/* Email Header Meta */}
                  <div className="pb-4 border-b border-slate-200 space-y-2 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-base font-black text-slate-900 leading-snug">
                        {selectedMail.subject}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(selectedMail.sentAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="font-bold text-slate-700">From:</span>
                      <span className="font-mono">{selectedMail.from}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="font-bold text-slate-700">To:</span>
                      <span className="font-mono text-blue-700 font-bold">{selectedMail.to}</span>
                    </div>
                  </div>

                  {/* Corporate Branded Email Letterhead Body */}
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-6 text-xs text-slate-700 leading-relaxed">
                    
                    {/* Header Logo & Title */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                      <div>
                        <div className="text-lg font-black text-slate-900 tracking-tight">
                          EnterpriseFlow <span className="text-blue-600">AI</span> India Pvt. Ltd.
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          Bengaluru Tech Corridor & Mumbai BKC Hub
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        OFFICIAL ONBOARDING PACKAGE
                      </span>
                    </div>

                    {/* Welcome Greeting */}
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        Dear {selectedMail.employeeName || 'Colleague'},
                      </p>
                      <p className="mt-2">
                        Welcome to <strong>EnterpriseFlow AI India Pvt. Ltd.</strong>! We are thrilled to confirm your appointment as <strong>{selectedMail.designation || 'Staff Engineer'}</strong> in the <strong>{selectedMail.department || 'Platform Engineering'}</strong> team.
                      </p>
                      <p className="mt-1">
                        Your Day 1 commences on <strong>{selectedMail.dateOfJoining || '2026-11-15'}</strong> at our <strong>{selectedMail.workLocation || 'Bengaluru Tech Corridor'}</strong> hub under the supervision of <strong>{selectedMail.reportingManager || 'Alexander Sterling'}</strong>. Below are your official corporate credentials, hardware allocation, and confirmed compensation perks.
                      </p>
                    </div>

                    {/* Official Credentials Box */}
                    <div className="p-5 bg-slate-900 text-white rounded-xl shadow-md border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div className="font-bold text-amber-300 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                          <Key className="w-3.5 h-3.5 text-amber-400" />
                          <span>Official Corporate Access Credentials</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Employee ID: {selectedMail.employeeId}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                        <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Corporate Email</div>
                            <div className="text-cyan-300 font-bold mt-0.5">{selectedMail.corporateEmail}</div>
                          </div>
                          <button
                            onClick={() => handleCopy(selectedMail.corporateEmail, 'email')}
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
                            title="Copy email"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Initial Temporary Password</div>
                            <div className="text-amber-300 font-bold mt-0.5">{selectedMail.temporaryPassword}</div>
                          </div>
                          <button
                            onClick={() => handleCopy(selectedMail.temporaryPassword, 'pwd')}
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
                            title="Copy password"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-[11px] font-sans">
                        <span className="text-slate-300">
                          Single Sign-On (SSO) Portal: <strong className="text-blue-300 font-mono">{selectedMail.ssoPortalUrl}</strong>
                        </span>
                        <button
                          onClick={() => onNavigate('/login')}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition shrink-0 flex items-center gap-1"
                        >
                          <span>Log In to Corporate SSO</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Allocated Hardware & Logistics */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-xs">
                        <Truck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Allocated Hardware & Doorstep Shipment Tracking</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>Workstation: <strong className="text-slate-800">{selectedMail.laptopModel}</strong></div>
                        <div>Courier Partner: <strong className="text-slate-800">Bluedart Express Priority</strong></div>
                        <div>Tracking Number: <strong className="text-blue-700 font-mono">{selectedMail.courierTrackingId}</strong></div>
                        <div>Delivery Window: <strong className="text-emerald-700">Guaranteed Before Day 1</strong></div>
                      </div>
                    </div>

                    {/* Confirmed Perks & Joining Bonus */}
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2 text-emerald-950">
                      <div className="font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wider text-xs">
                        <Gift className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Confirmed Perks & Joining Bonus (₹ INR)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          Joining Bonus: <strong className="text-emerald-800 font-black text-sm">{selectedMail.joiningBonus}</strong>
                          <span className="text-[10px] text-emerald-700 block">Disbursed in 1st monthly payroll cycle</span>
                        </div>
                        <div>
                          Medical Floater Coverage: <strong className="text-slate-800">₹15,00,000.00</strong>
                        </div>
                        <div>
                          Annual Learning Budget: <strong className="text-slate-800">₹1,20,000.00 / year</strong>
                        </div>
                        <div>
                          Home Office Allowance: <strong className="text-slate-800">₹50,000.00</strong>
                        </div>
                      </div>
                    </div>

                    {/* First Day Orientation Schedule */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-xs">
                        <Calendar className="w-3.5 h-3.5 text-purple-600" />
                        <span>First-Day Orientation Schedule (09:30 AM IST)</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 text-xs">
                        <li><strong>09:30 AM IST:</strong> Welcome Breakfast & Executive Keynote with HR Lead</li>
                        <li><strong>11:00 AM IST:</strong> IT Security & Okta YubiKey Hardware Enrollment</li>
                        <li><strong>01:00 PM IST:</strong> Team Welcome Lunch (Hosted by {selectedMail.reportingManager})</li>
                        <li><strong>02:30 PM IST:</strong> Architecture Walkthrough & Production Access Verification</li>
                      </ul>
                    </div>

                    {/* Helpdesk Footer */}
                    <div className="pt-3 border-t border-slate-200 text-slate-500 text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>Need assistance? Contact People Operations at <strong className="text-slate-700">hr-ops@enterpriseflow.corp</strong></div>
                      <div>EnterpriseFlow AI India Pvt. Ltd. • All Rights Reserved</div>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16">
                  <Mail className="w-12 h-12 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">Select an email from the left pane to view</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ONBOARDED EMPLOYEES & ASSET ROSTER */}
      {/* ========================================================================= */}
      {activeTab === 'roster' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span>Onboarded Personnel & Hardware Tracking Roster</span>
              </h2>
              <p className="text-xs text-slate-500">Live roster of provisioned employee credentials and courier delivery states</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search by name, email or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-3">Employee ID & Name</th>
                  <th className="py-3 px-3">Corporate & Personal Email</th>
                  <th className="py-3 px-3">Designation & Dept</th>
                  <th className="py-3 px-3">Allocated Workstation</th>
                  <th className="py-3 px-3">Joining Bonus (₹)</th>
                  <th className="py-3 px-3">Courier Tracking</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rosterRecords
                  .filter((r) => {
                    const q = searchTerm.toLowerCase();
                    return (
                      r.personalInfo?.fullName?.toLowerCase().includes(q) ||
                      r.credentials?.corporateEmail?.toLowerCase().includes(q) ||
                      r.personalInfo?.designation?.toLowerCase().includes(q)
                    );
                  })
                  .map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">{rec.personalInfo?.fullName}</div>
                        <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-bold">
                          {rec.employeeId}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-mono">
                        <div className="text-cyan-700 font-bold">{rec.credentials?.corporateEmail}</div>
                        <div className="text-[10px] text-slate-400">{rec.personalInfo?.personalEmail}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-800">{rec.personalInfo?.designation}</div>
                        <div className="text-[10px] text-slate-500">{rec.personalInfo?.department}</div>
                      </td>

                      <td className="py-3.5 px-3 max-w-[200px]">
                        <div className="truncate font-medium text-slate-800">{rec.equipment?.laptopModel}</div>
                        <div className="text-[10px] text-slate-400">{rec.equipment?.monitors}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ₹{(rec.perks?.joiningBonusInr || 250000).toLocaleString('en-IN')}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-mono text-[10px] text-indigo-700 font-bold flex items-center gap-1">
                          <Truck className="w-3 h-3 text-indigo-500" />
                          <span>{rec.equipment?.courierTrackingId}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => {
                            setActiveTab('mailbox');
                            const match = mailboxMessages.find(m => m.employeeId === rec.employeeId);
                            if (match) setSelectedMail(match);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition border border-blue-200 cursor-pointer"
                        >
                          View Mail →
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <RealEmailModal
        isOpen={showRealEmailModal}
        onClose={() => setShowRealEmailModal(false)}
        candidateName={fullName}
        candidatePersonalEmail={personalEmail}
        corporateEmail={generatedEmail}
        joiningBonusInr={parseFloat(joiningBonusInr) || 250000}
        laptopModel={laptopModel}
      />
    </div>
  );
};

