import React, { useState } from 'react';
import { ClosingRecord, STORE_BRANCHES, TallyStatus } from '../types/reconciliation';
import { formatCurrency } from '../utils/calculator';
import { downloadClosingPDF } from '../utils/pdfGenerator';
import { 
  X, 
  Search, 
  Filter, 
  FileDown, 
  Eye, 
  Trash2, 
  Calendar, 
  Store, 
  ArrowUpRight,
  Database,
  HardDrive
} from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  records: ClosingRecord[];
  onDeleteRecord: (id: string) => void;
  onViewRecord: (record: ClosingRecord) => void;
  onLoadRecordToForm: (record: ClosingRecord) => void;
  activeSource: 'firestore' | 'local';
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  records,
  onDeleteRecord,
  onViewRecord,
  onLoadRecordToForm,
  activeSource,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredRecords = records.filter((r) => {
    // Branch filter
    if (selectedBranch !== 'ALL' && r.storeBranch !== selectedBranch) {
      return false;
    }
    // Status filter
    if (statusFilter !== 'ALL' && r.totals.status !== statusFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchDate = r.closingDate.includes(q);
      const matchBranch = r.storeBranch.toLowerCase().includes(q);
      const matchManager = (r.managerName || '').toLowerCase().includes(q);
      const matchId = r.id.toLowerCase().includes(q);
      const matchNotes = (r.notes || '').toLowerCase().includes(q);
      return matchDate || matchBranch || matchManager || matchId || matchNotes;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 border-l border-[#E2EBE4] overflow-hidden">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[#E2EBE4] bg-[#FAFCFA] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2E6B42] flex items-center justify-center text-white text-sm font-bold">
              CJ
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A281F]">
                Daily Closing History
              </h2>
              <div className="flex items-center gap-2 text-xs text-[#5F7364]">
                <span>{records.length} records archived</span>
                <span>·</span>
                <span className="flex items-center gap-1 font-medium">
                  {activeSource === 'firestore' ? (
                    <>
                      <Database className="w-3 h-3 text-emerald-600" />
                      <span>Firestore Collection: 'cha_joy_daily_closings'</span>
                    </>
                  ) : (
                    <>
                      <HardDrive className="w-3 h-3 text-amber-600" />
                      <span>Local Device Storage (Firestore Ready)</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#5F7364] hover:text-[#1A281F] hover:bg-neutral-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 bg-white border-b border-[#E2EBE4] space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#5F7364] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by date (YYYY-MM-DD), branch, manager, or voucher ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAFCFA] border border-[#CBDAD0] rounded-lg pl-9 pr-4 py-2 text-xs text-[#1A281F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A9E6F] transition"
            />
          </div>

          {/* Branch & Status Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[#5F7364] font-medium mr-1">Branch:</span>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-[#FAFCFA] border border-[#CBDAD0] rounded px-2 py-1 text-xs text-[#1A281F] focus:outline-none focus:ring-1 focus:ring-[#5A9E6F]"
              >
                <option value="ALL">All Branches</option>
                {STORE_BRANCHES.map((b) => (
                  <option key={b} value={b}>{b.replace('Cha Joy - ', '')}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 text-xs">
              <span className="text-[#5F7364] font-medium mr-1">Status:</span>
              <div className="flex bg-[#F0F4F1] p-0.5 rounded border border-[#E2EBE4]">
                {(['ALL', 'MATCHED', 'SHORTAGE', 'SURPLUS'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                      statusFilter === st
                        ? 'bg-white text-[#1A281F] shadow-2xs font-bold'
                        : 'text-[#5F7364] hover:text-[#1A281F]'
                    }`}
                  >
                    {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Records List Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredRecords.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-[#5F7364]">
              <Calendar className="w-10 h-10 text-[#CBDAD0] mb-2" />
              <p className="text-sm font-semibold text-[#1A281F]">No Closing Records Found</p>
              <p className="text-xs text-[#5F7364] mt-1 max-w-sm">
                {searchQuery || selectedBranch !== 'ALL' || statusFilter !== 'ALL'
                  ? 'No records match your search criteria. Try resetting the filters.'
                  : 'Start by filling in today’s daily closing numbers and clicking "Save Daily Closing".'}
              </p>
            </div>
          ) : (
            filteredRecords.map((record) => {
              const isMatched = record.totals.status === 'MATCHED';
              const isShortage = record.totals.status === 'SHORTAGE';
              const isSurplus = record.totals.status === 'SURPLUS';

              return (
                <div
                  key={record.id}
                  className="bg-white border border-[#E2EBE4] hover:border-[#CBDAD0] rounded-xl p-4 shadow-2xs transition group"
                >
                  {/* Top Bar of Record */}
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#F0F4F1]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#1A281F]">
                          {record.storeBranch}
                        </span>
                        <span className="text-xs font-mono text-[#5F7364]">
                          {record.closingDate}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#5F7364] mt-0.5 flex items-center gap-2">
                        <span>Shift: {record.shift || 'Full Day'}</span>
                        <span>·</span>
                        <span>By: {record.managerName || 'Manager'}</span>
                        <span>·</span>
                        <span className="font-mono text-[10px]">{record.id}</span>
                      </div>
                    </div>

                    {/* Status Pill Badge */}
                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${
                          isMatched
                            ? 'bg-[#EBF7EE] text-[#2E7D32]'
                            : isShortage
                            ? 'bg-[#FDF2F2] text-[#D32F2F]'
                            : 'bg-[#FFF8F0] text-[#E65100]'
                        }`}
                      >
                        {record.totals.statusText}
                      </span>
                    </div>
                  </div>

                  {/* Financial Metrics Strip */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 my-1 text-xs">
                    <div>
                      <span className="text-[10px] text-[#5F7364] block">Display Sales</span>
                      <span className="font-mono-numbers font-semibold text-[#1A281F]">
                        {formatCurrency(record.displaySales)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#5F7364] block">Total Calculated</span>
                      <span className="font-mono-numbers font-semibold text-[#2E6B42]">
                        {formatCurrency(record.totals.totalCalculatedSales)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#5F7364] block">Physical Cash</span>
                      <span className="font-mono-numbers font-semibold text-[#1A281F]">
                        {formatCurrency(record.totals.totalPhysicalCash)}
                      </span>
                    </div>
                  </div>

                  {/* Notes / Expense Details preview if any */}
                  {record.expenseDetails && (
                    <p className="text-[11px] text-[#5F7364] bg-[#FAFCFA] px-2 py-1 rounded border border-[#F0F4F1] truncate mb-2">
                      <span className="font-medium text-[#1A281F]">Bazar:</span> {record.expenseDetails}
                    </p>
                  )}

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#F0F4F1] text-xs">
                    <button
                      type="button"
                      onClick={() => onLoadRecordToForm(record)}
                      className="text-[#2E6B42] hover:underline font-semibold inline-flex items-center gap-1"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Load into Form</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onViewRecord(record)}
                        title="View slip details"
                        className="p-1.5 text-[#5F7364] hover:text-[#1A281F] hover:bg-neutral-100 rounded transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadClosingPDF(record)}
                        title="Download PDF slip"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#2E6B42] bg-[#F0F6F2] hover:bg-[#E3EFE6] rounded transition"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete closing record ${record.id} for ${record.storeBranch} (${record.closingDate})?`)) {
                            onDeleteRecord(record.id);
                          }
                        }}
                        title="Delete record"
                        className="p-1.5 text-[#5F7364] hover:text-rose-600 hover:bg-rose-50 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#E2EBE4] bg-[#FAFCFA] flex items-center justify-between text-xs text-[#5F7364]">
          <span>Cha Joy Accounting System</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-semibold text-[#1A281F] bg-white border border-[#CBDAD0] rounded-lg hover:bg-neutral-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
