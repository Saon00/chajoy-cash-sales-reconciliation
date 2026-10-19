import React, { useState } from 'react';
import { ReconciliationFormState, ReconciliationTotals } from '../types/reconciliation';
import { formatCurrency } from '../utils/calculator';
import { 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  FileDown, 
  Save, 
  Eye, 
  ChevronDown, 
  ChevronUp,
  Scale,
  Receipt,
  ArrowRight
} from 'lucide-react';

interface ReconciliationSummaryCardProps {
  form: ReconciliationFormState;
  totals: ReconciliationTotals;
  onSaveClosing: () => void;
  onExportPDF: () => void;
  onPreviewVoucher: () => void;
  isSaving: boolean;
}

export const ReconciliationSummaryCard: React.FC<ReconciliationSummaryCardProps> = ({
  form,
  totals,
  onSaveClosing,
  onExportPDF,
  onPreviewVoucher,
  isSaving,
}) => {
  const [showFormulaBreakdown, setShowFormulaBreakdown] = useState(true);

  const isMatched = totals.status === 'MATCHED';
  const isShortage = totals.status === 'SHORTAGE';
  const isSurplus = totals.status === 'SURPLUS';

  // Status Styling Configuration
  const statusConfig = {
    MATCHED: {
      border: 'border-[#2E7D32]',
      bg: 'bg-[#F2F8F3]',
      text: 'text-[#2E7D32]',
      icon: CheckCircle2,
      badgeBg: 'bg-[#2E7D32]',
      badgeText: 'text-white',
      desc: 'Cash drawer and digital collections match Display Sales exactly.',
    },
    SHORTAGE: {
      border: 'border-[#D32F2F]',
      bg: 'bg-[#FDF2F2]',
      text: 'text-[#D32F2F]',
      icon: TrendingDown,
      badgeBg: 'bg-[#D32F2F]',
      badgeText: 'text-white',
      desc: 'Physical cash drawer is short of the recorded Display Sales.',
    },
    SURPLUS: {
      border: 'border-[#E65100]',
      bg: 'bg-[#FFF8F0]',
      text: 'text-[#E65100]',
      icon: TrendingUp,
      badgeBg: 'bg-[#E65100]',
      badgeText: 'text-white',
      desc: 'Physical cash drawer has excess funds compared to Display Sales.',
    },
  }[totals.status];

  const StatusIcon = statusConfig.icon;

  return (
    <div className={`bg-white border-2 ${statusConfig.border} rounded-xl p-5 sm:p-6 shadow-sm transition-all duration-200 space-y-5`}>
      {/* Top Banner Status */}
      <div className={`${statusConfig.bg} rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-black/5`}>
        <div className="flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-full ${statusConfig.badgeBg} flex items-center justify-center text-white shrink-0 shadow-xs`}>
            <StatusIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-base font-extrabold tracking-wide uppercase ${statusConfig.text}`}>
                {totals.statusText}
              </span>
            </div>
            <p className="text-xs text-[#5F7364] mt-0.5">
              {statusConfig.desc}
            </p>
          </div>
        </div>

        {/* Tally Variance Amount */}
        <div className="text-right sm:self-center self-end pl-2">
          <span className="text-[11px] font-semibold text-[#5F7364] uppercase tracking-wider block">
            Variance (Diff)
          </span>
          <span className={`text-2xl sm:text-3xl font-extrabold font-mono-numbers ${statusConfig.text}`}>
            {isMatched 
              ? '৳ 0' 
              : (totals.difference > 0 
                  ? `+${formatCurrency(totals.difference)}` 
                  : `-${formatCurrency(Math.abs(totals.difference))}`)}
          </span>
        </div>
      </div>

      {/* KPI 4-Pillar Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#FAFCFA] border border-[#E2EBE4] rounded-lg p-3">
          <span className="text-[11px] font-semibold text-[#5F7364] block">1. Display Sales</span>
          <span className="text-base sm:text-lg font-bold font-mono-numbers text-[#1A281F]">
            {formatCurrency(form.displaySales)}
          </span>
          <span className="text-[10px] text-[#5F7364] block mt-0.5">Machine Target</span>
        </div>

        <div className="bg-[#FAFCFA] border border-[#E2EBE4] rounded-lg p-3">
          <span className="text-[11px] font-semibold text-[#5F7364] block">2. Net Cash Sales</span>
          <span className="text-base sm:text-lg font-bold font-mono-numbers text-[#2E6B42]">
            {formatCurrency(totals.netCashSales)}
          </span>
          <span className="text-[10px] text-[#5F7364] block mt-0.5">(Drawer − Float) + Bazar</span>
        </div>

        <div className="bg-[#FAFCFA] border border-[#E2EBE4] rounded-lg p-3">
          <span className="text-[11px] font-semibold text-[#5F7364] block">3. Total Non-Cash</span>
          <span className="text-base sm:text-lg font-bold font-mono-numbers text-[#1A281F]">
            {formatCurrency(totals.totalNonCash)}
          </span>
          <span className="text-[10px] text-[#5F7364] block mt-0.5">POS Cards + MFS + Channels</span>
        </div>

        <div className="bg-[#FAFCFA] border border-[#E2EBE4] rounded-lg p-3">
          <span className="text-[11px] font-semibold text-[#5F7364] block">4. Total Calculated</span>
          <span className="text-base sm:text-lg font-bold font-mono-numbers text-[#2E6B42]">
            {formatCurrency(totals.totalCalculatedSales)}
          </span>
          <span className="text-[10px] text-[#5F7364] block mt-0.5">Net Cash + Non-Cash</span>
        </div>
      </div>

      {/* Organized Audit Ledger Table */}
      <div className="border border-[#CBDAD0] rounded-xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => setShowFormulaBreakdown(!showFormulaBreakdown)}
          className="w-full flex items-center justify-between px-4 py-3 bg-[#F0F6F2] hover:bg-[#E7F0E9] text-xs font-bold text-[#2E6B42] transition"
        >
          <span className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#2E6B42]" />
            <span>Structured Daily Closing Audit Trail</span>
          </span>
          <div className="flex items-center gap-1.5 text-xs text-[#5F7364]">
            <span>{showFormulaBreakdown ? 'Hide Audit' : 'Show Audit'}</span>
            {showFormulaBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showFormulaBreakdown && (
          <div className="p-4 divide-y divide-[#E2EBE4] text-xs">
            {/* Step 1: Cash Reconciliation */}
            <div className="py-2.5 space-y-1.5">
              <div className="flex items-center justify-between font-bold text-[#1A281F]">
                <span className="text-[#2E6B42]">Step 1: Physical Cash Reconciliation</span>
                <span className="font-mono-numbers text-[#2E6B42]">{formatCurrency(totals.netCashSales)}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pl-3 text-[11px] text-[#5F7364]">
                <div className="flex justify-between sm:block">
                  <span>Gross Drawer Cash:</span>{' '}
                  <strong className="font-mono-numbers text-[#1A281F] ml-1">{formatCurrency(totals.totalPhysicalCash)}</strong>
                </div>
                <div className="flex justify-between sm:block">
                  <span>Less Float (Opening):</span>{' '}
                  <strong className="font-mono-numbers text-rose-600 ml-1">− {formatCurrency(form.openingPettyCash)}</strong>
                </div>
                <div className="flex justify-between sm:block">
                  <span>Add Bazar (Expenses):</span>{' '}
                  <strong className="font-mono-numbers text-[#2E7D32] ml-1">+ {formatCurrency(form.dailyExpenses)}</strong>
                </div>
              </div>
              <p className="text-[10px] text-[#5F7364] pl-3 italic">
                Formula: Net Cash Sales = (Gross Physical Cash − Opening Petty Cash) + Daily Expenses
              </p>
            </div>

            {/* Step 2: Non-Cash Reconciliation */}
            <div className="py-2.5 space-y-1.5">
              <div className="flex items-center justify-between font-bold text-[#1A281F]">
                <span className="text-[#2E6B42]">Step 2: Non-Cash Collections</span>
                <span className="font-mono-numbers text-[#1A281F]">{formatCurrency(totals.totalNonCash)}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pl-3 text-[11px] text-[#5F7364]">
                <div className="flex justify-between sm:block">
                  <span>POS Machine (Cards):</span>{' '}
                  <strong className="font-mono-numbers text-[#1A281F] ml-1">{formatCurrency(form.posMachine)}</strong>
                </div>
                <div className="flex justify-between sm:block">
                  <span>MFS (bKash/Nagad):</span>{' '}
                  <strong className="font-mono-numbers text-[#1A281F] ml-1">{formatCurrency(form.mfsTotal)}</strong>
                </div>
                <div className="flex justify-between sm:block">
                  <span>Delivery/Custom:</span>{' '}
                  <strong className="font-mono-numbers text-[#1A281F] ml-1">
                    {formatCurrency(totals.totalNonCash - form.posMachine - form.mfsTotal)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Step 3: Total Reconciled Sales */}
            <div className="py-2.5 flex items-center justify-between bg-[#FAFCFA] px-3 rounded-lg font-bold">
              <span className="text-[#1A281F]">Step 3: Total Reconciled Sales (Net Cash + Non-Cash)</span>
              <span className="font-mono-numbers text-sm text-[#2E6B42]">{formatCurrency(totals.totalCalculatedSales)}</span>
            </div>

            {/* Step 4: Final Tally Comparison */}
            <div className="pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3">
              <div>
                <span className="font-bold text-[#1A281F] block">
                  Step 4: Final Audit Balance vs Display Sales
                </span>
                <span className="text-[11px] text-[#5F7364]">
                  Total Calculated ({formatCurrency(totals.totalCalculatedSales)}) − Display Sales ({formatCurrency(form.displaySales)})
                </span>
              </div>
              <div className="text-right">
                <span className={`font-mono-numbers font-extrabold text-sm sm:text-base ${statusConfig.text}`}>
                  Difference: {totals.difference > 0 ? `+${formatCurrency(totals.difference)}` : (isMatched ? '৳ 0' : `-${formatCurrency(Math.abs(totals.difference))}`)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Action Buttons: Save Closing & Export PDF Slip */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
        {/* Preview Voucher Modal Button */}
        <button
          type="button"
          onClick={onPreviewVoucher}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#1A281F] bg-white hover:bg-neutral-50 border border-[#CBDAD0] rounded-lg transition"
        >
          <Eye className="w-4 h-4 text-[#5A9E6F]" />
          <span>Preview Slip</span>
        </button>

        {/* Export PDF Slip */}
        <button
          type="button"
          onClick={onExportPDF}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#2E6B42] bg-[#F0F6F2] hover:bg-[#E3EFE6] border border-[#A8C8B1] rounded-lg transition"
        >
          <FileDown className="w-4 h-4" />
          <span>Export PDF Slip</span>
        </button>

        {/* Save Daily Closing */}
        <button
          type="button"
          onClick={onSaveClosing}
          disabled={isSaving}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#2E6B42] hover:bg-[#245434] active:bg-[#1D442A] rounded-lg shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Daily Closing'}</span>
        </button>
      </div>
    </div>
  );
};
