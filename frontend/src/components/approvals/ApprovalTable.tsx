import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Shield,
  Bot,
  User,
  ArrowUpDown,
  SlidersHorizontal,
  DollarSign
} from 'lucide-react';
import { ApprovalItem } from '../../services/api';

interface ApprovalTableProps {
  items: ApprovalItem[];
  selectedItem: ApprovalItem | null;
  onSelectItem: (item: ApprovalItem) => void;
  onBulkApprove?: (selectedIds: string[]) => void;
  loading?: boolean;
}

export const ApprovalTable: React.FC<ApprovalTableProps> = ({
  items,
  selectedItem,
  onSelectItem,
  onBulkApprove,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter items
  const filtered = items.filter((item) => {
    if (domainFilter !== 'ALL' && item.domain !== domainFilter) return false;
    if (riskFilter !== 'ALL' && item.risk_level !== riskFilter) return false;
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (overdueOnly && !item.is_overdue) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q) ||
        item.requested_by_agent.toLowerCase().includes(q) ||
        (item.requesting_employee && item.requesting_employee.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((i) => i.id));
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col font-sans">
      {/* Controls & Filter Bar */}
      <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by title, ID, department or agent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          {/* Domain Filter */}
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="text-xs px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Domains</option>
            <option value="invoice">Invoice</option>
            <option value="it_incident">IT Incident & PAM</option>
            <option value="procurement">Procurement</option>
            <option value="customer">Customer Operations</option>
            <option value="onboarding">Employee Onboarding</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="text-xs px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CHANGES_REQUESTED">Changes Requested</option>
          </select>

          {/* Overdue Toggle */}
          <button
            onClick={() => setOverdueOnly(!overdueOnly)}
            className={`px-3 py-2 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-all ${
              overdueOnly
                ? 'bg-rose-50 text-rose-700 border-rose-300 font-semibold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${overdueOnly ? 'text-rose-600' : 'text-slate-400'}`} />
            <span>Overdue Only</span>
          </button>
        </div>

        {/* Bulk Action */}
        {selectedIds.length > 0 && onBulkApprove && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">
              {selectedIds.length} selected
            </span>
            <button
              onClick={() => onBulkApprove(selectedIds)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Bulk Approve ({selectedIds.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selectedIds.length === filtered.length}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="py-3 px-3">Request ID & Title</th>
              <th className="py-3 px-3">Domain</th>
              <th className="py-3 px-3">Requester & Dept</th>
              <th className="py-3 px-3">Financial Value</th>
              <th className="py-3 px-3">Due Date / SLA</th>
              <th className="py-3 px-3">Risk Level</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  Loading approval requests...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  No approval requests match current filters.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                const isChecked = selectedIds.includes(item.id);

                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/80 font-medium'
                        : item.is_overdue
                        ? 'bg-rose-50/30 hover:bg-rose-50/50'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4" onClick={(e) => toggleSelect(item.id, e)}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>

                    {/* Title & ID */}
                    <td className="py-3.5 px-3 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate">{item.title}</div>
                      <div className="text-[11px] font-mono text-slate-400">{item.id}</div>
                    </td>

                    {/* Domain */}
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 capitalize">
                        {item.domain.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Requester & Dept */}
                    <td className="py-3.5 px-3">
                      <div className="text-slate-800 font-medium flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{item.requesting_employee || item.requested_by_agent}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">{item.department}</div>
                    </td>

                    {/* Financial Amount */}
                    <td className="py-3.5 px-3 font-semibold text-slate-900">
                      {item.financial_amount && item.financial_amount > 0 ? (
                        new Intl.NumberFormat('en-US', { style: 'currency', currency: item.currency || 'USD' }).format(item.financial_amount)
                      ) : (
                        <span className="text-slate-400 font-normal">—</span>
                      )}
                    </td>

                    {/* Due Date & Overdue */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-700">
                          {item.due_date ? new Date(item.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'No deadline'}
                        </span>
                      </div>
                      {item.is_overdue && (
                        <div className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 mt-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          <span>OVERDUE</span>
                        </div>
                      )}
                    </td>

                    {/* Risk Badge */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.risk_level === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : item.risk_level === 'HIGH'
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : item.risk_level === 'MEDIUM'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {item.risk_level}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : item.status === 'CHANGES_REQUESTED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Action Arrow */}
                    <td className="py-3.5 px-3 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-400 inline" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center bg-slate-50/50">
        <div>Showing {filtered.length} of {items.length} total approval requests</div>
        <div className="text-slate-400">Click any row to open the Right-Side Human Governance Drawer</div>
      </div>
    </div>
  );
};

