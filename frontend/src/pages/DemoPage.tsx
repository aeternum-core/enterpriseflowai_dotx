import React, { useState } from 'react';
import {
  PlayCircle,
  Zap,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Users,
  FileText,
  Headphones,
  ShoppingCart,
  Sparkles,
  Terminal
} from 'lucide-react';

export const DemoPage: React.FC<{ onNavigateWorkflow: (id: string) => void }> = ({ onNavigateWorkflow }) => {
  const [isRunningScenario, setIsRunningScenario] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleLaunchScenario = async (scenarioId: string) => {
    setIsRunningScenario(scenarioId);
    setStatusMessage('Central Planner is constructing DAG execution plan...');
    try {
      const res = await fetch('/api/demo/trigger-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId })
      });
      if (res.ok) {
        const data = await res.json();
        setStatusMessage(`Scenario successfully launched! Redirecting to workflow ${data.workflow.id}...`);
        setTimeout(() => {
          onNavigateWorkflow(data.workflow.id);
        }, 800);
      }
    } catch (e) {
      console.error(e);
      setStatusMessage('Failed to trigger scenario.');
    } finally {
      setIsRunningScenario(null);
    }
  };

  const handleResetDatabase = async () => {
    if (!confirm('Are you sure you want to reset all workflows, tasks, and audit logs to original initial demo state?')) return;
    setIsResetting(true);
    try {
      await fetch('/api/demo/reset', { method: 'POST' });
      setStatusMessage('Database reset to initial demo state with preloaded workflows and approvals.');
    } catch (e) {
      console.error(e);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Hackathon Evaluation Center
            </span>
            <span className="text-xs text-slate-400">Section 12: Predefined Scenarios</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Autonomous Multi-Agent Demo Runner
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            One-click execution of mandatory enterprise workflows, human approval checkpoints, and self-healing agent failure recovery.
          </p>
        </div>

        <button
          onClick={handleResetDatabase}
          disabled={isResetting}
          className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{isResetting ? 'Resetting...' : 'Reset Demo State'}</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-blue-500 hover:text-blue-700">✕</button>
        </div>
      )}

      {/* Featured End-to-End Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Scenario 1: Executive Onboarding */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                Workflow A: Employee Onboarding
              </span>
              <span className="text-amber-600 font-bold text-[11px]">Checkpoint: IT Admin</span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Executive Engineering Hire Onboarding
            </h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Autonomous verification of identity, passport OCR, HRIS record creation, payroll setup, Okta identity, and sensitive <strong>AWS Production Root Access</strong> checkpoint requiring Admin sign-off.
            </p>
            <div className="mt-3 text-[11px] text-slate-400 font-mono">
              Agents: Employee Info → Doc Verify → HR Ops → Payroll → IT Provisioning → Comm Agent
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Candidate: Michael Chang (VP Eng)</span>
            <button
              onClick={() => handleLaunchScenario('onboarding_executive')}
              disabled={isRunningScenario !== null}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition cursor-pointer"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Launch Scenario</span>
            </button>
          </div>
        </div>

        {/* Scenario 2: ₹24,80,000 Datacenter Invoice */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-teal-300 transition">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-teal-100 text-teal-800 border border-teal-200">
                Workflow B: Invoice Processing
              </span>
              <span className="text-amber-600 font-bold text-[11px]">Checkpoint: Finance Mgr</span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              ₹24,80,000 Datacenter Transit Invoice
            </h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Multimodal Gemini OCR extraction, ledger duplicate collision scan, 3-way PO reconciliation, and <strong>high-value spend authorization gate (&gt; ₹5 Lakhs policy)</strong> before ERP wire release.
            </p>
            <div className="mt-3 text-[11px] text-slate-400 font-mono">
              Agents: Intake → Gemini Extract → Duplicate Detect → 3-Way Recon → Payment Settlement
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Vendor: Tata Communications Ltd</span>
            <button
              onClick={() => handleLaunchScenario('large_invoice_approval')}
              disabled={isRunningScenario !== null}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 flex items-center gap-1.5 transition cursor-pointer"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Launch Scenario</span>
            </button>
          </div>
        </div>

        {/* Scenario 3: Sev-1 CloudSQL Contention */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-sky-300 transition">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-sky-100 text-sky-800 border border-sky-200">
                Workflow E: IT Incident Response
              </span>
              <span className="text-rose-600 font-bold text-[11px]">Critical: Sev-1</span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Sev-1 Primary Database Lock Contention Outage
            </h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              SIEM alert ingestion, blast radius analysis, Gemini AI Root Cause Analysis, auto-remediation runbook recommendation, production quarantine approval, and SOC2 post-mortem report.
            </p>
            <div className="mt-3 text-[11px] text-slate-400 font-mono">
              Agents: Alert Detect → Classify → Gemini RCA → Access Mgmt → Runbook Resp → Reporting
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Cluster: Primary CloudSQL</span>
            <button
              onClick={() => handleLaunchScenario('sev1_cloud_incident')}
              disabled={isRunningScenario !== null}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 flex items-center gap-1.5 transition cursor-pointer"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Launch Scenario</span>
            </button>
          </div>
        </div>

        {/* Scenario 4: Customer SLA Escalation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-pink-300 transition">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-pink-100 text-pink-800 border border-pink-200">
                Workflow C: Customer Resolution
              </span>
              <span className="text-emerald-600 font-bold text-[11px]">Autonomous Resolution</span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Reliance Digital Systems 504 Timeout Escalation (₹45,000 Credit)
            </h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Urgent SLA classification, ARR customer data retrieval, knowledge base vector lookup, Gemini calibrated technical response synthesis with 98% confidence score, and customer credit adjustment.
            </p>
            <div className="mt-3 text-[11px] text-slate-400 font-mono">
              Agents: Classify → Cust Info → KB Retrieval → Gemini Resolution → Comm Agent
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Customer: Reliance Digital Systems</span>
            <button
              onClick={() => handleLaunchScenario('customer_sla_escalation')}
              disabled={isRunningScenario !== null}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-md shadow-pink-600/20 flex items-center gap-1.5 transition cursor-pointer"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Launch Scenario</span>
            </button>
          </div>
        </div>

      </div>

      {/* Special Highlight: Failure Injection & Autonomous Self-Healing Demo */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-black">
                Demonstration: Agent Failure Injection & Planner Self-Healing Replan
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Demonstrates Requirement 5 & 12: Injects an artificial 429 API rate-limit fault on an active specialized agent. The Central Planner Agent detects the failure, logs the incident, re-evaluates the DAG, and executes autonomous self-healing recovery.
            </p>
          </div>

          <button
            onClick={() => handleLaunchScenario('sev1_cloud_incident')}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 shrink-0 transition"
          >
            <Zap className="w-4 h-4" />
            <span>Run Incident & Replan Test</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mt-4">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <strong className="text-amber-400 block mb-0.5">1. Fault Injection:</strong>
            <span className="text-slate-300 text-[11px]">Worker pool rate-limit or timeout simulated on task.</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <strong className="text-cyan-400 block mb-0.5">2. Central Planner Replan:</strong>
            <span className="text-slate-300 text-[11px]">Planner re-routes task with exponential backoff & failover route.</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <strong className="text-emerald-400 block mb-0.5">3. Self-Healing Completion:</strong>
            <span className="text-slate-300 text-[11px]">Agent completes successfully and downstream DAG continues.</span>
          </div>
        </div>
      </div>

    </div>
  );
};
