import React from 'react';
import { ClosingRecord } from '../types/reconciliation';
import { formatCurrency } from '../utils/calculator';
import { downloadClosingPDF } from '../utils/pdfGenerator';
import { CHA_JOY_LOGO_BASE64 } from '../utils/logoBase64';
import { 
  X, 
  FileDown, 
  Printer, 
  WalletCards
} from 'lucide-react';

interface VoucherPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: ClosingRecord | null;
}

export const VoucherPreviewModal: React.FC<VoucherPreviewModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  if (!isOpen || !record) return null;

  const isMatched = record.totals.status === 'MATCHED';
  const isShortage = record.totals.status === 'SHORTAGE';
  const isSurplus = record.totals.status === 'SURPLUS';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slip Container */}
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-[#E2EBE4] overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Modal Top Actions */}
        <div className="px-5 py-3 bg-[#FAFCFA] border-b border-[#E2EBE4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1A281F]">Closing Voucher Slip</span>
            <span className="text-[11px] font-mono text-[#5F7364]">({record.id})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              title="Print voucher"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#1A281F] bg-white border border-[#CBDAD0] rounded hover:bg-neutral-50 transition"
            >
              <Printer className="w-3.5 h-3.5 text-[#5A9E6F]" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              onClick={() => downloadClosingPDF(record)}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-[#2E6B42] hover:bg-[#245434] rounded shadow-xs transition"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 text-[#5F7364] hover:text-[#1A281F] rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formatted Voucher Document */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-5 text-[#1A281F] bg-[#FAFCFA]">
          {/* Header Branding with Official Logo */}
          <div className="text-center pb-4 border-b border-dashed border-[#CBDAD0]">
            <img 
              src={CHA_JOY_LOGO_BASE64} 
              alt="Cha Joy - Ice Cream and Tea" 
              className="w-14 h-14 mx-auto object-contain rounded-full mb-1.5 shadow-2xs"
            />
            <h2 className="text-2xl font-black tracking-tight text-[#1A281F]">CHA JOY</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-[#5A9E6F]">
              Ice Cream and Tea
            </p>
            <p className="text-[11px] text-[#5F7364] mt-0.5">
              Daily Cash Drawer & Sales Reconciliation Voucher
            </p>
          </div>

          {/* Branch & Voucher Info */}
          <div className="bg-white p-3.5 rounded-lg border border-[#E2EBE4] grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[#5F7364] block text-[10px]">BRANCH:</span>
              <span className="font-bold text-[#1A281F]">{record.storeBranch}</span>
            </div>
            <div>
              <span className="text-[#5F7364] block text-[10px]">DATE:</span>
              <span className="font-bold text-[#1A281F]">{record.closingDate}</span>
            </div>
            <div>
              <span className="text-[#5F7364] block text-[10px]">MANAGER:</span>
              <span className="font-bold text-[#1A281F]">{record.managerName || 'Store In-Charge'}</span>
            </div>
            <div>
              <span className="text-[#5F7364] block text-[10px]">SHIFT:</span>
              <span className="font-bold text-[#1A281F]">{record.shift || 'Full Day'}</span>
            </div>
          </div>

          {/* Status Highlight Banner */}
          <div className={`p-3.5 rounded-lg text-center ${
            isMatched
              ? 'bg-[#EBF7EE] text-[#2E7D32] border border-[#A8C8B1]'
              : isShortage
              ? 'bg-[#FDF2F2] text-[#D32F2F] border border-[#FFCDD2]'
              : 'bg-[#FFF8F0] text-[#E65100] border border-[#FFE0B2]'
          }`}>
            <span className="text-xs font-extrabold uppercase tracking-wide block">
              {record.totals.statusText}
            </span>
            <span className="text-[11px] block mt-0.5 opacity-90">
              {isMatched
                ? 'All physical cash and digital sales match Display Sales.'
                : `Discrepancy Variance: ${formatCurrency(record.totals.difference)}`}
            </span>
          </div>

          {/* Financial Totals Table */}
          <div className="bg-white rounded-lg border border-[#E2EBE4] overflow-hidden text-xs">
            <div className="bg-[#F0F6F2] px-3.5 py-2 font-bold text-[#2E6B42] uppercase text-[10px] tracking-wider border-b border-[#E2EBE4]">
              Executive Financial Audit
            </div>
            <div className="divide-y divide-[#F0F4F1]">
              <div className="px-3.5 py-2 flex items-center justify-between">
                <span className="text-[#5F7364]">Display Sales:</span>
                <span className="font-mono-numbers font-bold text-[#1A281F]">{formatCurrency(record.displaySales)}</span>
              </div>
              <div className="px-3.5 py-2 flex items-center justify-between">
                <span className="text-[#5F7364]">Total Non-Cash Collections:</span>
                <span className="font-mono-numbers font-semibold text-[#1A281F]">{formatCurrency(record.totals.totalNonCash)}</span>
              </div>
              <div className="px-3.5 py-2 flex items-center justify-between">
                <span className="text-[#5F7364]">Gross Physical Cash in Drawer:</span>
                <span className="font-mono-numbers font-semibold text-[#1A281F]">{formatCurrency(record.totals.totalPhysicalCash)}</span>
              </div>
              <div className="px-3.5 py-2 flex items-center justify-between text-[#5F7364]">
                <span>Less: Opening Petty Cash (Float):</span>
                <span className="font-mono-numbers text-rose-600">− {formatCurrency(record.openingPettyCash)}</span>
              </div>
              <div className="px-3.5 py-2 flex items-center justify-between text-[#5F7364]">
                <span>Add: Daily Expenses / Bazar:</span>
                <span className="font-mono-numbers text-emerald-700">+ {formatCurrency(record.dailyExpenses)}</span>
              </div>
              <div className="px-3.5 py-2 flex items-center justify-between bg-[#F7FAF8] font-bold">
                <span className="text-[#2E6B42]">Net Cash Sales:</span>
                <span className="font-mono-numbers text-[#2E6B42]">{formatCurrency(record.totals.netCashSales)}</span>
              </div>
              <div className="px-3.5 py-2 flex items-center justify-between bg-[#EBF3ED] font-bold text-sm">
                <span className="text-[#2E6B42]">Total Calculated Sales:</span>
                <span className="font-mono-numbers text-[#2E6B42]">{formatCurrency(record.totals.totalCalculatedSales)}</span>
              </div>
            </div>
          </div>

          {/* Cash Denominations Mini-Table */}
          <div className="bg-white rounded-lg border border-[#E2EBE4] overflow-hidden text-xs">
            <div className="bg-[#F0F6F2] px-3.5 py-2 font-bold text-[#2E6B42] uppercase text-[10px] tracking-wider border-b border-[#E2EBE4]">
              Cash Denomination Tally
            </div>
            <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[1000, 500, 200, 100, 50, 20, 10, 5].map((val) => {
                const count = (record.denominations as any)[val] || 0;
                return (
                  <div key={val} className="p-1.5 bg-[#FAFCFA] rounded border border-[#E2EBE4] text-[11px]">
                    <span className="font-bold text-[#1A281F]">৳ {val}:</span>{' '}
                    <span className="font-mono-numbers text-[#5F7364]">× {count}</span>
                    <div className="font-mono-numbers font-semibold text-[#2E6B42] text-right mt-0.5">
                      {formatCurrency(val * count)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-3.5 py-1.5 bg-[#F7FAF8] border-t border-[#E2EBE4] flex items-center justify-between text-xs">
              <span className="text-[#5F7364]">Coins & Small Change:</span>
              <span className="font-mono-numbers font-semibold text-[#1A281F]">{formatCurrency(record.denominations.coins || 0)}</span>
            </div>
          </div>

          {/* Non-Cash Channels Details */}
          {(record.posMachine > 0 || record.mfsTotal > 0 || (record.dynamicFields && record.dynamicFields.length > 0)) && (
            <div className="bg-white rounded-lg border border-[#E2EBE4] overflow-hidden text-xs">
              <div className="bg-[#F0F6F2] px-3.5 py-2 font-bold text-[#2E6B42] uppercase text-[10px] tracking-wider border-b border-[#E2EBE4]">
                Digital & Delivery Channels
              </div>
              <div className="p-3 space-y-1.5">
                {record.posMachine > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#5F7364]">POS Card Collection:</span>
                    <span className="font-mono-numbers font-semibold">{formatCurrency(record.posMachine)}</span>
                  </div>
                )}
                {record.mfsTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#5F7364]">MFS (bKash/Nagad/Rocket):</span>
                    <span className="font-mono-numbers font-semibold">{formatCurrency(record.mfsTotal)}</span>
                  </div>
                )}
                {record.dynamicFields?.map((f) => (
                  <div key={f.id} className="flex justify-between">
                    <span className="text-[#5F7364]">{f.name || 'Custom Channel'}:</span>
                    <span className="font-mono-numbers font-semibold">{formatCurrency(f.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cash Settlement & Next Day Float (Extra Info) */}
          <div className="bg-white p-3.5 rounded-lg border border-[#CBDAD0] text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#2E6B42]">
              <WalletCards className="w-3.5 h-3.5" />
              <span>Closing Cash Settlement & Next Day Float</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="bg-[#FAFCFA] p-2 rounded border border-[#E2EBE4]">
                <span className="text-[#5F7364] block">Cash Withdrawal (Bank/Owner):</span>
                <span className="font-mono-numbers font-bold text-sm text-[#1A281F]">
                  {formatCurrency(record.cashWithdrawal || 0)}
                </span>
              </div>
              <div className="bg-[#F2F8F3] p-2 rounded border border-[#A8C8B1]">
                <span className="text-[#2E6B42] font-semibold block">Next Day's Petty Cash Float:</span>
                <span className="font-mono-numbers font-bold text-sm text-[#2E6B42]">
                  {formatCurrency(record.nextDayPettyCash || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Expense details / Memo */}
          {record.expenseDetails && (
            <div className="bg-white p-3 rounded-lg border border-[#E2EBE4] text-xs">
              <span className="font-bold text-[#2E6B42] block mb-1">Daily Bazar Memo:</span>
              <p className="text-[#5F7364] italic">{record.expenseDetails}</p>
            </div>
          )}

          {/* Signatures */}
          <div className="pt-4 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="border-t border-[#CBDAD0] pt-2 font-bold text-[#1A281F]">
                Cashier / Shift Lead
              </div>
              <span className="text-[10px] text-[#5F7364]">Prepared & Counted</span>
            </div>
            <div>
              <div className="border-t border-[#CBDAD0] pt-2 font-bold text-[#1A281F]">
                {record.managerName || 'Store Manager'}
              </div>
              <span className="text-[10px] text-[#5F7364]">Verified & Approved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
