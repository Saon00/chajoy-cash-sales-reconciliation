import React, { useState } from 'react';
import { sanitizeNumber, formatCurrency } from '../utils/calculator';
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  ReceiptText, 
  FileText,
  Banknote,
  PiggyBank,
  WalletCards
} from 'lucide-react';

interface AdjustmentsSectionProps {
  openingPettyCash: number;
  onOpeningPettyCashChange: (val: number) => void;
  dailyExpenses: number;
  onDailyExpensesChange: (val: number) => void;
  expenseDetails: string;
  onExpenseDetailsChange: (details: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  
  // Extra Info: End of Day Cash Settlement & Next Day Float
  totalPhysicalCash: number;
  cashWithdrawal: number;
  onCashWithdrawalChange: (val: number) => void;
  nextDayPettyCash: number;
  onNextDayPettyCashChange: (val: number) => void;
}

export const AdjustmentsSection: React.FC<AdjustmentsSectionProps> = ({
  openingPettyCash,
  onOpeningPettyCashChange,
  dailyExpenses,
  onDailyExpensesChange,
  expenseDetails,
  onExpenseDetailsChange,
  notes,
  onNotesChange,
  totalPhysicalCash,
  cashWithdrawal,
  onCashWithdrawalChange,
  nextDayPettyCash,
  onNextDayPettyCashChange,
}) => {
  const handleAddExpenseTag = (tag: string) => {
    const trimmed = expenseDetails.trim();
    if (!trimmed) {
      onExpenseDetailsChange(tag);
    } else if (!trimmed.includes(tag)) {
      onExpenseDetailsChange(`${trimmed}, ${tag}`);
    }
  };

  // Custom Petty Cash state: when checked/active, editing petty cash won't alter cash withdrawal
  const [isCustomPettyCash, setIsCustomPettyCash] = useState<boolean>(false);

  // When manager changes withdrawal, update next day petty cash automatically if NOT in custom mode
  const handleWithdrawalChange = (valStr: string) => {
    const withdrawal = Math.max(0, sanitizeNumber(valStr));
    onCashWithdrawalChange(withdrawal);
    if (!isCustomPettyCash) {
      const calculatedPetty = Math.max(0, Math.round((totalPhysicalCash - withdrawal) * 100) / 100);
      onNextDayPettyCashChange(calculatedPetty);
    }
  };

  // When manager changes next day petty cash directly, DO NOT alter withdrawal!
  const handleNextDayPettyChange = (valStr: string) => {
    const petty = Math.max(0, sanitizeNumber(valStr));
    onNextDayPettyCashChange(petty);
    // Mark as custom so withdrawal amount is kept safe and untouched
    setIsCustomPettyCash(true);
  };

  // Toggle Custom Mode on/off
  const handleToggleCustomPetty = (checked: boolean) => {
    setIsCustomPettyCash(checked);
    if (!checked) {
      // Revert to auto calculation: Total Drawer - Withdrawal
      const calculatedPetty = Math.max(0, Math.round((totalPhysicalCash - cashWithdrawal) * 100) / 100);
      onNextDayPettyCashChange(calculatedPetty);
    }
  };

  const handleSetFloatPreset = (floatAmount: number) => {
    if (isCustomPettyCash) {
      onNextDayPettyCashChange(floatAmount);
    } else {
      const petty = Math.min(totalPhysicalCash, floatAmount);
      onNextDayPettyCashChange(petty);
      onCashWithdrawalChange(Math.max(0, Math.round((totalPhysicalCash - petty) * 100) / 100));
    }
  };

  return (
    <div className="bg-white border border-[#E2EBE4] rounded-xl p-5 shadow-xs space-y-6">
      {/* 1. Daily Adjustments Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E2EBE4]">
        <div className="flex items-center gap-2">
          <ReceiptText className="w-5 h-5 text-[#2E6B42]" />
          <div>
            <h3 className="text-sm font-bold text-[#1A281F]">
              Drawer Adjustments & Daily Expenses
            </h3>
            <p className="text-xs text-[#5F7364]">
              Opening float subtraction and daily bazar paid from till
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Opening Petty Cash */}
        <div className="bg-[#FAFCFA] p-4 border border-[#E2EBE4] rounded-lg">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-[#1A281F] flex items-center gap-1.5">
              <ArrowDownCircle className="w-4 h-4 text-amber-600" />
              <span>Opening Petty Cash (Float)</span>
            </label>
            <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
              Subtracted (−)
            </span>
          </div>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#2E6B42]">৳</span>
            <input
              type="number"
              step="any"
              min="0"
              inputMode="decimal"
              placeholder="0"
              value={openingPettyCash === 0 ? '' : openingPettyCash}
              onChange={(e) => onOpeningPettyCashChange(sanitizeNumber(e.target.value))}
              className="w-full bg-white border border-[#CBDAD0] rounded-md pl-8 pr-3 py-2 text-sm font-semibold font-mono-numbers text-[#1A281F] focus:outline-none focus:ring-2 focus:ring-[#5A9E6F] transition"
            />
          </div>
          <p className="text-[11px] text-[#5F7364] mt-2">
            Starting change placed in the cash drawer at opening.
          </p>
        </div>

        {/* Daily Expenses / Bazar */}
        <div className="bg-[#FAFCFA] p-4 border border-[#E2EBE4] rounded-lg">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-[#1A281F] flex items-center gap-1.5">
              <ArrowUpCircle className="w-4 h-4 text-[#2E7D32]" />
              <span>Daily Expenses / Bazar</span>
            </label>
            <span className="text-[11px] font-semibold text-[#2E7D32] bg-emerald-50 px-1.5 py-0.5 rounded">
              Added Back (+)
            </span>
          </div>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#2E6B42]">৳</span>
            <input
              type="number"
              step="any"
              min="0"
              inputMode="decimal"
              placeholder="0"
              value={dailyExpenses === 0 ? '' : dailyExpenses}
              onChange={(e) => onDailyExpensesChange(sanitizeNumber(e.target.value))}
              className="w-full bg-white border border-[#CBDAD0] rounded-md pl-8 pr-3 py-2 text-sm font-semibold font-mono-numbers text-[#1A281F] focus:outline-none focus:ring-2 focus:ring-[#5A9E6F] transition"
            />
          </div>
          <p className="text-[11px] text-[#5F7364] mt-2">
            Cash spent from drawer for store supplies, milk, ice, etc.
          </p>
        </div>
      </div>

      {/* Expense Details Input */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <label className="text-xs font-semibold text-[#1A281F] flex items-center gap-1.5">
            <ReceiptText className="w-3.5 h-3.5 text-[#5A9E6F]" />
            <span>Daily Bazar / Expense Details</span>
          </label>
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] text-[#5F7364] mr-1">Quick Add:</span>
            {['Fresh Milk', 'Ice Blocks', 'Fresh Mint & Lemons', 'Cleaning Supplies'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleAddExpenseTag(item)}
                className="text-[10px] font-medium text-[#2E6B42] hover:bg-[#EBF3ED] px-1.5 py-0.5 rounded border border-[#CBDAD0]"
              >
                +{item}
              </button>
            ))}
          </div>
        </div>
        <textarea
          rows={2}
          placeholder="e.g. Fresh Milk (৳500), Ice blocks (৳200), Lemons & Mint (৳150)"
          value={expenseDetails}
          onChange={(e) => onExpenseDetailsChange(e.target.value)}
          className="w-full bg-[#FAFCFA] border border-[#CBDAD0] rounded-lg p-2.5 text-xs text-[#1A281F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A9E6F] transition"
        />
      </div>

      {/* 2. End of Day Cash Settlement & Next Day Float (Requested Feature) */}
      <div className="border-t border-[#E2EBE4] pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <WalletCards className="w-4 h-4 text-[#2E6B42]" />
            <div>
              <h4 className="text-xs font-bold text-[#1A281F] uppercase tracking-wider">
                Closing Cash Handover & Next Day Float
              </h4>
              <p className="text-[11px] text-[#5F7364]">
                Total Drawer Cash: <strong className="font-mono-numbers text-[#2E6B42]">{formatCurrency(totalPhysicalCash)}</strong> (Distribute to Withdrawal & Tomorrow's Float)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-[#5F7364]">Quick Float:</span>
            {[1000, 1500, 2000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleSetFloatPreset(amt)}
                className="px-1.5 py-0.5 bg-[#F0F6F2] hover:bg-[#E3EFE6] text-[#2E6B42] font-medium rounded border border-[#CBDAD0] text-[10px]"
              >
                ৳{amt}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#F7FAF8] p-4 rounded-xl border border-[#CBDAD0]">
          {/* Cash Withdrawal (Bank / Owner Handover) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#1A281F] flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-[#2E6B42]" />
                <span>Cash Withdrawal (Bank/Owner)</span>
              </label>
              <span className="text-[10px] text-[#5F7364]">Deposit / Handover</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#2E6B42]">৳</span>
              <input
                type="number"
                step="any"
                min="0"
                inputMode="decimal"
                placeholder="0"
                value={cashWithdrawal === 0 ? '' : cashWithdrawal}
                onChange={(e) => handleWithdrawalChange(e.target.value)}
                className="w-full bg-white border border-[#CBDAD0] rounded-md pl-8 pr-3 py-2 text-sm font-bold font-mono-numbers text-[#1A281F] focus:outline-none focus:ring-2 focus:ring-[#5A9E6F] transition"
              />
            </div>
            <span className="text-[10px] text-[#5F7364] mt-1 block">
              Cash taken out of the till for owner handover or bank deposit.
            </span>
          </div>

          {/* Next Day Petty Cash (Tomorrow's Opening Float) */}
          <div className={`p-2.5 rounded-lg border transition ${isCustomPettyCash ? 'bg-amber-50/50 border-amber-200' : 'bg-transparent border-transparent'}`}>
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
              <label className="text-xs font-bold text-[#1A281F] flex items-center gap-1.5">
                <PiggyBank className="w-3.5 h-3.5 text-amber-600" />
                <span>Next Day Petty Cash (Tomorrow Float)</span>
              </label>

              <div className="flex items-center gap-1.5">
                {/* Custom Tick Option */}
                <label className="inline-flex items-center gap-1 cursor-pointer text-[10px] font-bold text-[#2E6B42] bg-white hover:bg-[#F0F6F2] px-2 py-0.5 rounded border border-[#CBDAD0] transition select-none shadow-2xs">
                  <input
                    type="checkbox"
                    checked={isCustomPettyCash}
                    onChange={(e) => handleToggleCustomPetty(e.target.checked)}
                    className="w-3 h-3 rounded text-[#2E6B42] focus:ring-[#5A9E6F] cursor-pointer accent-[#2E6B42]"
                  />
                  <span>Custom</span>
                </label>

                {/* Mode Badge */}
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  isCustomPettyCash 
                    ? 'text-amber-800 bg-amber-100 border border-amber-200' 
                    : 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                }`}>
                  {isCustomPettyCash ? 'Custom Amount' : 'Auto (Drawer − Withdrawal)'}
                </span>
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#2E6B42]">৳</span>
              <input
                type="number"
                step="any"
                min="0"
                inputMode="decimal"
                placeholder="0"
                value={nextDayPettyCash === 0 ? '' : nextDayPettyCash}
                onChange={(e) => handleNextDayPettyChange(e.target.value)}
                className={`w-full bg-white border rounded-md pl-8 pr-3 py-2 text-sm font-bold font-mono-numbers transition focus:outline-none focus:ring-2 focus:ring-[#5A9E6F] ${
                  isCustomPettyCash 
                    ? 'border-amber-300 text-amber-900 focus:border-amber-500' 
                    : 'border-[#CBDAD0] text-[#2E6B42]'
                }`}
              />
            </div>

            <div className="flex items-center justify-between mt-1 text-[10px] text-[#5F7364]">
              <span>
                {isCustomPettyCash 
                  ? 'Custom petty cash entered independently (withdrawal is NOT changed).' 
                  : 'Remaining cash kept inside till (Total Drawer − Withdrawal).'}
              </span>
              {isCustomPettyCash && (
                <button
                  type="button"
                  onClick={() => handleToggleCustomPetty(false)}
                  className="text-emerald-700 hover:underline font-semibold ml-2 shrink-0 cursor-pointer"
                >
                  Reset to Auto
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* General Remarks / Notes */}
      <div>
        <label className="text-xs font-semibold text-[#1A281F] flex items-center gap-1.5 mb-1.5">
          <FileText className="w-3.5 h-3.5 text-[#5A9E6F]" />
          <span>Shift Remarks (Optional)</span>
        </label>
        <textarea
          rows={2}
          placeholder="Shift notes, variance explanations, or register notes..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="w-full bg-[#FAFCFA] border border-[#CBDAD0] rounded-lg p-2.5 text-xs text-[#1A281F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A9E6F] transition"
        />
      </div>
    </div>
  );
};
