export type StoreBranch = 
  | 'Cha Joy - Badda - 1'
  | 'Cha Joy - Aftabnagar - 11';

export const STORE_BRANCHES: StoreBranch[] = [
  'Cha Joy - Badda - 1',
  'Cha Joy - Aftabnagar - 11',
];

export interface DenominationCounts {
  1000: number;
  500: number;
  200: number;
  100: number;
  50: number;
  20: number;
  10: number;
  5: number;
  coins: number;
}

export interface DynamicPaymentField {
  id: string;
  name: string;
  amount: number;
}

export type TallyStatus = 'MATCHED' | 'SHORTAGE' | 'SURPLUS';

export interface ReconciliationFormState {
  storeBranch: StoreBranch;
  closingDate: string; // YYYY-MM-DD
  managerName: string;
  shift: 'Morning' | 'Evening' | 'Full Day';
  
  // Sales
  displaySales: number;
  
  // Non-Cash
  posMachine: number;
  mfsTotal: number;
  dynamicFields: DynamicPaymentField[];
  
  // Physical Cash
  denominations: DenominationCounts;
  
  // Adjustments
  openingPettyCash: number;
  dailyExpenses: number;
  expenseDetails: string;
  
  // Closing Cash Distribution / Settlement (Extra Info)
  cashWithdrawal: number;     // Cash taken out for bank/owner handover
  nextDayPettyCash: number;   // Petty cash retained in drawer for next day
  
  notes?: string;
}

export interface ReconciliationTotals {
  totalNonCash: number;
  totalPhysicalCash: number;
  netCashSales: number;
  totalCalculatedSales: number;
  difference: number;
  status: TallyStatus;
  statusText: string;
}

export interface ClosingRecord {
  id: string;
  createdAt: string; // ISO string
  storeBranch: StoreBranch;
  closingDate: string; // YYYY-MM-DD
  managerName: string;
  shift: string;
  
  // Inputs
  displaySales: number;
  posMachine: number;
  mfsTotal: number;
  dynamicFields: DynamicPaymentField[];
  denominations: DenominationCounts;
  openingPettyCash: number;
  dailyExpenses: number;
  expenseDetails: string;
  
  // Closing Cash Distribution
  cashWithdrawal: number;
  nextDayPettyCash: number;
  
  notes?: string;
  
  // Calculated Totals
  totals: ReconciliationTotals;
  
  syncSource?: 'firestore' | 'local';
}
