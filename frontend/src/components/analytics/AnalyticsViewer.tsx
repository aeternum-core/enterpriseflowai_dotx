import React from 'react';
import { BarChart3, Clock, CheckCircle2, ShieldAlert, Cpu, TrendingUp } from 'lucide-react';

export const AnalyticsViewer: React.FC = () => {
  return (
    <div className="space-y-6 font-sans">
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Governance Analytics & Cycle-Time Intelligence
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Telemetry on multi-agent execution performance, approval turnaround velocity, and policy enforcement compliance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Avg Agent Execution</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">1.8s</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">94.2% faster than manual intake</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Avg Human Decision SLA</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">3.4 hrs</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">Target SLA &lt; 24.0 hrs</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Automation Rate</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">82.6%</div>
          <div className="text-[11px] text-slate-500 mt-1">Low-risk tasks resolved autonomously</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Security Gate Integrity</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">100.0%</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">Zero unapproved high-risk executions</div>
        </div>
      </div>

      {/* Distribution Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Domain Distribution */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
            Workflow Volume by Domain
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Invoice Processing</span>
                <span className="font-semibold">38%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '38%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>IT Incident Response & PAM</span>
                <span className="font-semibold">24%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: '24%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Procurement & Vendor Onboarding</span>
                <span className="font-semibold">19%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '19%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Employee Onboarding</span>
                <span className="font-semibold">12%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '12%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Customer Operations</span>
                <span className="font-semibold">7%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '7%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Tier Allocation */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
            Operations by Risk Tier Classification
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span className="text-emerald-700 font-semibold">Low Risk (Fully Automated)</span>
                <span className="font-semibold">68%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span className="text-blue-700 font-semibold">Medium Risk (Department Head Sign-off)</span>
                <span className="font-semibold">16%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '16%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span className="text-amber-700 font-semibold">High Risk (Director Approval Mandatory)</span>
                <span className="font-semibold">11%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '11%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span className="text-rose-700 font-semibold">Critical Risk (VP / C-Level Authorization)</span>
                <span className="font-semibold">5%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

