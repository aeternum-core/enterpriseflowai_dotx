import React, { useState, useEffect } from 'react';
import { Agent, WorkflowType } from '../types';
import {
  Cpu,
  CheckCircle2,
  Activity,
  Layers,
  Sparkles,
  Users,
  FileText,
  Headphones,
  ShoppingCart,
  ShieldCheck,
  Search,
  Zap
} from 'lucide-react';

export const AgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');

  useEffect(() => {
    fetch('/api/agents')
      .then(res => res.json())
      .then(data => setAgents(data))
      .catch(console.error);
  }, []);

  const filteredAgents = agents.filter(a => {
    const s = search.toLowerCase();
    const matchesSearch = (a.name || '').toLowerCase().includes(s) ||
      (a.roleDescription || '').toLowerCase().includes(s) ||
      (a.capabilities || []).some(c => (c || '').toLowerCase().includes(s));
    const matchesDomain = selectedDomain === 'ALL' || a.workflowType === selectedDomain;
    return Boolean(matchesSearch && matchesDomain);
  });

  const getDomainInfo = (type: string) => {
    switch (type) {
      case 'GLOBAL':
        return { label: 'Central Core', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'EMPLOYEE_ONBOARDING':
        return { label: 'Employee Onboarding', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'INVOICE_PROCESSING':
        return { label: 'Invoice Processing', color: 'bg-teal-100 text-teal-800 border-teal-200' };
      case 'CUSTOMER_REQUEST_RESOLUTION':
        return { label: 'Customer Resolution', color: 'bg-pink-100 text-pink-800 border-pink-200' };
      case 'PROCUREMENT_VENDOR_ONBOARDING':
        return { label: 'Enterprise Procurement', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'IT_INCIDENT_ACCESS_GOVERNANCE':
        return { label: 'IT Incident & Access', color: 'bg-sky-100 text-sky-800 border-sky-200' };
      default:
        return { label: 'Specialized', color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-purple-600" />
              Agent Registry & Mesh
            </span>
            <span className="text-xs text-slate-400">31 Specialized AI Agents</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Autonomous Specialized Agents Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Decentralized execution agents collaborating under the Master Planner across HR, Finance, Procurement, Support, and IT.
          </p>
        </div>

        <div className="text-right">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold">
            Total Agents: {agents.length}
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search agents by capability, role, or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none"
          >
            <option value="ALL">All Domains</option>
            <option value="GLOBAL">Central Planner Core</option>
            <option value="EMPLOYEE_ONBOARDING">Employee Onboarding</option>
            <option value="INVOICE_PROCESSING">Invoice Processing</option>
            <option value="CUSTOMER_REQUEST_RESOLUTION">Customer Resolution</option>
            <option value="PROCUREMENT_VENDOR_ONBOARDING">Enterprise Procurement</option>
            <option value="IT_INCIDENT_ACCESS_GOVERNANCE">IT Incident & Access</option>
          </select>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map(agent => {
          const domain = getDomainInfo(agent.workflowType);
          const successRate = Math.round((agent.successfulExecutions / (agent.totalExecutions || 1)) * 100);

          return (
            <div
              key={agent.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${domain.color}`}>
                    {domain.label}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{agent.status}</span>
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-sm">
                  {agent.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-snug">
                  {agent.roleDescription}
                </p>

                {/* Capabilities Badges */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {agent.capabilities.map((cap, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Executions</div>
                  <div className="font-bold text-slate-800">{agent.totalExecutions}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Success</div>
                  <div className="font-bold text-emerald-600">{successRate}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Avg Latency</div>
                  <div className="font-bold text-blue-600">{agent.averageExecutionTimeMs} ms</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
