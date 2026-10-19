import React from 'react';
import { DenominationCounts } from '../types/reconciliation';
import { DENOMINATION_VALUES, formatCurrency, sanitizeNumber } from '../utils/calculator';
import { 
  Banknote, 
  Coins, 
  RotateCcw,
  Plus,
  Minus
} from 'lucide-react';

interface DenominationCounterProps {
  denominations: DenominationCounts;
  onDenominationsChange: (dens: DenominationCounts) => void;
  totalPhysicalCash: number;
}

export const DenominationCounter: React.FC<DenominationCounterProps> = ({
  denominations,
  onDenominationsChange,
  totalPhysicalCash,
}) => {
  const handleCountChange = (val: typeof DENOMINATION_VALUES[number], countStr: string) => {
    const count = Math.max(0, Math.floor(sanitizeNumber(countStr)));
    onDenominationsChange({
      ...denominations,
      [val]: count,
    });
  };

  const handleAdjust = (val: typeof DENOMINATION_VALUES[number], delta: number) => {
    const current = denominations[val] || 0;
    const next = Math.max(0, current + delta);
    onDenominationsChange({
      ...denominations,
      [val]: next,
    });
  };

  const handleCoinsChange = (coinsStr: string) => {
    const coins = Math.max(0, sanitizeNumber(coinsStr));
    onDenominationsChange({
      ...denominations,
      coins,
    });
  };

  const handleResetNotes = () => {
    onDenominationsChange({
      1000: 0,
      500: 0,
      200: 0,
      100: 0,
      50: 0,
      20: 0,
      10: 0,
      5: 0,
      coins: 0,
    });
  };

  return (
    <div className="bg-white border border-[#E2EBE4] rounded-xl p-5 shadow-xs">
      {/* Header with live total */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#E2EBE4]">
        <div className="flex items-center gap-2">
          <Banknote className="w-5 h-5 text-[#2E6B42]" />
          <div>
            <h3 className="text-sm font-bold text-[#1A281F]">
              Physical Cash Denomination Counter
            </h3>
            <p className="text-xs text-[#5F7364]">
              Count currency notes and coins in cash drawer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetNotes}
            title="Reset drawer counts to 0"
            className="text-xs text-[#5F7364] hover:text-[#1A281F] flex items-center gap-1 px-2 py-1 hover:bg-[#F0F4F1] rounded transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>

          <div className="bg-[#F0F6F2] border border-[#CBDAD0] px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span className="text-xs text-[#5F7364] font-medium">Total Physical:</span>
            <span className="text-base font-bold font-mono-numbers text-[#2E6B42]">
              {formatCurrency(totalPhysicalCash)}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Banknotes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {DENOMINATION_VALUES.map((noteVal) => {
          const count = denominations[noteVal] || 0;
          const subtotal = noteVal * count;

          return (
            <div
              key={noteVal}
              className={`p-3 rounded-lg border transition-all ${
                count > 0 
                  ? 'bg-[#F7FAF8] border-[#A8C8B1] shadow-2xs' 
                  : 'bg-[#FAFCFA] border-[#E2EBE4] hover:border-[#CBDAD0]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="inline-flex items-center gap-1 font-bold text-sm text-[#1A281F]">
                  <span className="w-2 h-2 rounded-full bg-[#5A9E6F]" />
                  ৳ {noteVal}
                </span>
                <span className="text-[11px] font-mono-numbers text-[#5F7364]">
                  {count > 0 ? `× ${count}` : '0 pcs'}
                </span>
              </div>

              {/* Quantity input with stepper buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAdjust(noteVal, -1)}
                  disabled={count <= 0}
                  className="w-7 h-8 flex items-center justify-center bg-white border border-[#CBDAD0] rounded text-[#5F7364] hover:bg-[#F0F4F1] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Minus className="w-3 h-3" />
                </button>

                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  placeholder="0"
                  value={count === 0 ? '' : count}
                  onChange={(e) => handleCountChange(noteVal, e.target.value)}
                  className="w-full text-center bg-white border border-[#CBDAD0] rounded py-1 text-sm font-bold font-mono-numbers text-[#1A281F] focus:outline-none focus:ring-1 focus:ring-[#5A9E6F]"
                />

                <button
                  type="button"
                  onClick={() => handleAdjust(noteVal, 1)}
                  className="w-7 h-8 flex items-center justify-center bg-white border border-[#CBDAD0] rounded text-[#5F7364] hover:bg-[#F0F4F1]"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Subtotal calculation row */}
              <div className="mt-2 pt-1.5 border-t border-[#E2EBE4] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#5F7364]">Subtotal:</span>
                <span className={`font-mono-numbers font-semibold ${count > 0 ? 'text-[#2E6B42]' : 'text-[#8A9E90]'}`}>
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coins / Others Section */}
      <div className="mt-4 pt-4 border-t border-[#E2EBE4] bg-[#FAFCFA] p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#EBF3ED] flex items-center justify-center text-[#2E6B42]">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <label className="text-xs font-bold text-[#1A281F]">
              Coins & Loose Change
            </label>
            <p className="text-[11px] text-[#5F7364]">
              Total amount of loose change / coins
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-48 shrink-0">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#2E6B42]">৳</span>
          <input
            type="number"
            step="any"
            min="0"
            inputMode="decimal"
            placeholder="0"
            value={denominations.coins === 0 ? '' : denominations.coins}
            onChange={(e) => handleCoinsChange(e.target.value)}
            className="w-full bg-white border border-[#CBDAD0] rounded-md pl-8 pr-3 py-2 text-sm font-semibold font-mono-numbers text-[#1A281F] focus:outline-none focus:ring-2 focus:ring-[#5A9E6F] transition"
          />
        </div>
      </div>
    </div>
  );
};
