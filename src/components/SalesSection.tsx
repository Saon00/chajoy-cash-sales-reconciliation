import React from 'react';
import { DynamicPaymentField } from '../types/reconciliation';
import { formatCurrency, sanitizeNumber } from '../utils/calculator';
import { 
  Monitor, 
  CreditCard, 
  Smartphone, 
  Plus, 
  Trash2, 
  Layers
} from 'lucide-react';

interface SalesSectionProps {
  displaySales: number;
  onDisplaySalesChange: (val: number) => void;
  posMachine: number;
  onPosMachineChange: (val: number) => void;
  mfsTotal: number;
  onMfsTotalChange: (val: number) => void;
  dynamicFields: DynamicPaymentField[];
  onDynamicFieldsChange: (fields: DynamicPaymentField[]) => void;
  totalNonCash: number;
}

export const SalesSection: React.FC<SalesSectionProps> = ({
  displaySales,
  onDisplaySalesChange,
  posMachine,
  onPosMachineChange,
  mfsTotal,
  onMfsTotalChange,
  dynamicFields,
  onDynamicFieldsChange,
  totalNonCash,
}) => {
  const handleAddField = (presetName = '') => {
    const newField: DynamicPaymentField = {
      id: `dyn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: presetName || '',
      amount: 0,
    };
    onDynamicFieldsChange([...dynamicFields, newField]);
  };

  const handleUpdateField = (id: string, updates: Partial<DynamicPaymentField>) => {
    const updated = dynamicFields.map((f) => {
      if (f.id === id) {
        return { ...f, ...updates };
      }
      return f;
    });
    onDynamicFieldsChange(updated);
  };

  const handleRemoveField = (id: string) => {
    onDynamicFieldsChange(dynamicFields.filter((f) => f.id !== id));
  };

  return (
    <div className="bg-white border border-[#E2EBE4] rounded-xl p-5 shadow-xs space-y-6">
      {/* 1. Display Sales (Renamed as requested) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-[#1A281F] flex items-center gap-2">
            <Monitor className="w-4 h-4 text-[#2E6B42]" />
            <span>Display Sales</span>
            <span className="text-xs text-rose-500 font-bold">*</span>
          </label>
          <span className="text-xs text-[#5F7364]">POS Display Total</span>
        </div>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-[#2E6B42]">
            ৳
          </span>
          <input
            type="number"
            step="any"
            min="0"
            inputMode="decimal"
            placeholder="0"
            value={displaySales === 0 ? '' : displaySales}
            onChange={(e) => onDisplaySalesChange(sanitizeNumber(e.target.value))}
            className="w-full bg-[#FAFCFA] border border-[#CBDAD0] rounded-lg pl-9 pr-4 py-3 text-xl font-bold font-mono-numbers text-[#1A281F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A9E6F] focus:border-transparent transition"
          />
        </div>
        <p className="mt-1.5 text-xs text-[#5F7364]">
          Total sales figure recorded on the ordering display machine.
        </p>
      </div>

      <div className="border-t border-[#E2EBE4] pt-5">
        {/* Section Header with live subtotal */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#2E6B42]" />
            <h3 className="text-sm font-bold text-[#1A281F]">
              Non-Cash Collections
            </h3>
          </div>
          <div className="text-xs font-medium text-[#2E6B42] bg-[#F0F6F2] px-2.5 py-1 rounded-md flex items-center gap-1.5">
            <span>Total Non-Cash:</span>
            <span className="font-bold font-mono-numbers text-sm">
              {formatCurrency(totalNonCash)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* POS Machine Collection */}
          <div className="bg-[#FAFCFA] p-3.5 border border-[#E2EBE4] rounded-lg">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#1A281F] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#5A9E6F]" />
                <span>POS Machine Collection (Cards)</span>
              </label>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#2E6B42]">৳</span>
              <input
                type="number"
                step="any"
                min="0"
                inputMode="decimal"
                placeholder="0"
                value={posMachine === 0 ? '' : posMachine}
                onChange={(e) => onPosMachineChange(sanitizeNumber(e.target.value))}
                className="w-full bg-white border border-[#CBDAD0] rounded-md pl-8 pr-3 py-2 text-sm font-semibold font-mono-numbers text-[#1A281F] focus:outline-none focus:ring-2 focus:ring-[#5A9E6F] transition"
              />
            </div>
            <span className="text-[11px] text-[#5F7364] mt-1 block">Credit/Debit card settlement slips total</span>
          </div>

          {/* MFS Total Collection */}
          <div className="bg-[#FAFCFA] p-3.5 border border-[#E2EBE4] rounded-lg">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#1A281F] flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#5A9E6F]" />
                <span>MFS Total (bKash / Nagad / Rocket)</span>
              </label>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#2E6B42]">৳</span>
              <input
                type="number"
                step="any"
                min="0"
                inputMode="decimal"
                placeholder="0"
                value={mfsTotal === 0 ? '' : mfsTotal}
                onChange={(e) => onMfsTotalChange(sanitizeNumber(e.target.value))}
                className="w-full bg-white border border-[#CBDAD0] rounded-md pl-8 pr-3 py-2 text-sm font-semibold font-mono-numbers text-[#1A281F] focus:outline-none focus:ring-2 focus:ring-[#5A9E6F] transition"
              />
            </div>
            <span className="text-[11px] text-[#5F7364] mt-1 block">Mobile wallet collections total</span>
          </div>
        </div>

        {/* Dynamic Payment Fields */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5F7364] uppercase tracking-wider">
              Additional Non-Cash Channels
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleAddField('Foodpanda')}
                className="text-[11px] font-medium text-[#2E6B42] hover:bg-[#EBF3ED] px-2 py-0.5 rounded border border-[#CBDAD0]"
              >
                + Foodpanda
              </button>
              <button
                type="button"
                onClick={() => handleAddField('Pathao')}
                className="text-[11px] font-medium text-[#2E6B42] hover:bg-[#EBF3ED] px-2 py-0.5 rounded border border-[#CBDAD0]"
              >
                + Pathao
              </button>
              <button
                type="button"
                onClick={() => handleAddField()}
                className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-[#2E6B42] hover:bg-[#245434] px-2.5 py-1 rounded transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Channel</span>
              </button>
            </div>
          </div>

          {dynamicFields.length === 0 ? (
            <div className="bg-[#FAFCFA] border border-dashed border-[#CBDAD0] rounded-lg p-3 text-center text-xs text-[#5F7364]">
              No extra channels added. Click <span className="font-semibold text-[#2E6B42]">Add Channel</span> for Foodpanda, Corporate Pay, etc.
            </div>
          ) : (
            <div className="space-y-2">
              {dynamicFields.map((field, idx) => (
                <div 
                  key={field.id}
                  className="flex items-center gap-2 bg-[#FAFCFA] p-2 rounded-lg border border-[#E2EBE4]"
                >
                  <span className="text-xs font-mono text-[#5F7364] pl-1 w-5 shrink-0">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    placeholder="Channel Name (e.g. Foodpanda, Corporate Pay)"
                    value={field.name}
                    onChange={(e) => handleUpdateField(field.id, { name: e.target.value })}
                    className="flex-1 min-w-[140px] bg-white border border-[#CBDAD0] rounded px-2.5 py-1.5 text-xs text-[#1A281F] focus:outline-none focus:ring-1 focus:ring-[#5A9E6F]"
                  />
                  <div className="relative w-36 sm:w-44 shrink-0">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#2E6B42]">৳</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      inputMode="decimal"
                      placeholder="0"
                      value={field.amount === 0 ? '' : field.amount}
                      onChange={(e) => handleUpdateField(field.id, { amount: sanitizeNumber(e.target.value) })}
                      className="w-full bg-white border border-[#CBDAD0] rounded pl-6 pr-2 py-1.5 text-xs font-semibold font-mono-numbers text-[#1A281F] focus:outline-none focus:ring-1 focus:ring-[#5A9E6F]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveField(field.id)}
                    title="Delete channel"
                    className="p-1.5 text-[#5F7364] hover:text-rose-600 hover:bg-rose-50 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
