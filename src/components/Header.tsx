import React from 'react';
import { StoreBranch, STORE_BRANCHES } from '../types/reconciliation';
import { 
  Store, 
  Calendar, 
  History, 
  Database, 
  RotateCcw, 
  UserCheck
} from 'lucide-react';
import { CHA_JOY_LOGO_BASE64 } from '../utils/logoBase64';

interface HeaderProps {
  storeBranch: StoreBranch;
  onStoreBranchChange: (branch: StoreBranch) => void;
  closingDate: string;
  onClosingDateChange: (date: string) => void;
  managerName: string;
  onManagerNameChange: (name: string) => void;
  shift: 'Morning' | 'Evening' | 'Full Day';
  onShiftChange: (shift: 'Morning' | 'Evening' | 'Full Day') => void;
  onOpenHistory: () => void;
  onOpenFirebaseConfig: () => void;
  onResetForm: () => void;
  historyCount: number;
  isFirebaseActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  storeBranch,
  onStoreBranchChange,
  closingDate,
  onClosingDateChange,
  managerName,
  onManagerNameChange,
  shift,
  onShiftChange,
  onOpenHistory,
  onOpenFirebaseConfig,
  onResetForm,
  historyCount,
  isFirebaseActive,
}) => {
  return (
    <header className="bg-white border-b border-[#E2EBE4] sticky top-0 z-30 shadow-xs">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Wordmark & Official Cha Joy Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <img 
              src={CHA_JOY_LOGO_BASE64} 
              alt="Cha Joy - Ice Cream and Tea" 
              className="w-10 h-10 object-contain rounded-full shadow-xs bg-[#88B83D]/10 p-0.5"
            />
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold tracking-tight text-[#1A281F]">Cha Joy</span>
                <span className="text-xs text-[#5F7364] font-medium hidden sm:inline">Daily Cash & Sales Reconciliation</span>
              </div>
              <div className="text-[11px] text-[#5A9E6F] font-semibold hidden sm:block">
                Ice Cream and Tea · Store Closing Ledger
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Reset Form Button */}
            <button
              type="button"
              onClick={onResetForm}
              title="Reset all inputs to 0"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#5F7364] hover:text-[#1A281F] bg-white hover:bg-neutral-50 border border-[#E2EBE4] rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {/* Cloud Storage / Firebase Button */}
            <button
              type="button"
              onClick={onOpenFirebaseConfig}
              title="Firebase Cloud Firestore Configuration"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1A281F] bg-white hover:bg-neutral-50 border border-[#E2EBE4] rounded-md transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-[#5A9E6F]" />
              <span className="hidden sm:inline">Firebase</span>
              <span 
                className={`w-2 h-2 rounded-full ${isFirebaseActive ? 'bg-emerald-500' : 'bg-amber-400'}`} 
                title={isFirebaseActive ? 'Connected to Firestore' : 'Running on Local Storage'}
              />
            </button>

            {/* History Drawer Trigger */}
            <button
              type="button"
              onClick={onOpenHistory}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2E6B42] hover:bg-[#245434] active:bg-[#1D442A] rounded-md shadow-xs transition-colors shrink-0"
            >
              <History className="w-3.5 h-3.5" />
              <span>Closing History</span>
              {historyCount > 0 && (
                <span className="px-1.5 py-0.2 bg-[#5A9E6F] text-white text-[11px] rounded font-mono-numbers">
                  {historyCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Bar: Store (Badda - 1 first, then Aftabnagar - 11), Date, Shift, and Manager Inputs */}
      <div className="bg-[#F7FAF8] border-t border-[#E2EBE4] px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Store Selector: Badda - 1 first */}
          <div>
            <label className="block text-[11px] font-semibold text-[#5F7364] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-[#5A9E6F]" />
              <span>Store Branch</span>
            </label>
            <div className="relative">
              <select
                value={storeBranch}
                onChange={(e) => onStoreBranchChange(e.target.value as StoreBranch)}
                className="w-full bg-white border border-[#CBDAD0] text-[#1A281F] text-sm font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5A9E6F] focus:border-transparent transition"
              >
                {STORE_BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-[11px] font-semibold text-[#5F7364] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#5A9E6F]" />
              <span>Closing Date</span>
            </label>
            <input
              type="date"
              value={closingDate}
              onChange={(e) => onClosingDateChange(e.target.value)}
              className="w-full bg-white border border-[#CBDAD0] text-[#1A281F] text-sm font-medium rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#5A9E6F] focus:border-transparent transition"
            />
          </div>

          {/* Manager / Cashier Name */}
          <div>
            <label className="block text-[11px] font-semibold text-[#5F7364] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#5A9E6F]" />
              <span>Manager In-Charge</span>
            </label>
            <input
              type="text"
              value={managerName}
              placeholder="Enter manager name"
              onChange={(e) => onManagerNameChange(e.target.value)}
              className="w-full bg-white border border-[#CBDAD0] text-[#1A281F] text-sm font-medium rounded-md px-3 py-1.5 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#5A9E6F] focus:border-transparent transition"
            />
          </div>

          {/* Shift Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-[#5F7364] uppercase tracking-wider mb-1">
              Closing Shift
            </label>
            <div className="grid grid-cols-3 gap-1 bg-[#E8EFEA] p-1 rounded-md">
              {(['Morning', 'Evening', 'Full Day'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onShiftChange(s)}
                  className={`text-xs py-1 px-2 font-medium rounded transition-colors whitespace-nowrap ${
                    shift === s 
                      ? 'bg-white text-[#2E6B42] font-semibold shadow-xs' 
                      : 'text-[#5F7364] hover:text-[#1A281F]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
