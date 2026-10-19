import { DenominationCounts, DynamicPaymentField, ReconciliationFormState, ReconciliationTotals, TallyStatus } from '../types/reconciliation';

export const DENOMINATION_VALUES = [1000, 500, 200, 100, 50, 20, 10, 5] as const;

/**
 * Cleanly sanitizes inputs: converts NaN, empty strings, null, or undefined to 0.
 * Prevents NaN from ever leaking into UI or calculations.
 */
export function sanitizeNumber(val: unknown): number {
  if (typeof val === 'number') {
    return isNaN(val) || !isFinite(val) ? 0 : Math.round(val * 100) / 100;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return 0;
    const parsed = parseFloat(trimmed);
    return isNaN(parsed) || !isFinite(parsed) ? 0 : Math.round(parsed * 100) / 100;
  }
  return 0;
}

/**
 * Format currency with comma separation and Taka symbol (৳ by default, or Tk / custom)
 */
export function formatCurrency(amount: number, showSymbol = true, symbol = '৳'): string {
  const sanitized = sanitizeNumber(amount);
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(sanitized);
  
  if (!showSymbol) return formatted;
  return `${symbol} ${formatted}`;
}

/**
 * Calculates all reconciliation totals based on the business rules.
 */
export function calculateReconciliation(form: ReconciliationFormState): ReconciliationTotals {
  const displaySales = sanitizeNumber(form.displaySales);
  const posMachine = sanitizeNumber(form.posMachine);
  const mfsTotal = sanitizeNumber(form.mfsTotal);
  
  // Sum of dynamic non-cash fields
  const dynamicTotal = (form.dynamicFields || []).reduce((acc, field) => {
    return acc + sanitizeNumber(field.amount);
  }, 0);
  
  const totalNonCash = Math.round((posMachine + mfsTotal + dynamicTotal) * 100) / 100;
  
  // Physical cash from denominations + coins
  const dens = form.denominations || {
    1000: 0, 500: 0, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0, 5: 0, coins: 0
  };
  
  const notesCash = DENOMINATION_VALUES.reduce((sum, val) => {
    const count = sanitizeNumber(dens[val]);
    return sum + (val * count);
  }, 0);
  
  const coinsCash = sanitizeNumber(dens.coins);
  const totalPhysicalCash = Math.round((notesCash + coinsCash) * 100) / 100;
  
  // Adjustments
  const openingPettyCash = sanitizeNumber(form.openingPettyCash);
  const dailyExpenses = sanitizeNumber(form.dailyExpenses);
  
  // Net Cash Sales = (Physical Cash - Opening Petty Cash) + Daily Expenses
  const netCashSales = Math.round(((totalPhysicalCash - openingPettyCash) + dailyExpenses) * 100) / 100;
  
  // Total Calculated Sales = Net Cash Sales + Total Non-Cash
  const totalCalculatedSales = Math.round((netCashSales + totalNonCash) * 100) / 100;
  
  // Difference = Total Calculated Sales - Display Sales
  const difference = Math.round((totalCalculatedSales - displaySales) * 100) / 100;
  
  let status: TallyStatus = 'MATCHED';
  let statusText = 'Tally Matched';
  
  // Account for floating point epsilon
  if (Math.abs(difference) < 0.01) {
    status = 'MATCHED';
    statusText = 'Tally Matched';
  } else if (difference > 0) {
    status = 'SURPLUS';
    statusText = `Cash Surplus (+${formatCurrency(difference, true, '৳')})`;
  } else {
    status = 'SHORTAGE';
    statusText = `Cash Shortage (-${formatCurrency(Math.abs(difference), true, '৳')})`;
  }
  
  return {
    totalNonCash,
    totalPhysicalCash,
    netCashSales,
    totalCalculatedSales,
    difference,
    status,
    statusText,
  };
}
